// Client-side helpers to read CSRF token and build headers
export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie
    .split('; ')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

export function getCsrfToken(): string {
  return getCookie('csrf_token');
}

export function withCsrf(init: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('X-CSRF-Token', token);
  return { ...init, headers };
}
