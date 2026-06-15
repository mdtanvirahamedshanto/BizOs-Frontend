// =============================================================================
// BizOS — Auth Cookie Helpers
// Shared between Zustand store, Axios token store, and middleware-readable cookies.
// =============================================================================

const isProduction = process.env.NODE_ENV === 'production';

function cookieFlags(): string {
  const sameSite = 'SameSite=Strict';
  const secure = isProduction ? 'Secure' : '';
  return [sameSite, secure].filter(Boolean).join('; ');
}

export function setAuthCookie(name: string, value: string, days = 7): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${cookieFlags()}`;
}

export function getAuthCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteAuthCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; ${cookieFlags()}`;
}

export const AUTH_COOKIES = {
  accessToken: 'bizos_token',
  refreshToken: 'bizos_refresh_token',
  userInfo: 'bizos_user_info',
} as const;
