# -*- coding: utf-8 -*-
import re
import sqlite3
import os

# تحديد مسار قاعدة البيانات المتاح
DB = (
    'prisma/prisma/dev.db' if os.path.exists('prisma/prisma/dev.db') else
    ('prisma/dev.db' if os.path.exists('prisma/dev.db') else
     ('db/custom.db' if os.path.exists('db/custom.db') else 'dev.db'))
)

print('DB path:', DB)
con = sqlite3.connect(DB)
cur = con.cursor()

# 1) تصحيح name لاستخراج قيمة 'الاسم الكامل'
pat = re.compile(r"الاسم الكامل'\s*:\s*'([^']+)")
fixed = 0
rows = cur.execute('SELECT id, name FROM individuals_phones').fetchall()
for _id, raw in rows:
    raw = raw or ''
    m = pat.search(raw)
    if not m:
        continue
    real_name = m.group(1).strip()
    if not real_name:
        continue
    cur.execute('UPDATE individuals_phones SET name = ? WHERE id = ?', (real_name, _id))
    fixed += cur.rowcount
con.commit()
print('normalized names in individuals_phones:', fixed)

# 2) تحديث persons.phone بالمطابقة الحرفية
updated = 0
rows2 = cur.execute('SELECT name, phone FROM individuals_phones').fetchall()
for name, phone in rows2:
    if not name or not phone:
        continue
    cur.execute(
        'UPDATE persons SET phone = ? WHERE full_name = ? AND (phone IS NULL OR phone = "" OR phone != ?)',
        (phone, name, phone)
    )
    updated += cur.rowcount
con.commit()
print('persons phones updated by exact match:', updated)

# 3) إظهار عينة تحقق
cur.execute('SELECT COUNT(*) FROM persons WHERE phone IS NOT NULL AND TRIM(phone) != ""')
count_with_phone = cur.fetchone()[0]
print('persons with phone count:', count_with_phone)

cur.execute('SELECT full_name, phone FROM persons WHERE TRIM(phone) != "" LIMIT 10')
sample = cur.fetchall()
print('sample persons with phone:', sample)

con.close()