// استخدام عميل Prisma واحد عبر التطبيق لتفادي تعدد الاتصالات والمشاكل في التطوير
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import logger from './logger';
import fs from 'fs';
import path from 'path';

declare global {
  var prisma: PrismaClient | undefined;
}

// تحقق مسبق من ملف قاعدة البيانات عند استخدام SQLite عبر DATABASE_URL من نوع file:
// يمنع إنشاء ملف فارغ بالخطأ ويجبر على توفير قاعدة بيانات صحيحة
(() => {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl) {
      logger.warn('DATABASE_URL is not set. Prisma may default to schema value.');
      return;
    }

    if (dbUrl.startsWith('file:')) {
      const rawPath = dbUrl.replace(/^file:/, '');
      const resolvedPath = rawPath.startsWith('/')
        ? rawPath
        : path.resolve(process.cwd(), rawPath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`SQLite database file not found at: ${resolvedPath}. Provide a valid production DB file.`);
      }

      const stats = fs.statSync(resolvedPath);
      if (stats.size === 0) {
        throw new Error(`SQLite database file is empty at: ${resolvedPath}. Refusing to start to avoid using an empty DB.`);
      }

      logger.info(`Using SQLite database file at: ${resolvedPath} (size: ${stats.size} bytes)`);
    }
  } catch (e) {
    // أظهر الخطأ بوضوح وتوقف عن التشغيل
    const msg = e instanceof Error ? e.message : String(e);
    logger.error(`❌ Database bootstrap validation failed: ${msg}`);
    throw e;
  }
})();

export const db: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// في بيئة التطوير، خزن النسخة على global لتفادي إنشاء عميل جديد مع كل HMR
if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

// تسجيل اتصال قاعدة البيانات
db.$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error) => {
    logger.error('❌ Failed to connect to database', error);
  });

export default db;