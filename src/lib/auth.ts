import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// دالة تشفير كلمة المرور
export async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// دالة إنشاء مستخدم جديد في قاعدة البيانات
export async function createUser({ email, password, name, role = 'USER' }: { email: string; password: string; name?: string; role?: string }) {
  const hashed = await hashPassword(password);
  const username = email.split('@')[0];

  // تحقق من عدم وجود المستخدم مسبقاً
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('User already exists');

  // Resolve roleId from Role model (fallback to USER)
  const targetRoleName = role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  const targetRole = await prisma.role.findUnique({ where: { name: targetRoleName } });

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email,
      password: hashed,
      name: name || username,
      username,
      // keep legacy text for backward-compat for now
      role: targetRoleName,
      roleId: targetRole?.id ?? null,
    },
  });
  return user;
}

// دالة التحقق من المستخدم عند تسجيل الدخول
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { roleRel: true } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  return user;
}

// دالة تحديث بيانات المستخدم
export async function updateUser(id: string, data: any) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

// دالة حذف المستخدم
export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

// دالة جلب مستخدم بواسطة المعرف
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: { roleRel: true },
  });
}

// دالة جلب كل المستخدمين
export async function getAllUsers() {
  return await prisma.user.findMany();
}


export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// دالة التحقق من الصلاحيات
export function hasPermission(userRole: string, permission: string): boolean {
  // منطق بسيط للتحقق - يمكن تطويره لاحقًا
  if (userRole === 'ADMIN') {
    return true; // المدير لديه كل الصلاحيات
  }
  // يمكن إضافة منطق صلاحيات لأدوار أخرى هنا
  return false;
}


// For NextAuth compatibility
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        // Prefer Role name from relation if present, fallback to legacy text role
        // @ts-ignore
        token.role = (user as any).roleRel?.name || (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
};