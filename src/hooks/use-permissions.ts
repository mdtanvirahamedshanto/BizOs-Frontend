import { useAuthStore } from '@/stores/use-auth';
import {
  checkUiPermission,
  deriveRoleFromPermissions,
  getEffectivePermissions,
  hasBackendPermission as checkBackendPermission,
  type Permission,
} from '@/lib/auth/permissions';

export type { Permission };

/**
 * RBAC hook backed by backend permission strings from /auth/me.
 * UI permission keys (e.g. pos:checkout) map to backend resource.action checks.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const permissions = user?.permissions ?? [];

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return checkUiPermission(permissions, permission);
  };

  const hasAnyPermission = (required: Permission[]): boolean => {
    return required.some((permission) => hasPermission(permission));
  };

  const hasBackendPermission = (required: string): boolean => {
    if (!user) return false;
    return checkBackendPermission(permissions, required);
  };

  const role = user?.role ?? deriveRoleFromPermissions(permissions);

  return {
    user,
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasBackendPermission,
    allPermissions: getEffectivePermissions(permissions),
    isOwner: permissions.includes('*') || permissions.includes('*:*:*'),
  };
}
