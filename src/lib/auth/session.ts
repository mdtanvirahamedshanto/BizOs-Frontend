// =============================================================================
// BizOS — Auth Session Sync
// Keeps Zustand, cookies, token store, and TanStack Query in sync.
// =============================================================================

import type { AuthResult, AuthUser } from '@/lib/api';
import { tokenStore } from '@/lib/api/client';
import { useAuthStore, type UserInfo } from '@/stores/use-auth';
import { useTenantStore } from '@/stores/use-tenant';
import { deriveRoleFromPermissions } from './permissions';

export function authUserToUserInfo(user: AuthUser): UserInfo {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    shopId: user.shopId,
    permissions: user.permissions,
    role: deriveRoleFromPermissions(user.permissions),
  };
}

/** Persist tokens + user after login, register, or OTP verify. */
export function establishSession(result: AuthResult): UserInfo {
  const userInfo = authUserToUserInfo(result.user);

  tokenStore.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  useAuthStore.getState().establishSession(
    userInfo,
    result.tokens.accessToken,
    result.tokens.refreshToken,
  );

  // Align tenant context with the authenticated shop
  const tenant = useTenantStore.getState();
  tenant.setTenants(
    [{ id: result.user.shopId, name: result.user.name, type: 'grocery' }],
    [{ id: result.user.shopId, businessId: result.user.shopId, name: 'প্রধান শাখা' }],
  );
  tenant.setActiveBusiness(result.user.shopId);
  tenant.setActiveBranch(result.user.shopId);

  return userInfo;
}

/** Update cached user profile after /auth/me refresh. */
export function syncUserProfile(user: AuthUser): UserInfo {
  const userInfo = authUserToUserInfo(user);
  useAuthStore.getState().setUser(userInfo);
  return userInfo;
}

/** Wipe all client-side session state (logout / expired session). */
export function clearSession(): void {
  tokenStore.clearTokens();
  useAuthStore.getState().logout();
  useTenantStore.getState().clearTenantContext();
}

/** Apply a rotated access token after silent refresh. */
export function applyRefreshedTokens(accessToken: string, refreshToken?: string): void {
  tokenStore.setTokens(accessToken, refreshToken);
  useAuthStore.getState().setAccessToken(accessToken);
}
