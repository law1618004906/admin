import re, sqlite3, os, unicodedata

DB = 'prisma/prisma/dev.db' if os.path.exists('prisma/prisma/dev.db') else ('prisma/dev.db' if os.path.exists('prisma/dev.db') else 'dev.db')

AR_MAP = {'أ':'ا','إ':'ا','آ':'ا','ى':'ي','ة':'ه','ؤ':'و','ئ':'ي'}
SPACE_RE = re.compile(r'\s+')
NON_AR_RE = re.compile(r'[^\u0621-\u064A\s]')

def strip_diacritics(s: str) -> str:
    return ''.join(ch for ch in unicodedata.normalize('NFD', s) if unicodedata.category(ch) != 'Mn')

def normalize_ar_name(s: str) -> str:
    if not s: return ''
    s = strip_diacritics(s)
    s = ''.join(AR_MAP.get(ch, ch) for ch in s)
    s = NON_AR_RE.sub(' ', s)
    s = SPACE_RE.sub(' ', s).strip()
    return s

con = sqlite3.connect(DB)
cur = con.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS individuals_phones (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT UNIQUE)')

src = cur.execute('SELECT name, phone FROM individuals_phones').fetchall()

cur.execute('PRAGMA table_info(persons)')
cols = {r[1] for r in cur.fetchall()}
if not {'id','full_name','phone'}.issubset(cols):
    print('Schema persons missing required columns; aborting'); con.close(); raise SystemExit(0)

db_rows = cur.execute('SELECT id, full_name FROM persons').fetchall()
norm_to_ids = {}
for pid, full_name in db_rows:
    n = normalize_ar_name(full_name)
    if not n: continue
    norm_to_ids.setdefault(n, []).append(pid)

updated = 0; checked = 0
for name, phone in src:
    checked += 1
    n = normalize_ar_name(name or '')
    if not n or not phone: continue
    ids = norm_to_ids.get(n)
    if not ids: continue
    for pid in ids:
        cur.execute('UPDATE persons SET phone = ? WHERE id = ? AND (phone IS NULL OR phone = "" OR phone != ?)', (phone, pid, phone))
        updated += cur.rowcount

con.commit()
print('normalized_checked:', checked)
print('normalized_updated:', updated)
con.close()
