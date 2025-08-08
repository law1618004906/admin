# -*- coding: utf-8 -*-
import re
import sqlite3
import unicodedata
import os
from collections import defaultdict

DB = (
    'prisma/prisma/dev.db' if os.path.exists('prisma/prisma/dev.db') else
    ('prisma/dev.db' if os.path.exists('prisma/dev.db') else
     ('db/custom.db' if os.path.exists('db/custom.db') else 'dev.db'))
)

def strip_diacritics(s: str) -> str:
    if not s:
        return ''
    nfkd = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in nfkd if unicodedata.category(c) != 'Mn')

AR_DIGITS = dict(zip('٠١٢٣٤٥٦٧٨٩', '0123456789'))

def ar_to_en_digits(s: str) -> str:
    return ''.join(AR_DIGITS.get(ch, ch) for ch in s or '')

def normalize_ar_strong(s: str) -> str:
    if not s:
        return ''
    s = ar_to_en_digits(s)
    s = strip_diacritics(s)
    # توحيد الحروف
    s = s.replace('أ','ا').replace('إ','ا').replace('آ','ا')
    s = s.replace('ى','ي').replace('ة','ه')
    s = s.replace('ؤ','و').replace('ئ','ي')
    # إزالة كل شيء غير حروف عربية أو مسافة أو أرقام
    s = re.sub(r'[^ء-ي0-9\s]', ' ', s)
    # توحيد المسافات
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def main():
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # حمّل persons وبنِ قاموس بالتطبيع القوي
    cur.execute("SELECT id, full_name, phone FROM persons")
    persons = cur.fetchall()

    norm_to_persons = defaultdict(list)
    for pid, full_name, phone in persons:
        nf = normalize_ar_strong(full_name or '')
        if nf:
            norm_to_persons[nf].append((pid, full_name, phone))

    # حمّل individuals_phones
    cur.execute("SELECT name, phone FROM individuals_phones")
    ips = cur.fetchall()

    exact_matches = 0
    substring_matches = 0
    updates = 0

    # فهرس سريع للأسماء المطبعة لمطابقة contains
    all_norm_persons = list(norm_to_persons.keys())

    for name, phone in ips:
        if not name or not phone:
            continue
        nn = normalize_ar_strong(name)
        if not nn:
            continue

        # 1) تطابق تام
        candidates = norm_to_persons.get(nn, [])
        if candidates:
            exact_matches += len(candidates)
            for pid, full_name, cur_phone in candidates:
                # حدث فقط إذا رقم الشخص فارغ أو مختلف
                if not cur_phone or cur_phone.strip() == '' or cur_phone != phone:
                    cur.execute("UPDATE persons SET phone = ? WHERE id = ?", (phone, pid))
                    updates += cur.rowcount
            continue

        # 2) تطابق احتواء محدود: إذا nn يحتوي اسم شخص أو العكس
        # شرط: nn على الأقل كلمتين لتقليل الضوضاء
        if len(nn.split()) >= 2:
            hit = False
            for np in all_norm_persons:
                # نطلب أن يكون الطول قريباً: الفرق لا يزيد عن 10 حروف لتفادي التطابقات الخاطئة
                if abs(len(np) - len(nn)) > 10:
                    continue
                if nn in np or np in nn:
                    for pid, full_name, cur_phone in norm_to_persons[np]:
                        if not cur_phone or cur_phone.strip() == '' or cur_phone != phone:
                            cur.execute("UPDATE persons SET phone = ? WHERE id = ?", (phone, pid))
                            updates += cur.rowcount
                            hit = True
                    if hit:
                        substring_matches += 1
                        break

    con.commit()
    print("normalized_checked:", len(ips))
    print("exact_matches:", exact_matches)
    print("substring_matches:", substring_matches)
    print("normalized_updates:", updates)

    # اعرض عينة من التي لا تزال بدون هاتف
    cur.execute("SELECT COUNT(*) FROM persons WHERE phone IS NULL OR TRIM(phone) = ''")
    print("persons missing phone after update:", cur.fetchone()[0])

    cur.execute("SELECT full_name FROM persons WHERE phone IS NULL OR TRIM(phone) = '' LIMIT 5")
    print("sample missing persons:", [r[0] for r in cur.fetchall()])

    con.close()

if __name__ == "__main__":
    print("DB path:", DB)
    main()