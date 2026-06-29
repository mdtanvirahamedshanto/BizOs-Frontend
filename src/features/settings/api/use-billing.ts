import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface TenantSubscription {
  id: string;
  shopId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string | null;
}

export interface BillingOverview {
  activeSubscription: TenantSubscription | null;
  pendingRequest: any | null;
  currentPlanEnum: string;
}

/**
 * Hook to retrieve current subscription status
 */
export function useBillingOverviewQuery() {
  return useQuery({
    queryKey: ['billing', 'overview'],
    queryFn: async (): Promise<BillingOverview> => {
      const res = await apiClient.get<{ success: boolean; data: BillingOverview }>('/billing/current');
      return res.data;
    },
  });
}

/**
 * Hook to subscribe to a new plan
 */
export function useSubscribeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { planId: string; billingCycle: 'monthly' | 'yearly' }): Promise<TenantSubscription> => {
      const res = await apiClient.post<{ success: boolean; data: TenantSubscription }>('/billing/subscribe', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'overview'] });
    },
  });
}

/**
 * Hook to manually subscribe to a new plan (bKash/Nagad/Bank)
 */
export function useManualSubscribeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { planId: string; billingCycle: 'monthly' | 'yearly'; paymentMethod: string; transactionId: string; senderAccount?: string }): Promise<any> => {
      const res = await apiClient.post<{ success: boolean; data: any }>('/billing/manual-subscribe', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'overview'] });
    },
  });
}

/**
 * Hook to cancel the active subscription
 */
export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean }> => {
      const res = await apiClient.post<{ success: boolean; data: any }>('/billing/cancel', {});
      return res; // Already wrapped or maybe just { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'overview'] });
    },
  });
}
