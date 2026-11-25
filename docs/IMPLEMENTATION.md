# Implementation gates — draft
Based on Claude's 25 November technical assessment and commercial risk review. Keep GitHub Pages initially; proposed Cloudflare Worker + D1 + Turnstile and Resend, subject to approval and current pricing verification. No provisioned resources.
## Phase 1
Homepage navigation and metadata, honest draft CTAs, local plate care calendar and printable checklist. Preserve generator. Review mobile and desktop before merge.
## Phase 2
Private wanted requests first. Server-side validation, Turnstile, rate limits, hashed random single-use verification tokens (48h), separate revocable manage tokens, 90-day expiry, delete/unsubscribe. No public demand data or email in URLs/logs. Private contact data separate from listing fields. No marketing opt-in by default.
## Phase 3
Seller declarations, format validation, duplicate checks, human review before publication, 60-day expiry, no certificate references/images, total mandatory price, seller type, report flow. Exact matching initially; name matching only after generator regression tests. No transaction funds.
## Launch gates
Owner approval, legal/privacy/ICO/OSA/HMRC review, backend configuration, secret management, email DNS, abuse tests, retention jobs, access controls, preview and end-to-end tests. Do not collect real customer data before approval. No public listing or alert claims until operational. No scraping or dealer imports without written permission. No paid plans or automatic upgrades.
## Later
Aggregate metrics, expiry and match jobs, email digests, owner exception dashboard, authorised CSV imports. Defer full dealer SaaS, valuation estimates, paid reminders, international launch and brand spend.
## Testing
Run node marketplace/core.test.mjs. Pure exact matching prototype only; not connected to site or backend. Browser and generator regression tests outstanding. Public repository: synthetic fixtures only.
