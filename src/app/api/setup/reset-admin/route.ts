import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../../../../lib/logger';

const db = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    logger.info('🔄 إعادة تعيين المستخدم الافتراضي');

    // حذف جميع المستخدمين الموجودين (إعادة تعيين كاملة)
    await db.user.deleteMany({});
    logger.info('🗑️ تم حذف جميع المستخدمين');

    // إنشاء المستخدم الافتراضي
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await db.user.create({
      data: {
        email: 'admin@hamidawi.com',
        username: 'admin',
        password: hashedPassword,
        name: 'مدير النظام',
        phone: '+970000000000',
        role: 'ADMIN',
        isActive: true
      }
    });

    logger.info('✅ تم إنشاء المستخدم الافتراضي بنجاح', {
      email: adminUser.email,
      name: adminUser.name
    });

    // التحقق من إنشاء المستخدم
    const verifyUser = await db.user.findUnique({
      where: { email: 'admin@hamidawi.com' }
    });

    if (!verifyUser) {
      throw new Error('فشل في التحقق من إنشاء المستخدم');
    }

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين المستخدم الافتراضي بنجاح',
      user: {
        email: adminUser.email,
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt
      },
      credentials: {
        email: 'admin@hamidawi.com',
        password: 'admin123',
        note: 'استخدم هذه البيانات لتسجيل الدخول'
      }
    });

  } catch (error) {
    logger.error('❌ فشل في إعادة تعيين المستخدم الافتراضي', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في إعادة تعيين المستخدم الافتراضي',
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // عرض المستخدمين الموجودين (للتشخيص)
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      message: users.length > 0 ? 'يوجد مستخدمين' : 'لا يوجد مستخدمين'
    });

  } catch (error) {
    logger.error('❌ فشل في جلب المستخدمين', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في جلب المستخدمين',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
