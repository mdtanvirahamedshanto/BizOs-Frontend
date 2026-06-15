import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BusinessInfo {
  id: string;
  name: string;
  type: 'grocery' | 'mobile_banking' | 'flexiload' | 'electronics' | 'clothing' | 'hardware' | 'restaurant' | 'wholesale';
  logoUrl?: string;
}

export interface BranchInfo {
  id: string;
  businessId: string;
  name: string;
  address?: string;
}

interface TenantState {
  activeBusinessId: string | null;
  activeBranchId: string | null;
  businesses: BusinessInfo[];
  branches: BranchInfo[];
  
  // Actions
  setActiveBusiness: (businessId: string | null) => void;
  setActiveBranch: (branchId: string | null) => void;
  setTenants: (businesses: BusinessInfo[], branches: BranchInfo[]) => void;
  clearTenantContext: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeBusinessId: null,
      activeBranchId: null,
      businesses: [],
      branches: [],

      setActiveBusiness: (businessId) => {
        set((state) => {
          // Find first branch of the new business, or null
          const relevantBranches = state.branches.filter((b) => b.businessId === businessId);
          const firstBranchId = relevantBranches.length > 0 ? relevantBranches[0].id : null;
          
          return {
            activeBusinessId: businessId,
            activeBranchId: firstBranchId,
          };
        });
      },

      setActiveBranch: (branchId) => {
        set({ activeBranchId: branchId });
      },

      setTenants: (businesses, branches) => {
        set((state) => {
          // If no active business, select the first one by default
          const nextBusinessId = state.activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);
          const nextBranchId = state.activeBranchId || (branches.length > 0 ? branches.filter(b => b.businessId === nextBusinessId)[0]?.id : null);

          return {
            businesses,
            branches,
            activeBusinessId: nextBusinessId,
            activeBranchId: nextBranchId,
          };
        });
      },

      clearTenantContext: () => {
        set({
          activeBusinessId: null,
          activeBranchId: null,
          businesses: [],
          branches: [],
        });
      },
    }),
    {
      name: 'bizos-tenant-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist active selections, do not persist potentially stale list of businesses/branches
      partialize: (state) => ({
        activeBusinessId: state.activeBusinessId,
        activeBranchId: state.activeBranchId,
      }),
    }
  )
);
