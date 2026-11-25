-- Prototype only. Apply to a test D1 database before any production use.
CREATE TABLE IF NOT EXISTS requests (
 id TEXT PRIMARY KEY, registration TEXT NOT NULL, budget_pence INTEGER NOT NULL CHECK(budget_pence>0),
 email TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','verified','cancelled')),
 verify_hash TEXT UNIQUE, manage_hash TEXT UNIQUE NOT NULL, verify_until INTEGER NOT NULL,
 expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS request_match ON requests(registration,status,expires_at);
CREATE TABLE IF NOT EXISTS authorised_listings (
 id TEXT PRIMARY KEY, registration TEXT NOT NULL, total_pence INTEGER NOT NULL CHECK(total_pence>0),
 source_url TEXT NOT NULL, permission_ref TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS alert_queue (
 request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
 listing_id TEXT NOT NULL REFERENCES authorised_listings(id) ON DELETE CASCADE,
 created_at INTEGER NOT NULL, sent_at INTEGER, PRIMARY KEY(request_id,listing_id)
);
