import sqlite3
from pathlib import Path
p=Path(__file__).parent
db=sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
db.executescript((p/'schema.sql').read_text())
now=db.execute('SELECT unixepoch()').fetchone()[0]
for id,status,expiry in [('valid','verified',now+3600),('pending','pending',now+3600),('expired','verified',now-1)]:
    db.execute('INSERT INTO requests VALUES (?,?,?,?,?,?,?,?,?,?)',(id,'AB12XYZ',50000,'test@example.invalid',status,None,id,now+60,expiry,now))
for id,price,approved,permission,expiry in [('valid',40000,1,'synthetic',now+3600),('expensive',60000,1,'synthetic',now+3600),('unapproved',40000,0,'synthetic',now+3600),('unlicensed',40000,1,' ',now+3600),('expired',40000,1,'synthetic',now-1)]:
    db.execute('INSERT INTO authorised_listings VALUES (?,?,?,?,?,?,?)',(id,'AB12XYZ',price,'https://example.invalid',permission,approved,expiry))
for _ in range(2): db.executescript((p/'enqueue.sql').read_text())
assert db.execute('SELECT request_id,listing_id FROM alert_queue').fetchall()==[('valid','valid')]
db.execute("DELETE FROM requests WHERE id='valid'")
assert db.execute('SELECT count(*) FROM alert_queue').fetchone()[0]==0
print('Queue eligibility, duplicate prevention and cascade tests passed')
