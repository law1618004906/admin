import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PERMANENT_USER_CONFIG } from '@/lib/permanent-auth';

// المستخدم الوحيد والدائم مع صلاحيات root كاملة
// هذا المستخدم محفوظ بشكل دائم وغير موقت في النظام
const ADMIN_USERNAME = PERMANENT_USER_CONFIG.username; // المستخدم الوحيد والدائم - غير قابل للحذف
const ADMIN_PASSWORD = PERMANENT_USER_CONFIG.password; // كلمة المرور الثابتة

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // إنشاء session token مع صلاحيات root كاملة
      const sessionToken = 'root-admin-فقار-' + Date.now();
      
      // حفظ في cookies مع صلاحيات كاملة - جلسة دائمة
      const cookieStore = await cookies();
      cookieStore.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: PERMANENT_USER_CONFIG.sessionDuration, // جلسة دائمة (سنة كاملة)
        path: '/'
      });

      return NextResponse.json({ 
        success: true, 
        user: { 
          username: PERMANENT_USER_CONFIG.username, 
          role: PERMANENT_USER_CONFIG.role, 
          permissions: PERMANENT_USER_CONFIG.permissions 
        }
      });
    } else {
      return NextResponse.json(
        { error: 'بيانات تسجيل الدخول غير صحيحة. المستخدم الوحيد هو: فقار' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
