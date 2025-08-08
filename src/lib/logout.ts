import { withCsrf } from '@/lib/csrf-client';

// Client-side logout helper
export async function logout(returnTo: string = '/login') {
  try {
    await fetch(
      '/api/auth/logout',
      withCsrf({ method: 'POST', credentials: 'include' })
    );
  } catch {}

  // No localStorage token handling; auth is cookie-only

  // Redirect to login with optional returnTo
  try {
    const url = new URL(returnTo, window.location.origin);
    const loginUrl = new URL('/login', window.location.origin);
    loginUrl.searchParams.set('returnTo', url.pathname + url.search);
    window.location.href = loginUrl.toString();
  } catch {
    window.location.href = '/login';
  }
}
