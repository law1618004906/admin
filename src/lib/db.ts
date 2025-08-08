// استخدام عميل Prisma واحد عبر التطبيق لتفادي تعدد الاتصالات والمشاكل في التطوير
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// في بيئة التطوير، خزن النسخة على global لتفادي إنشاء عميل جديد مع كل HMR
if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

export default db;