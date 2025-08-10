import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PERMANENT_USER_CONFIG } from './permanent-auth';

/**
 * تحقق من وجود جلسة صحيحة للمستخدم
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');
    
    // التحقق من وجود الجلسة
    if (!session || (!session.value.startsWith('admin-session-') && !session.value.startsWith('root-admin-فقار-'))) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }
    
    // الجلسة صحيحة
    return null;
  } catch (error) {
    console.error('خطأ في فحص المصادقة:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

/**
 * تحقق من الصلاحيات (حالياً جميع المستخدمين لديهم صلاحيات كاملة)
 */
export async function requirePermission(request: NextRequest, permission: string): Promise<NextResponse | null> {
  // أولاً تحقق من المصادقة
  const authResult = await requireAuth(request);
  if (authResult) {
    return authResult;
  }
  
  // المستخدم "فقار" لديه جميع الصلاحيات
  return null;
}

/**
 * الحصول على معلومات المستخدم الحالي
 */
export async function getCurrentUser(): Promise<{ username: string; role: string; permissions: string } | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');
    
    if (session && (session.value.startsWith('admin-session-') || session.value.startsWith('root-admin-فقار-'))) {
      return {
        username: PERMANENT_USER_CONFIG.username,
        role: PERMANENT_USER_CONFIG.role,
        permissions: PERMANENT_USER_CONFIG.permissions
      };
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في الحصول على المستخدم:', error);
    return null;
  }
}

/**
 * تحقق سريع من حالة المصادقة (لا يرجع خطأ HTTP)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');
    
    return !!(session && (session.value.startsWith('admin-session-') || session.value.startsWith('root-admin-فقار-')));
  } catch (error) {
    return false;
  }
}
