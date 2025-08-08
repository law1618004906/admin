import { NextResponse, NextRequest } from 'next/server';

// مسارات عامة يُسمح الوصول لها دون تسجيل دخول
const PUBLIC_PATHS = new Set<string>([
  '/login',
  '/favicon.ico',
]);

// مساعد لاكتشاف إن كان المسار عامًا
function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // استثناءات عامة إضافية
  if (
    pathname.startsWith('/_next') || // ملفات Next الداخلية
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  ) {
    return true;
  }
  return false;
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authCookie = req.cookies.get('__Host-session')?.value;
  const isAuthed = Boolean(authCookie);

  // دع جميع طلبات API تمر؛ حماية API تتم داخل الراوترات نفسها
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // إذا كان المستخدم "مسجّلًا" ويحاول فتح /login، أعد توجيهه بعيدًا عن صفحة تسجيل الدخول
  if (isAuthed && pathname.startsWith('/login')) {
    // احترم returnTo إن وُجد، وإلّا ارجع للرئيسية
    const params = new URLSearchParams(search);
    const returnTo = params.get('returnTo') || '/';
    const url = new URL(returnTo, req.url);
    return NextResponse.redirect(url);
  }

  // إذا لم يكن مسجّلاً ويحاول الوصول لمسار محمي، وجّهه إلى /login مع returnTo
  if (!isAuthed && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', req.url);
    const returnTo = pathname + (search || '');
    loginUrl.searchParams.set('returnTo', returnTo);
    return NextResponse.redirect(loginUrl);
  }

  // السماح بالمتابعة
  return NextResponse.next();
}

// تحديد المسارات التي يشملها الميدلوير (استثناءات دقيقة للأصول)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
