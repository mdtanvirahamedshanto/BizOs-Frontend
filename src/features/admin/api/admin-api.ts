import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Tenant, SupportTicket, SystemStatus, FeatureFlag, SubscriptionPlan } from '../types';

export interface AdminOverview {
  mrr: number;
  arr: number;
  activePaidSubscriptions: number;
  merchantGrowthRate: number;
  revenueChartData: { month: string; revenue: number }[];
}

/**
 * Hook to retrieve overall SaaS overview and revenue graphs
 */
export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async (): Promise<AdminOverview> => {
      const res = await apiClient.get<AdminOverview>('/platform/overview');
      return res;
    },
  });
}

/**
 * Hook to retrieve registered tenants
 */
export function useAdminTenantsQuery(search = '', status = 'all') {
  return useQuery({
    queryKey: ['admin', 'tenants', search, status],
    queryFn: async (): Promise<Tenant[]> => {
      const res = await apiClient.get<Tenant[]>(`/platform/tenants?search=${search}&status=${status}`);
      return res;
    },
  });
}

/**
 * Hook to retrieve support tickets list
 */
export function useAdminTicketsQuery(status = 'all') {
  return useQuery({
    queryKey: ['admin', 'tickets', status],
    queryFn: async (): Promise<SupportTicket[]> => {
      const res = await apiClient.get<SupportTicket[]>(`/platform/tickets?status=${status}`);
      return res;
    },
  });
}

/**
 * Hook to retrieve live system metrics (CPU, Memory, Latencies)
 */
export function useAdminMonitoringQuery() {
  return useQuery({
    queryKey: ['admin', 'monitoring'],
    refetchInterval: 3000,
    queryFn: async (): Promise<SystemStatus> => {
      const res = await apiClient.get<SystemStatus>('/platform/monitoring');
      return res;
    },
  });
}

/**
 * Hook to retrieve subscription plans list
 */
export function useAdminPlansQuery() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const res = await apiClient.get<SubscriptionPlan[]>('/platform/plans');
      return res;
    },
  });
}

/**
 * Hook to retrieve feature flags
 */
export function useAdminFlagsQuery() {
  return useQuery({
    queryKey: ['admin', 'flags'],
    queryFn: async (): Promise<FeatureFlag[]> => {
      const res = await apiClient.get<FeatureFlag[]>('/platform/flags');
      return res;
    },
  });
}

/**
 * Hook to suspend or activate a tenant
 */
export function useToggleTenantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tenantId: string; nextStatus: 'active' | 'suspended' | 'trial' }): Promise<Tenant> => {
      const res = await apiClient.post<Tenant>(`/platform/tenants/${data.tenantId}/status`, { status: data.nextStatus });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });
}

/**
 * Hook to resolve or answer support tickets
 */
export function useResolveTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ticketId: string; replyMessage: string; nextStatus?: SupportTicket['status'] }): Promise<SupportTicket> => {
      const res = await apiClient.post<SupportTicket>(`/platform/tickets/${data.ticketId}/resolve`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
  });
}

/**
 * Hook to toggle feature flags
 */
export function useToggleFlagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { key: string; enabled: boolean }): Promise<FeatureFlag> => {
      const res = await apiClient.post<FeatureFlag>(`/platform/flags/${data.key}`, { enabled: data.enabled });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}
