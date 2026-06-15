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

// Memory database states for admin
let MOCK_TENANTS: Tenant[] = [
  { id: 'ten-1', merchantName: 'শরীফ জেনারেল স্টোর', ownerName: 'মোঃ শরীফুল ইসলাম', phone: '01712345678', type: 'grocery', status: 'active', currentPlan: 'premium', subscriptionExpiry: '2026-12-31', usersCount: 3, createdAt: '2026-01-10' },
  { id: 'ten-2', merchantName: 'অনন্যা কসমেটিকস', ownerName: 'সাদিয়া তাসনিম', phone: '01812345678', type: 'clothing', status: 'active', currentPlan: 'basic', subscriptionExpiry: '2026-09-30', usersCount: 2, createdAt: '2026-02-15' },
  { id: 'ten-3', merchantName: 'ক্যাফে ক্যাপ্রি (Cafe Capri)', ownerName: 'রাসেল চৌধুরী', phone: '01912345678', type: 'restaurant', status: 'trial', currentPlan: 'free', subscriptionExpiry: '2026-06-25', usersCount: 5, createdAt: '2026-06-10' },
  { id: 'ten-4', merchantName: 'ঢাকা মেটাল হাউজ', ownerName: 'কামাল হোসেন', phone: '01512345678', type: 'hardware', status: 'suspended', currentPlan: 'basic', subscriptionExpiry: '2026-05-01', usersCount: 1, createdAt: '2026-03-20' },
];

let MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    tenantName: 'শরীফ জেনারেল স্টোর',
    subject: 'বারকোড স্ক্যানার দিয়ে প্রোডাক্ট এড হচ্ছে না',
    issueDescription: 'কীবোর্ড ওয়েজ বারকোড স্ক্যানার দিয়ে স্ক্যান করার পর কার্টে আইটেম স্বয়ংক্রিয়ভাবে বাড়ছে না। স্ক্রিনে নোটিফিকেশন আসছে কিন্তু কার্ট আপডেট হচ্ছে না।',
    priority: 'high',
    status: 'open',
    timestamp: '2026-06-15 10:15',
    replies: [
      { sender: 'merchant', message: 'হ্যালো, আমার স্ক্যানার রিড করতেছে কিন্তু প্রোডাক্ট সংখ্যা বাড়তেছে না। একটু দেখবেন প্লিজ।', timestamp: '2026-06-15 10:15' }
    ]
  },
  {
    id: 'tkt-102',
    tenantName: 'অনন্যা কসমেটিকস',
    subject: 'বকেয়া খাতা এসএমএস এলার্ট প্রবলেম',
    issueDescription: 'কাস্টমার পেমেন্ট রেকর্ড করার পর "এসএমএস পাঠান" এ টিক দেওয়ার পরেও কাস্টমার মোবাইলে বকেয়া আদায়ের মেসেজ পাচ্ছে না।',
    priority: 'medium',
    status: 'in_progress',
    timestamp: '2026-06-14 15:30',
    replies: [
      { sender: 'merchant', message: 'আমরা বিকাশ ও নগদ থেকে টাকা নেওয়ার পর বকেয়া রেকর্ড করেছি, তবে কাস্টমার কোনো নোটিফিকেশন পায়নি।', timestamp: '2026-06-14 15:30' },
      { sender: 'admin', message: 'প্রিয় গ্রাহক, আমরা এসএমএস গেটওয়ে সার্ভিসটি চেক করছি। সাময়িক ত্রুটির জন্য দুঃখিত।', timestamp: '2026-06-14 16:00' }
    ]
  },
  {
    id: 'tkt-103',
    tenantName: 'ঢাকা মেটাল হাউজ',
    subject: 'সাবস্ক্রিপশন প্ল্যান আপগ্রেড সংক্রান্ত',
    issueDescription: 'আমাদের বেসিক প্ল্যান হতে প্রিমিয়াম প্ল্যানে সাবস্ক্রিপশন আপগ্রেড করতে চাই। পেমেন্ট গেটওয়ে কিভাবে কাজ করবে?',
    priority: 'low',
    status: 'resolved',
    timestamp: '2026-06-12 11:00',
    replies: [
      { sender: 'merchant', message: 'আমরা ব্যাংক ট্রান্সফারের মাধ্যমে আপগ্রেড করতে পারবো কি?', timestamp: '2026-06-12 11:00' },
      { sender: 'admin', message: 'হ্যাঁ, আপনি আমাদের কাস্টমার সাপোর্টে ব্যাংক রশিদ শেয়ার করলে আমরা ম্যানুয়ালি আপগ্রেড করে দিবো।', timestamp: '2026-06-12 12:30' },
      { sender: 'merchant', message: 'ধন্যবাদ, রশিদ পাঠিয়েছি। সমাধান হয়েছে।', timestamp: '2026-06-12 14:00' }
    ]
  }
];

let MOCK_FLAGS: FeatureFlag[] = [
  { key: 'flag-offline-pos', label: 'অফলাইন সেলস কিউ (Offline POS Queue)', description: 'ইন্টারনেট সংযোগ না থাকলেও ইন-মেমোরি কিউতে অর্ডার জমা রাখা এবং ডেক্সি ডিবিতে রিরাইট করা।', enabled: true },
  { key: 'flag-sms-alerts', label: 'বকেয়া এসএমএস নোটিফিকেশন (SMS Alerts)', description: 'লেনদেন আদায়ের রশিদ কাস্টমারকে স্বয়ংক্রিয়ভাবে বাংলা এসএমএস মেসেজে পাঠানো।', enabled: true },
  { key: 'flag-mfs-ref-codes', label: 'মোবাইল রিচার্জ রেফারেন্স ট্র্যাকিং (MFS TxnID Ref)', description: 'বিকাশ ও নগদ ফ্লেক্সিলোডের জন্য অতিরিক্ত রেফারেন্স ও ট্রানজেকশন কলাম সোর্স দেখান।', enabled: false },
  { key: 'flag-dark-mode', label: 'ডার্ক থিম মোড (Global Dark Mode)', description: 'মার্চেন্ট প্যানেলে সম্পূর্ণ ডার্ক থিম ইন্টারফেস এনাবেল করা।', enabled: false },
];

