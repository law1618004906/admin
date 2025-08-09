import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import logger from '@/lib/logger';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'manual' } = body;

    logger.info(`🔄 بدء عملية النسخ الاحتياطي - النوع: ${type}`);

    // إنشاء نسخة احتياطي من قاعدة البيانات
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `database_backup_${timestamp}.json`;
    const backupPath = join(process.cwd(), 'logs', backupFileName);

    // استخراج جميع البيانات المهمة
    const [users, persons, leaders, areas, activities] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      }),
      db.persons.findMany({
        select: {
          id: true,
          leader_name: true,
          full_name: true,
          phone: true,
          residence: true,
          workplace: true,
          center_info: true,
          station_number: true,
          votes_count: true,
          created_at: true,
          updated_at: true,
        }
      }),
      db.leaders.findMany({
        select: {
          id: true,
          full_name: true,
          residence: true,
          phone: true,
          workplace: true,
          center_info: true,
          station_number: true,
          votes_count: true,
          created_at: true,
          updated_at: true,
        }
      }),
      db.area.findMany({
        select: {
          id: true,
          title: true,
          titleAr: true,
          campaignId: true,
          createdAt: true,
        }
      }),
      db.activityLog.findMany({
        select: {
          id: true,
          userId: true,
          action: true,
          entityType: true,
          entityId: true,
          oldValues: true,
          newValues: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // آخر 1000 نشاط
      }),
    ]);

    const backupData = {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        type,
        source: 'end-admin-app',
        totalRecords: {
          users: users.length,
          persons: persons.length,
          leaders: leaders.length,
          areas: areas.length,
          activities: activities.length,
        }
      },
      data: {
        users,
        persons,
        leaders,
        areas,
        activities,
      }
    };

    // حفظ النسخة الاحتياطي محلياً
    await writeFile(backupPath, JSON.stringify(backupData, null, 2));

    logger.info(`✅ تم إنشاء النسخة الاحتياطي: ${backupFileName}`, {
      totalRecords: backupData.metadata.totalRecords,
      filePath: backupPath,
      type
    });

    // إحصائيات النسخة الاحتياطي
    const stats = {
      fileName: backupFileName,
      timestamp: backupData.metadata.createdAt,
      type,
      totalRecords: backupData.metadata.totalRecords,
      filePath: `/logs/${backupFileName}`,
      status: 'completed'
    };

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء النسخة الاحتياطي بنجاح',
      data: stats
    });

  } catch (error) {
    logger.error('❌ فشل في إنشاء النسخة الاحتياطي', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'فشل في إنشاء النسخة الاحتياطي',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json(
        { error: 'اسم الملف مطلوب' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'logs', fileName);
    
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      const backupData = JSON.parse(fileContent);

      logger.info(`📥 تم تنزيل النسخة الاحتياطي: ${fileName}`);

      return NextResponse.json({
        success: true,
        data: backupData
      });

    } catch (fileError) {
      logger.warn(`❌ لم يتم العثور على الملف: ${fileName}`);
      
      return NextResponse.json(
        { error: 'الملف غير موجود' },
        { status: 404 }
      );
    }

  } catch (error) {
    logger.error('❌ فشل في تنزيل النسخة الاحتياطي', error);
    
    return NextResponse.json(
      {
        error: 'فشل في تنزيل النسخة الاحتياطي',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
