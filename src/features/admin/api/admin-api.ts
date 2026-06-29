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
      const res = await apiClient.get<{data: AdminOverview}>('/platform/overview');
      return res.data;
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
      const res = await apiClient.get<{data: Tenant[]}>(`/platform/tenants?search=${search}&status=${status}`);
      return res.data;
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
      const res = await apiClient.get<{data: SupportTicket[]}>(`/platform/tickets?status=${status}`);
      return res.data;
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
      const res = await apiClient.get<{data: SystemStatus}>('/platform/monitoring');
      return res.data;
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
      const res = await apiClient.get<{data: SubscriptionPlan[]}>('/platform/plans');
      return res.data;
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
      const res = await apiClient.get<{data: FeatureFlag[]}>('/platform/flags');
      return res.data;
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
      const res = await apiClient.post<{data: Tenant}>(`/platform/tenants/${data.tenantId}/status`, { status: data.nextStatus });
      return res.data;
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
      const res = await apiClient.post<{data: SupportTicket}>(`/platform/tickets/${data.ticketId}/resolve`, data);
      return res.data;
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
      const res = await apiClient.post<{data: FeatureFlag}>(`/platform/flags/${data.key}`, { enabled: data.enabled });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}

/**
 * Hook to edit subscription plans
 */
export function useUpdatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; payload: Partial<SubscriptionPlan> }): Promise<SubscriptionPlan> => {
      const res = await apiClient.put<{data: SubscriptionPlan}>(`/platform/plans/${data.id}`, data.payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}
