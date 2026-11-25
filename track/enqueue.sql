-- Prototype scheduled matching; timestamps are Unix seconds.
INSERT OR IGNORE INTO alert_queue(request_id,listing_id,created_at)
SELECT r.id,l.id,unixepoch()
FROM requests r JOIN authorised_listings l ON l.registration=r.registration
WHERE r.status='verified' AND r.expires_at>unixepoch()
AND l.approved=1 AND length(trim(l.permission_ref))>0
AND l.expires_at>unixepoch() AND l.total_pence>0 AND l.total_pence<=r.budget_pence;
