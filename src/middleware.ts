// ...existing code...
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// لا يمكن استخدام getSession في Edge Middleware، سنفحص الكوكي مباشرة

// قائمة بالمسارات التي يجب حمايتها
const protectedRoutes = ['/'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  try {
    // ابحث عن كوكي الجلسة الصحيح: في HTTPS نستخدم __Host-session، وفي التطوير HTTP نستخدم session
    const sessionToken =
      request.cookies.get('__Host-session')?.value ||
      request.cookies.get('session')?.value;
    const isLoggedIn = !!sessionToken;
    const isOnLoginPage = pathname.startsWith('/login');

    // منع المستخدمين المصادق عليهم من الوصول إلى صفحة تسجيل الدخول
    if (isLoggedIn && isOnLoginPage) {
      return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    // حماية المسارات التي تتطلب تسجيل الدخول
    if (!isLoggedIn && protectedRoutes.some(route => pathname.startsWith(route)) && !isOnLoginPage) {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// See matching paths configuration in config.ts
export const config = {
  matcher: ['/', '/login'],
}
// ...existing code...