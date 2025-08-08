import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

// قائمة المدراء المسموح لهم بالدخول
import { authenticateUser, generateToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // التحقق من المستخدم عبر الدالة المركزية
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الاعتماد غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء توكن بسيط
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      roleId: (user as any).roleId || null,
    })).toString('base64');

    // أنشئ الاستجابة ثم عيّن كوكي الجلسة (__Host-session) + كوكي CSRF
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        role: (user as any).roleRel?.name || (user as any).role || 'USER',
        roleId: (user as any).roleId || null,
      },
    });

    const secure = request.nextUrl.protocol === 'https:';
    // Use Host prefix only on HTTPS; in HTTP dev, use a normal cookie name
    const sessionCookieName = secure ? '__Host-session' : 'session';
    response.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      // آمن فقط عند https لضمان عمله محليًا على http
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
    });

    // CSRF cookie (double-submit): readable cookie + header validation on unsafe methods
    const csrf = generateCsrfToken();
    setCsrfCookie(response, csrf, secure);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'بيانات الاعتماد غير صحيحة' },
      { status: 401 }
    );
  }
}