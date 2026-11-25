# Track a Plate — implementation stage 1
Exact registration alerts first; name-based alerts deferred until matching quality is validated. Free to buyers. No live data, accounts, services or expenditure authorised by this commit.
Schema and pure validation/matching functions are prototypes. No public endpoint exists.
Next: Worker endpoint with strict origin checks, body limits, Turnstile verification and rate limiting; email provider with verified sender; single-use hashed verification token and revocable manage token; generic responses to prevent email enumeration; confirmation via POST (not link GET); expiry/deletion jobs; queue idempotency, retry and delivery failure handling; private database access. Never log email or tokens. Only match approved, licensed, fresh listings with complete prices. No alert if no inventory. 
Launch requires privacy notice, retention and consent review, legal assessment, configured secrets, tested unsubscribe and deletion, end-to-end tests, verified free-tier limits and owner approval. No marketing messages. No certificate references. Public repo: synthetic data only.
Run node track/core.test.mjs. No production migration or deployment yet.
