import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const prisma = new PrismaClient();

// استيراد البيانات من قاعدة البيانات الخارجية إلى النظام
async function importElectionData() {
  console.log('🚀 بدء استيراد بيانات الانتخابات إلى النظام...');

  try {
    // فتح قاعدة البيانات الخارجية
    const db = await open({
      filename: './election_voters.sqlite',
      driver: sqlite3.Database
    });

    console.log('📂 تم فتح قاعدة بيانات الانتخابات');

    // 1. استيراد القادة
    console.log('\n👥 استيراد القادة...');
    const leadersData = await db.all('SELECT * FROM leaders');
    console.log(`📊 عدد القادة للاستيراد: ${leadersData.length}`);
    
    let leadersImported = 0;
    for (const leader of leadersData) {
      try {
        // التحقق من وجود القائد مسبقاً
        const existingLeader = await prisma.leaders.findFirst({
          where: { full_name: leader.name }
        });

        if (!existingLeader) {
          await prisma.leaders.create({
            data: {
              full_name: leader.name,
              residence: '', // فارغ كما ذكرت
              phone: '', // فارغ كما ذكرت
              workplace: '', // فارغ كما ذكرت
              center_info: '', // فارغ كما ذكرت
              station_number: '', // فارغ كما ذكرت
              votes_count: 0
            }
          });
          leadersImported++;
          console.log(`✅ تم إضافة القائد: ${leader.name}`);
        } else {
          console.log(`⚠️ القائد موجود مسبقاً: ${leader.name}`);
        }
      } catch (error) {
        console.error(`❌ خطأ في إضافة القائد ${leader.name}:`, error);
      }
    }

    // 2. استيراد الناخبين
    console.log('\n🗳️ استيراد الناخبين...');
    
    let totalVotersImported = 0;
    let totalVotersSkipped = 0;
    
    for (const leader of leadersData) {
      // البحث عن ناخبين هذا القائد مع تفاصيل المواقع والعمل
      const votersData = await db.all(`
        SELECT v.*, 
               l.name as leader_name,
               loc.name as location_name,
               wp.name as workplace_name
        FROM voters v 
        LEFT JOIN leaders l ON v.leader_id = l.id
        LEFT JOIN locations loc ON v.location_id = loc.id
        LEFT JOIN workplaces wp ON v.workplace_id = wp.id
        WHERE v.leader_id = ?
      `, [leader.id]);

      console.log(`\n🏷️ معالجة ناخبي القائد: ${leader.name} (${votersData.length} ناخب)`);
      
      let leaderVotersImported = 0;
      for (const voter of votersData) {
        try {
          // التحقق من وجود الناخب مسبقاً
          const existingVoter = await prisma.persons.findFirst({
            where: { 
              OR: [
                { full_name: voter.full_name },
                { phone: voter.phone }
              ]
            }
          });

          if (!existingVoter) {
            await prisma.persons.create({
              data: {
                leader_name: voter.leader_name,
                full_name: voter.full_name,
                residence: voter.location_name || '',
                phone: voter.phone || '',
                workplace: voter.workplace_name || '',
                center_info: voter.notes || '',
                station_number: '',
                votes_count: 0
              }
            });
            leaderVotersImported++;
            totalVotersImported++;
            
            if (totalVotersImported % 20 === 0) {
              console.log(`   ✅ تم استيراد ${totalVotersImported} ناخب حتى الآن...`);
            }
          } else {
            totalVotersSkipped++;
          }
        } catch (error) {
          console.error(`   ❌ خطأ في إضافة الناخب ${voter.full_name}:`, (error as any).message);
        }
      }
      
      console.log(`   ✅ تم استيراد ${leaderVotersImported} ناخب للقائد ${leader.name}`);
    }

    // 3. إحصائيات شاملة
    console.log('\n📈 نتائج الاستيراد:');
    console.log(`👥 إجمالي القادة المستوردين: ${leadersImported}`);
    console.log(`🗳️ إجمالي الناخبين المستوردين: ${totalVotersImported}`);
    console.log(`⚠️ إجمالي الناخبين المتجاهلين (موجودين مسبقاً): ${totalVotersSkipped}`);
    
    await db.close();
    await prisma.$disconnect();
    console.log('\n🎉 تم الانتهاء من استيراد البيانات!');

  } catch (error) {
    console.error('❌ خطأ في استيراد البيانات:', error);
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
importElectionData();
