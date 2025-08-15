// سكريبت لإعادة تعيين التعداد التسلسلي في جدول القادة
import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// تهيئة عميل Prisma مع توجيهه إلى قاعدة بيانات الإنتاج
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../data/production.db'
    }
  }
});

async function resetSequence() {
  console.log('🔄 بدء إعادة تعيين التعداد التسلسلي...');

  try {
    // فتح اتصال مباشر بقاعدة البيانات SQLite
    const db = await open({
      filename: './data/production.db',
      driver: sqlite3.Database
    });

    // 1. حفظ القادة الحاليين مع البيانات الكاملة
    const currentLeaders = await prisma.leaders.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📋 تم العثور على ${currentLeaders.length} قائد في قاعدة البيانات.`);

    // 2. تحديث الروابط في جدول الأشخاص
    const leadersMapping = {};
    for (let i = 0; i < currentLeaders.length; i++) {
      leadersMapping[currentLeaders[i].full_name] = currentLeaders[i].full_name;
    }

    // 3. حذف جميع القادة
    await db.run('DELETE FROM leaders');
    console.log('✅ تم حذف جميع القادة مؤقتاً.');

    // 4. إعادة تعيين التعداد التسلسلي
    await db.run('DELETE FROM sqlite_sequence WHERE name="leaders"');
    console.log('✅ تم إعادة تعيين التعداد التسلسلي.');

    // 5. إعادة إنشاء القادة بالتعداد الجديد
    for (const leader of currentLeaders) {
      await prisma.leaders.create({
        data: {
          full_name: leader.full_name,
          residence: leader.residence,
          phone: leader.phone,
          workplace: leader.workplace,
          center_info: leader.center_info,
          station_number: leader.station_number,
          votes_count: leader.votes_count,
        }
      });
    }

    console.log('✅ تم إعادة إنشاء القادة بالتعداد الجديد.');

    // 6. تحقق من النتيجة
    const updatedLeaders = await prisma.leaders.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    console.log('\n📊 القادة بعد إعادة التعيين:');
    for (const leader of updatedLeaders) {
      console.log(`ID: ${leader.id}, الاسم: ${leader.full_name}`);
    }

    await db.close();
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إعادة تعيين التعداد:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تنفيذ العملية
resetSequence()
  .then(() => console.log('✓ تمت العملية بنجاح'))
  .catch(console.error);
