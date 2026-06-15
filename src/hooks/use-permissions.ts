import { create } from 'zustand';

// Define granular permission types
export type Permission = 
  | 'pos:checkout'
  | 'pos:void'
  | 'inventory:read'
  | 'inventory:write'
  | 'ledger:read'
  | 'ledger:write'
  | 'reports:read'
  | 'settings:write';

export type UserRole = 'Owner' | 'Manager' | 'Cashier';

interface AuthState {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  } | null;
  setRole: (role: UserRole) => void;
}

// Global Auth Store mock for UI demonstration & local RBAC checks
export const useAuthStore = create<AuthState>()((set) => ({
  user: {
    id: 'usr-001',
    name: 'তানভীর আহমেদ (Tanvir)',
    phone: '01712345678',
    role: 'Owner', // Default role is Owner for initial setup
  },
  setRole: (role) => set((state) => ({
    user: state.user ? { ...state.user, role } : null
  })),
}));

// Pre-defined role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Owner: [
    'pos:checkout',
    'pos:void',
    'inventory:read',
    'inventory:write',
    'ledger:read',
    'ledger:write',
    'reports:read',
    'settings:write',
  ],
  Manager: [
    'pos:checkout',
    'pos:void',
    'inventory:read',
    'inventory:write',
    'ledger:read',
    'ledger:write',
    'reports:read',
  ],
  Cashier: [
    'pos:checkout',
    'inventory:read',
    'ledger:read', // Read access to record client credits
  ],
};

/**
 * Custom hook to verify roles and permissions.
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions.includes(permission);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    role: user?.role || null,
    hasPermission,
    hasRole,
    allPermissions: user ? ROLE_PERMISSIONS[user.role] : [],
  };
}
