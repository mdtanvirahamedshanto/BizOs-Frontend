import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('bizos_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/otp-verify') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. Guard dashboard + admin routes: Redirect to login if token is missing.
  // NOTE: the platform-admin *role* check is enforced server-side by the
  // backend `requirePlatformAdmin` guard on /api/v1/platform/*; this middleware
  // only blocks unauthenticated access to the admin shell.
  if ((isDashboardRoute || isAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    // Optional: preserve the original path for post-login redirect
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Guard auth routes: Redirect to dashboard if session already exists
  if (isAuthRoute && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Optimization: run the middleware only on explicit dashboard and auth paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/otp-verify',
    '/forgot-password',
    '/reset-password',
  ],
};
