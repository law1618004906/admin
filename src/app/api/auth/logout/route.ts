import { NextRequest, NextResponse } from 'next/server';

function clearAuthCookies(res: NextResponse, secure: boolean) {
  // Clear session cookies (prod + dev)
  res.cookies.set('__Host-session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
  // In dev over http, we store session under 'session'
  res.cookies.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
  // Clear CSRF cookie
  res.cookies.set('csrf_token', '', {
    httpOnly: false,
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge: 0,
  });
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  const secure = req.nextUrl.protocol === 'https:';
  clearAuthCookies(response, secure);
  return response;
}

export async function GET(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  const secure = req.nextUrl.protocol === 'https:';
  clearAuthCookies(response, secure);
  return response;
}