let MOCK_PLANS: SubscriptionPlan[] = [
  { id: 'free', name: 'ফ্রি ট্রায়াল (Free Trial)', priceMonthly: 0, priceYearly: 0, activeSubscriptionsCount: 1, maxProductsLimit: 50, maxTransactionsLimit: 100 },
  { id: 'basic', name: 'বেসিক স্টোর (Basic Store)', priceMonthly: 500, priceYearly: 5000, activeSubscriptionsCount: 2, maxProductsLimit: 500, maxTransactionsLimit: 1000 },
  { id: 'premium', name: 'প্রিমিয়াম বিআইজেড (Premium Biz)', priceMonthly: 1500, priceYearly: 15000, activeSubscriptionsCount: 1, maxProductsLimit: 'unlimited', maxTransactionsLimit: 'unlimited' },
];

/**
 * Hook to retrieve overall SaaS overview and revenue graphs
 */
export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async (): Promise<AdminOverview> => {
      try {
        return await apiClient.get<AdminOverview>('/admin/overview');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        return {
          mrr: 3500, // $3,500 MRR
          arr: 42000,
          activePaidSubscriptions: 3,
          merchantGrowthRate: 15.4,
          revenueChartData: [
            { month: 'জানুয়ারি', revenue: 1200 },
            { month: 'ফেব্রুয়ারি', revenue: 1500 },
            { month: 'মার্চ', revenue: 1800 },
            { month: 'এপ্রিল', revenue: 2500 },
            { month: 'মে', revenue: 3100 },
            { month: 'জুন', revenue: 3500 },
          ]
        };
      }
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
      try {
        return await apiClient.get<Tenant[]>(`/admin/tenants?search=${search}&status=${status}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        let list = [...MOCK_TENANTS];
        
        if (search) {
          const s = search.toLowerCase();
          list = list.filter((t) => t.merchantName.toLowerCase().includes(s) || t.ownerName.toLowerCase().includes(s) || t.phone.includes(s));
        }

        if (status !== 'all') {
          list = list.filter((t) => t.status === status);
        }

        return list;
      }
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
      try {
        return await apiClient.get<SupportTicket[]>(`/admin/tickets?status=${status}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        if (status !== 'all') {
          return MOCK_TICKETS.filter((t) => t.status === status);
        }
        return [...MOCK_TICKETS];
      }
    },
  });
}

/**
 * Hook to retrieve live system metrics (CPU, Memory, Latencies)
 */
export function useAdminMonitoringQuery() {
  return useQuery({
    queryKey: ['admin', 'monitoring'],
    refetchInterval: 3000, // Poll every 3 seconds for simulated live ticker updates
    queryFn: async (): Promise<SystemStatus> => {
      try {
        return await apiClient.get<SystemStatus>('/admin/monitoring');
      } catch (error) {
        // Generate simulated dynamic fluctuations in resource allocations
        const cpuUsage = Math.floor(15 + Math.random() * 25);
        const memoryUsage = Math.floor(45 + Math.random() * 10);
        const apiLatency = Math.floor(12 + Math.random() * 15);
        const websocketConnections = 124 + Math.floor(Math.random() * 8);
        const backgroundJobsCount = Math.floor(Math.random() * 5);

        return {
          cpuUsage,
          memoryUsage,
          apiLatency,
          websocketConnections,
          backgroundJobsCount,
        };
      }
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
      try {
        return await apiClient.get<SubscriptionPlan[]>('/admin/plans');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return [...MOCK_PLANS];
      }
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
      try {
        return await apiClient.get<FeatureFlag[]>('/admin/flags');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return [...MOCK_FLAGS];
      }
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
      try {
        return await apiClient.post<Tenant>(`/admin/tenants/${data.tenantId}/status`, { status: data.nextStatus });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        
        MOCK_TENANTS = MOCK_TENANTS.map((t) => {
          if (t.id === data.tenantId) {
            return { ...t, status: data.nextStatus };
          }
          return t;
        });

        return MOCK_TENANTS.find((t) => t.id === data.tenantId)!;
      }
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
      try {
        return await apiClient.post<SupportTicket>(`/admin/tickets/${data.ticketId}/resolve`, data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        MOCK_TICKETS = MOCK_TICKETS.map((t) => {
          if (t.id === data.ticketId) {
            const replies = [...t.replies];
            if (data.replyMessage) {
              replies.push({
                sender: 'admin',
                message: data.replyMessage,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              });
            }
            return {
              ...t,
              replies,
              status: data.nextStatus || t.status,
            };
          }
          return t;
        });

        return MOCK_TICKETS.find((t) => t.id === data.ticketId)!;
      }
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
      try {
        return await apiClient.post<FeatureFlag>(`/admin/flags/${data.key}`, { enabled: data.enabled });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        MOCK_FLAGS = MOCK_FLAGS.map((f) => {
          if (f.key === data.key) {
            return { ...f, enabled: data.enabled };
          }
          return f;
        });

        return MOCK_FLAGS.find((f) => f.key === data.key)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}
