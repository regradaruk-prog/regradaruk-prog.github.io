import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

test('built preview in Chromium', { timeout: 30000 }, async t => {
  const output = new URL('../preview-public/', import.meta.url);
  const downloads = await mkdtemp(join(tmpdir(), 'plateloft-test-'));
  const routes = new Map([
    ['/', 'index.html'],
    ['/plate-care', 'plate-care.html'],
    ['/plate-care.html', 'plate-care.html'],
  ]);
  t.after(() => rm(downloads, { recursive: true, force: true }));
  const origin = 'http://localhost';
  const browser = spawn(process.env.CHROMIUM || 'chromium', [
    '--headless', '--disable-background-networking',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost',
    '--remote-debugging-pipe', '--user-data-dir=' + join(downloads, 'profile'),
    ...(process.env.CHROMIUM_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
  ], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  const pending = new Map();
  const exceptions = [];
  const loaded = new Set();
  let serve;
  function fail(error) {
    for (const { reject } of pending.values()) reject(error);
    pending.clear();
  }
  browser.on('error', fail);
  browser.on('exit', code => fail(new Error('Chromium exited: ' + code)));
  browser.stdio[3].on('error', fail);
  t.after(() => browser.kill());
  let nextId = 0;
  let buffer = '';
  browser.stdio[4].setEncoding('utf8').on('data', chunk => {
    buffer += chunk;
    const parts = buffer.split('\0');
    buffer = parts.pop();
    for (const part of parts) {
      const message = JSON.parse(part);
      if (message.method === 'Fetch.requestPaused') {
        serve(message.params).catch(fail);
      }
      const request = pending.get(message.id);
      if (request) {
        pending.delete(message.id);
        if (message.error) request.reject(message.error);
        else request.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') {
        exceptions.push(message.params.exceptionDetails);
      }
      if (message.method === 'Page.lifecycleEvent' && message.params.name === 'load') {
        loaded.add(message.params.loaderId);
      }
    }
  });
  function send(method, params = {}, sessionId) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      browser.stdio[3].write(JSON.stringify({id, method, params, sessionId}) + '\0');
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  serve = async ({ requestId, request }) => {
    const url = new URL(request.url);
    const file = url.origin === origin && routes.get(url.pathname);
    await page('Fetch.fulfillRequest', {
      requestId,
      responseCode: file ? 200 : 404,
      responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }],
      body: file ? await readFile(new URL(file, output), 'base64') : '',
    });
  };
  await page('Fetch.enable');
  await page('Page.enable');
  await page('Page.setLifecycleEventsEnabled', { enabled: true });
  await page('Runtime.enable');
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await page('Emulation.setEmulatedMedia', { features: [{name: 'prefers-reduced-motion', value: 'reduce'}] });
  const evaluate = async expression => {
    const result = await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const current = () => evaluate('[...document.querySelectorAll("nav [aria-current]")].map(a => a.dataset.section)');
  const fits = () => evaluate('document.documentElement.scrollWidth === document.documentElement.clientWidth');
  async function until(check) {
    for (let i = 0; i < 100; i++) {
      if (await check()) return;
      await delay(25);
    }
    assert.fail('Timed out waiting for browser state');
  }
  async function open(path) {
    const result = await page('Page.navigate', { url: origin + path });
    assert.equal(result.errorText, undefined);
    await until(() => loaded.has(result.loaderId));
  }
  for (const width of [320, 390, 1280]) {
    await page('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false });
    await open('/#sell');
    assert.deepEqual(await current(), ['sell']);
    assert.equal(await fits(), true, 'Home fits at ' + width);
    await open('/plate-care#renew');
    assert.deepEqual(await current(), ['care']);
    assert.equal(await fits(), true, 'Plate Care fits at ' + width);
  }

  await page('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: false });
  await open('/');
  assert.deepEqual(await current(), ['market']);
  async function press(key, code, windowsVirtualKeyCode) {
    const params = { key, code, windowsVirtualKeyCode };
    await page('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
    await page('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
  }
  await press('Tab', 'Tab', 9);
  assert.equal(await evaluate('document.activeElement.className'), 'skiplink');
  await press('Enter', 'Enter', 13);
  assert.equal(await evaluate('document.activeElement.id'), 'q');
  await evaluate('document.querySelector("#q").value = "!!!"; document.querySelector("#f").requestSubmit()');
  assert.equal(await evaluate('location.search'), '');
  assert.match(await evaluate('document.querySelector("#searchStatus").textContent'), /letters or numbers/i);
  await evaluate('document.querySelector("[data-w=SARAH]").click()');
  assert.ok(await evaluate('document.querySelectorAll("#res .card").length') > 0);
  await evaluate('document.querySelector("#q").value = "S4 RAH"; document.querySelector("#f").requestSubmit()');
  assert.equal(await evaluate('document.querySelectorAll("#res .card").length'), 1);
  assert.equal(await evaluate('document.activeElement.id'), 'rt');
  assert.equal(await fits(), true, 'Search results fit at 320px');
  await evaluate('document.querySelector("[data-save]").click()');
  assert.equal(await evaluate('document.querySelector("[data-save]").getAttribute("aria-pressed")'), 'true');
  await open('/plate-care');
  assert.equal(await evaluate('document.querySelector("#savedCount").textContent'), '(1)');
  await press('Tab', 'Tab', 9);
  assert.equal(await evaluate('document.activeElement.className'), 'skiplink');
  await press('Enter', 'Enter', 13);
  assert.equal(await evaluate('document.activeElement.id'), 'plate-care-content');
  await open('/?q=S4+RAH#saved');
  assert.deepEqual(await current(), ['saved']);
  assert.equal(await evaluate('document.querySelectorAll("[data-remove]").length'), 1);
  await evaluate('document.querySelector("[data-remove]").click()');
  assert.equal(await evaluate('document.querySelector("[data-save]").getAttribute("aria-pressed")'), 'false');
  await evaluate('document.querySelector("#clearSearch").click()');
  assert.deepEqual(await current(), ['market']);
  assert.equal(await evaluate('location.search'), '');

  await open('/plate-care.html#inherit');
  assert.deepEqual(await current(), ['care']);
  await until(() => evaluate('!document.querySelector("#returnTop").hidden'));
  await evaluate('document.querySelector("#returnTop").click()');
  await until(() => evaluate('scrollY === 0 && document.querySelector("#returnTop").hidden'));
  assert.equal(await evaluate('document.activeElement.className'), 'logo');
  const dates = await evaluate(`(() => {
    const now = new Date();
    const day = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const offset = days => new Date(+day + days * 86400000).toISOString().slice(0, 10);
    return { past: offset(-1), near: offset(10), today: offset(0), future: offset(45), reminder: offset(15) };
  })()`);
  const submitDate = date => evaluate(`document.querySelector("#expiry").value = ${JSON.stringify(date)}; document.querySelector("#calendar").requestSubmit(); document.querySelector("#status").textContent`);
  assert.match(await submitDate(dates.past), /passed/);
  assert.match(await submitDate('10000-01-01'), /four-digit year/);
  for (const [date, expected] of [[dates.near, dates.today], [dates.future, dates.reminder]]) {
    assert.match(await submitDate(date), /Calendar file prepared/);
    await until(async () => (await readdir(downloads)).includes('plate-renewal.ics'));
    const file = join(downloads, 'plate-renewal.ics');
    const ics = await readFile(file, 'utf8');
    assert.match(ics, new RegExp('DTSTART;VALUE=DATE:' + expected.replaceAll('-', '') + '\\r\\n'));
    assert.match(ics, /DTSTAMP:\d{8}T\d{6}Z\r\n/);
    assert.match(ics, /END:VCALENDAR\r\n$/);
    await rm(file);
  }
  assert.deepEqual(exceptions, []);
});
