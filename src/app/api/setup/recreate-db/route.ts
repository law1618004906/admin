import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../../../../lib/logger';

const db = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    logger.info('🚀 إعادة إنشاء قاعدة البيانات من الصفر');

    // حذف جميع الجداول وإعادة إنشائها
    await db.$executeRaw`DROP TABLE IF EXISTS User;`;
    await db.$executeRaw`DROP TABLE IF EXISTS activityLog;`;
    await db.$executeRaw`DROP TABLE IF EXISTS Role;`;
    
    logger.info('🗑️ تم حذف الجداول القديمة');

    // إعادة إنشاء قاعدة البيانات باستخدام Prisma
    await db.$executeRaw`CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT,
      "username" TEXT,
      "phone" TEXT,
      "avatar" TEXT,
      "role" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "roleId" TEXT,
      FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`;

    await db.$executeRaw`CREATE TABLE "Role" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "nameAr" TEXT,
      "permissions" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`;

    await db.$executeRaw`CREATE TABLE "activityLog" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT,
      "action" TEXT NOT NULL,
      "entityType" TEXT NOT NULL,
      "entityId" TEXT,
      "oldValues" TEXT,
      "newValues" TEXT,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`;

    logger.info('🏗️ تم إنشاء الجداول الجديدة');

    // إنشاء المستخدم المدير
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.$executeRaw`INSERT INTO "User" (
      "id", "email", "password", "name", "username", "phone", "role", "isActive"
    ) VALUES (
      'admin-001', 'admin@hamidawi.com', ${hashedPassword}, 'مدير النظام', 'admin', '+970000000000', 'ADMIN', true
    );`;

    logger.info('✅ تم إنشاء المستخدم المدير بنجاح');

    // التحقق من إنشاء المستخدم
    const verifyUser = await db.user.findUnique({
      where: { email: 'admin@hamidawi.com' }
    });

    if (!verifyUser) {
      throw new Error('فشل في التحقق من إنشاء المستخدم');
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء قاعدة البيانات والمستخدم المدير بنجاح',
      user: {
        email: verifyUser.email,
        username: verifyUser.username,
        name: verifyUser.name,
        role: verifyUser.role,
        isActive: verifyUser.isActive,
        createdAt: verifyUser.createdAt
      },
      credentials: {
        email: 'admin@hamidawi.com',
        password: 'admin123',
        note: 'استخدم هذه البيانات لتسجيل الدخول'
      }
    });

  } catch (error) {
    logger.error('❌ فشل في إنشاء قاعدة البيانات', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في إنشاء قاعدة البيانات',
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
