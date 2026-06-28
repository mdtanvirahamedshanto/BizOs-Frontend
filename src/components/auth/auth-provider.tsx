'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth';
import { useMeQuery } from '@/hooks/queries/use-auth-query';
import { clearSession, syncUserProfile } from '@/lib/auth/session';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/auth/permissions';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Bootstraps auth state on app load:
 * 1. Hydrate session from cookies (instant UI)
 * 2. Validate session via GET /auth/me (authoritative profile + permissions)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const { data: me, error, isError, isFetching } = useMeQuery();

  useEffect(() => {
    if (me) {
      syncUserProfile(me);
    }
  }, [me]);

  useEffect(() => {
    if (isError && isAuthenticated) {
      if (error && typeof error === 'object' && 'status' in error && (error as any).status === 401) {
        clearSession();
      }
    }
  }, [isError, isAuthenticated, error]);

  // Block render briefly while validating an existing cookie session
  if (isLoading || (isAuthenticated && !me && isFetching)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">সেশন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side route guard for authenticated areas.
 * Middleware handles the first redirect; this catches expired sessions in-app.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RBAC guard — hides or replaces content when the user lacks permission.
 */
export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">আপনার এই পেইজ দেখার অনুমতি নেই।</p>
          <p className="mt-1 text-xs text-slate-500">অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
