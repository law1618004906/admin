/*
  scripts/import-excel.ts
  قراءة ملف Excel "قاعدة ناخب.xlsx" واستيرادها إلى القاعدة:
  1) إنشاء/تحديث القادة (leaders) حسب full_name
  2) إدراج الأشخاص (persons) وربطهم بـ leader_name
  خرائط الأعمدة المؤكدة:
    الاسم الكامل -> full_name
    السكن -> residence
    الهاتف -> phone
    العمل -> workplace
    معلومات المركز -> center_info
    رقم المحطة -> station_number
    عدد الأصوات -> votes_count
    اسم القائد -> leader_name
*/

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function asTextOrDefault(v: any): string {
  const s = (v ?? '').toString().trim();
  return s.length ? s : 'لايوجد';
}

async function main() {
  const excelPath = path.resolve(process.cwd(), 'قاعدة ناخب.xlsx'); // كان: data/قاعدة ناخب.xlsx
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at:', excelPath);
    process.exit(1);
  }

  const wb = XLSX.readFile(excelPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  // تنظيف الجداول قبل الاستيراد (اختياري: أبقيناه كما كان)
  console.log('Cleaning tables persons and leaders ...');
  await prisma.persons.deleteMany({});
  await prisma.leaders.deleteMany({});

  // استخراج أسماء القادة الفريدة واعتماد أول 10 كما سبق
  const uniqueLeaderNames: string[] = [];
  for (const r of rows) {
    const leaderNameRaw = r['اسم القائد'] ?? r['leader_name'] ?? r['القائد'] ?? '';
    const leaderName = asTextOrDefault(leaderNameRaw);
    if (leaderName !== 'لايوجد' && !uniqueLeaderNames.includes(leaderName)) {
      uniqueLeaderNames.push(leaderName);
    }
    if (uniqueLeaderNames.length >= 10) break;
  }

  console.log('Leaders to import:', uniqueLeaderNames);

  // إنشاء سجلات القادة بالأسماء فقط
  for (const ln of uniqueLeaderNames) {
    await prisma.leaders.create({
      data: {
        full_name: ln,
      },
    });
  }

  // خريطة تسريع: اسم القائد -> موجود
  const leaderSet = new Set(uniqueLeaderNames);

  let personsCount = 0;

  for (const r of rows) {
    const leaderNameRaw = r['اسم القائد'] ?? r['leader_name'] ?? r['القائد'] ?? '';
    const leaderName = asTextOrDefault(leaderNameRaw);

    // تجاهل أي شخص ليس تابعاً لأحد القادة العشرة المعتمدين
    if (!leaderSet.has(leaderName)) continue;

    const fullName = asTextOrDefault(r['الاسم الكامل'] ?? r['full_name'] ?? r['الاسم'] ?? '');
    const residence = asTextOrDefault(r['السكن'] ?? r['residence'] ?? '');
    const phone = asTextOrDefault(r['الهاتف'] ?? r['phone'] ?? '');
    const workplace = asTextOrDefault(r['جهة العمل'] ?? r['مكان العمل'] ?? r['workplace'] ?? '');
    const centerInfo = asTextOrDefault(r['معلومات المركز'] ?? r['المركز'] ?? r['center_info'] ?? '');
    const stationNumber = asTextOrDefault(r['رقم المحطة'] ?? r['station_number'] ?? '');
    const votesRaw = r['عدد الاصوات'] ?? r['عدد الأصوات'] ?? r['votes_count'] ?? r['votes'] ?? '';
    const votes = Number.isFinite(Number(votesRaw)) ? Number(votesRaw) : 0;

    await prisma.persons.create({
      data: {
        leader_name: leaderName,
        full_name: fullName,
        residence,
        phone,
        workplace,
        center_info: centerInfo,
        station_number: stationNumber,
        votes_count: votes,
      },
    });
    personsCount++;
  }

  console.log(`Imported leaders: ${uniqueLeaderNames.length}, persons: ${personsCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
