import { NextRequest, NextResponse } from 'next/server';

// Generate a simple random CSRF token
export function generateCsrfToken(length = 32): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Extract CSRF token from cookie
export function getCsrfCookie(request: NextRequest): string | null {
  return request.cookies.get('csrf_token')?.value || null;
}

// Verify CSRF for unsafe HTTP methods (POST/PUT/PATCH/DELETE)
export function verifyCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

  const cookieToken = getCsrfCookie(request);
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

// Helper to set CSRF cookie on response
export function setCsrfCookie(res: NextResponse, token: string, secure: boolean) {
  res.cookies.set('csrf_token', token, {
    httpOnly: false, // must be readable by client JS for double-submit pattern
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
}
