// =============================================================================
// BizOS — RBAC Permission Utilities
// Maps UI permission keys to backend resource.action strings and checks wildcards.
// =============================================================================

import type { UserRole } from '@/stores/use-auth';

/** UI-facing permission keys used by sidebar and route guards */
export type Permission =
  | 'pos:checkout'
  | 'pos:void'
  | 'inventory:read'
  | 'inventory:write'
  | 'purchases:read'
  | 'purchases:write'
  | 'expenses:read'
  | 'expenses:write'
  | 'ledger:read'
  | 'ledger:write'
  | 'reports:read'
  | 'settings:write';

/** Minimum backend permission required for each UI capability */
const UI_PERMISSION_REQUIREMENTS: Record<Permission, string[]> = {
  'pos:checkout': ['sales.create'],
  'pos:void': ['sales.delete', 'sales.update', 'sales.return'],
  'inventory:read': ['products.read'],
  'inventory:write': ['products.create', 'products.update'],
  'purchases:read': ['purchases.read'],
  'purchases:write': ['purchases.create', 'purchases.update'],
  'expenses:read': ['expenses.read'],
  'expenses:write': ['expenses.write', 'expenses.create'],
  'ledger:read': ['khata.read'],
  'ledger:write': ['khata.write', 'khata.update'],
  'reports:read': ['reports.read'],
  'settings:write': ['*'],
};

/**
 * Check if a granted backend permission satisfies a required permission.
 * Mirrors BizOs-Backend authorize middleware logic.
 */
export function matchPermission(granted: string, required: string): boolean {
  if (granted === '*' || granted === '*:*:*') return true;
  if (granted === required) return true;

  const [grantedResource, grantedAction] = granted.split('.');
  const [requiredResource, requiredAction] = required.split('.');

  if (!grantedResource || !requiredResource) return false;

  const resourceMatch = grantedResource === '*' || grantedResource === requiredResource;
  const actionMatch = grantedAction === '*' || grantedAction === requiredAction;

  return resourceMatch && actionMatch;
}

/** True when the user holds at least one permission that satisfies `required`. */
export function hasBackendPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.some((granted) => matchPermission(granted, required));
}

/** Check whether the user can perform a UI-level permission action. */
export function checkUiPermission(userPermissions: string[], permission: Permission): boolean {
  const requirements = UI_PERMISSION_REQUIREMENTS[permission];
  return requirements.some((required) => hasBackendPermission(userPermissions, required));
}

/** Derive a display role from backend permission set (for UI labels only). */
export function deriveRoleFromPermissions(permissions: string[]): UserRole {
  if (permissions.includes('*') || permissions.includes('*:*:*')) {
    return 'Owner';
  }

  const canManageInventory = hasBackendPermission(permissions, 'products.update');
  const canVoidSales = hasBackendPermission(permissions, 'sales.delete');

  if (canManageInventory || canVoidSales) {
    return 'Manager';
  }

  return 'Cashier';
}

export function getEffectivePermissions(userPermissions: string[]): Permission[] {
  return (Object.keys(UI_PERMISSION_REQUIREMENTS) as Permission[]).filter((permission) =>
    checkUiPermission(userPermissions, permission),
  );
}
