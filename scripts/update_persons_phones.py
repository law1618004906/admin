import sqlite3, os

DB = 'prisma/prisma/dev.db' if os.path.exists('prisma/prisma/dev.db') else ('prisma/dev.db' if os.path.exists('prisma/dev.db') else 'dev.db')
con = sqlite3.connect(DB)
cur = con.cursor()

# تأكد من وجود جدول المصدر
cur.execute('CREATE TABLE IF NOT EXISTS individuals_phones (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT UNIQUE)')

# حدّث فقط إن وُجدت الأعمدة المطلوبة في persons
cur.execute('PRAGMA table_info(persons)')
cols = {r[1] for r in cur.fetchall()}
updated = 0
if {'full_name','phone'}.issubset(cols):
    rows = cur.execute('SELECT name, phone FROM individuals_phones').fetchall()
    for name, phone in rows:
        cur.execute('UPDATE persons SET phone = ? WHERE full_name = ? AND (phone IS NULL OR phone = "" OR phone != ?)', (phone, name, phone))
        updated += cur.rowcount
    con.commit()
print('updated_persons_phones:', updated)
con.close()
