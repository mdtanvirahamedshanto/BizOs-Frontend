import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TelegramAccount, TelegramBot, TelegramCommand, TelegramLog, TelegramMetrics } from '../types';

// Client-side local mock databases in memory
let MOCK_ACCOUNT: TelegramAccount = {
  connected: true,
  username: 'abid_shanto',
  userId: '87654321',
  firstName: 'মোঃ তানভীর আহমেদ',
  photoUrl: '',
};

let MOCK_BOT: TelegramBot = {
  connected: true,
  botUsername: 'BizOsShopBot',
  botName: 'BizOS POS Manager',
  token: '1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ',
  settings: {
    sendDailyReport: true,
    sendLowStockAlert: true,
    sendDueNotification: false,
  },
};

let MOCK_COMMANDS: TelegramCommand[] = [
  {
    key: 'start',
    command: '/start',
    description: 'স্বাগতম মেসেজ ও নির্দেশনা প্রদর্শন',
    replyTemplate: 'BizOS শপ অ্যাসিস্ট্যান্ট বোটে স্বাগতম! আপনার দোকানের হিসেব দেখতে নিচের কম্যান্ডগুলো চাপুন:\n/sales - আজকের বিক্রয় ও ক্যাশ সামারি\n/due - বকেয়া খাতার মোট হিসেব\n/stock - কম স্টকের প্রোডাক্ট এলার্ট\n/help - সাহায্য নির্দেশিকা',
    usageCount: 124,
    enabled: true
  },
  {
    key: 'sales',
    command: '/sales',
    description: 'আজকের বিক্রয় ও দৈনিক লাভ-ক্ষতি বিবরণী',
    replyTemplate: '📊 আজকের বিক্রয় রিপোর্ট:\nমোট বিক্রয়: ৳২৫,৫০০\nনগদ জমা: ৳২০,০০০\nবকেয়া বিক্রয়: ৳৫,৫০০\nমোট লাভ: ৳৪,২০০\n(তারিখ: {date})',
    usageCount: 89,
    enabled: true
  },
  {
    key: 'due',
    command: '/due',
    description: 'বকেয়া খাতার মোট আদায়যোগ্য টাকার হিসেব',
    replyTemplate: '👥 বকেয়া খাতা সামারি:\nমোট পাওনা টাকা: ৳১২,৪০০\nমোট কাস্টমার সংখ্যা: ১৫ জন\nসবচেয়ে বেশি বকেয়া: শরীফ জেনারেল স্টোর (৳৫,৫০০)',
    usageCount: 45,
    enabled: true
  },
  {
    key: 'stock',
    command: '/stock',
    description: 'কম স্টকে থাকা পণ্য সমূহের তালিকা',
    replyTemplate: '⚠️ কম স্টকের প্রোডাক্ট এলার্ট:\n১. প্রান ডাল (৫ কেজি) - ৩টি অবশিষ্ট\n২. মিনিকেট চাল (৫০ কেজি) - ১টি অবশিষ্ট\n৩. সয়াবিন তেল (৫ লিটার) - ৪টি অবশিষ্ট',
    usageCount: 32,
    enabled: true
  },
  {
    key: 'help',
    command: '/help',
    description: 'সাহায্য ও কন্টাক্ট সাপোর্ট নির্দেশিকা',
    replyTemplate: '☎️ সাহায্য নির্দেশিকা:\nযে কোনো জরুরি প্রয়োজনে যোগাযোগ করুন কাস্টমার সাপোর্ট ডেস্কে।\nহেল্পলাইন: +৮৮০ ৯৬১২৩৪৫৬৭৮\nইমেইল: support@bizos.com',
    usageCount: 12,
    enabled: true
  }
];

let MOCK_LOGS: TelegramLog[] = [
  { id: 'log-101', chatId: '87654321', userTelegram: '@abid_shanto', incomingText: '/sales', outgoingText: '📊 আজকের বিক্রয় রিপোর্ট:\nমোট বিক্রয়: ৳২৫,৫০০...', status: 'success', timestamp: '2026-06-15 11:20' },
  { id: 'log-102', chatId: '87654321', userTelegram: '@abid_shanto', incomingText: '/due', outgoingText: '👥 বকেয়া খাতা সামারি:\nমোট পাওনা টাকা: ৳১২,৪০০...', status: 'success', timestamp: '2026-06-15 10:45' },
  { id: 'log-103', chatId: '87654321', userTelegram: '@abid_shanto', incomingText: '/stock', outgoingText: '⚠️ কম স্টকের প্রোডাক্ট এলার্ট:\n১. প্রান ডাল...', status: 'success', timestamp: '2026-06-15 09:15' },
  { id: 'log-104', chatId: '99887766', userTelegram: '@unknown_user', incomingText: '/sales', outgoingText: 'Error: Unauthorized Telegram ID request rejected.', status: 'failed', timestamp: '2026-06-14 17:30' },
];

let MOCK_METRICS: TelegramMetrics = {
  totalCommandsProcessed: 302,
  activeUsersCount: 4,
  commandsUsage: [
    { command: '/sales', count: 145 },
    { command: '/stock', count: 87 },
    { command: '/due', count: 52 },
    { command: '/help', count: 18 }
  ],
  trafficChart: [
    { date: 'জুন ১০', sent: 12, received: 14 },
    { date: 'জুন ১১', sent: 18, received: 20 },
    { date: 'জুন ১২', sent: 15, received: 15 },
    { date: 'জুন ১৩', sent: 22, received: 25 },
    { date: 'জুন ১৪', sent: 30, received: 32 },
    { date: 'জুন 1৫', sent: 42, received: 45 },
  ]
};

/**
 * Retrieve account status and bot configurations
 */
export function useTelegramStatusQuery() {
  return useQuery({
    queryKey: ['telegram', 'status'],
    queryFn: async (): Promise<{ account: TelegramAccount; bot: TelegramBot }> => {
      try {
        return await apiClient.get<{ account: TelegramAccount; bot: TelegramBot }>('/telegram/status');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
          account: { ...MOCK_ACCOUNT },
          bot: { ...MOCK_BOT },
        };
      }
    }
  });
}

/**
 * Retrieve standard trigger commands
 */
export function useTelegramCommandsQuery() {
  return useQuery({
    queryKey: ['telegram', 'commands'],
    queryFn: async (): Promise<TelegramCommand[]> => {
      try {
        return await apiClient.get<TelegramCommand[]>('/telegram/commands');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return [...MOCK_COMMANDS];
      }
    }
  });
}

/**
 * Retrieve activity history logs
 */
export function useTelegramLogsQuery() {
  return useQuery({
    queryKey: ['telegram', 'logs'],
    queryFn: async (): Promise<TelegramLog[]> => {
      try {
        return await apiClient.get<TelegramLog[]>('/telegram/logs');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [...MOCK_LOGS];
      }
    }
  });
}

/**
 * Retrieve metrics and analytics charts
 */
export function useTelegramMetricsQuery() {
  return useQuery({
    queryKey: ['telegram', 'metrics'],
    queryFn: async (): Promise<TelegramMetrics> => {
      try {
        return await apiClient.get<TelegramMetrics>('/telegram/metrics');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return { ...MOCK_METRICS };
      }
    }
  });
}

/**
 * Connect user Telegram profile
 */
export function useConnectAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string; firstName: string }): Promise<TelegramAccount> => {
      try {
        return await apiClient.post<TelegramAccount>('/telegram/account/connect', data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        MOCK_ACCOUNT = {
          connected: true,
          username: data.username,
          userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
          firstName: data.firstName,
        };
        return { ...MOCK_ACCOUNT };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'status'] });
    }
  });
}

/**
 * Disconnect profile and bot
 */
export function useDisconnectAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: 'account' | 'bot'): Promise<boolean> => {
      try {
        return await apiClient.post<boolean>('/telegram/disconnect', { target });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (target === 'account') {
          MOCK_ACCOUNT = { connected: false };
        } else {
          MOCK_BOT = {
            connected: false,
            settings: {
              sendDailyReport: false,
              sendLowStockAlert: false,
              sendDueNotification: false,
            }
          };
        }
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'status'] });
    }
  });
}

/**
 * Deploy bot config credentials
 */
export function useConfigureBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { token: string; botUsername: string; botName: string; settings: TelegramBot['settings'] }): Promise<TelegramBot> => {
      try {
        return await apiClient.post<TelegramBot>('/telegram/bot/config', data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        MOCK_BOT = {
          connected: true,
          botUsername: data.botUsername,
          botName: data.botName,
          token: data.token,
          settings: { ...data.settings }
        };
        return { ...MOCK_BOT };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'status'] });
    }
  });
}

/**
 * Customize reply templates
 */
export function useUpdateCommandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { key: string; replyTemplate: string; enabled: boolean }): Promise<TelegramCommand> => {
      try {
        return await apiClient.post<TelegramCommand>(`/telegram/commands/${data.key}`, data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        MOCK_COMMANDS = MOCK_COMMANDS.map((cmd) => {
          if (cmd.key === data.key) {
            return {
              ...cmd,
              replyTemplate: data.replyTemplate,
              enabled: data.enabled
            };
          }
          return cmd;
        });
        return MOCK_COMMANDS.find((cmd) => cmd.key === data.key)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'commands'] });
    }
  });
}

/**
 * Send a test message from bot to user chat
 */
export function useSendTestMessageMutation() {
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      try {
        return await apiClient.post<boolean>('/telegram/bot/test-ping', {});
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Push a simulated log into history
        const newLog: TelegramLog = {
          id: `log-${Math.floor(105 + Math.random() * 50)}`,
          chatId: MOCK_ACCOUNT.userId || '87654321',
          userTelegram: `@${MOCK_ACCOUNT.username || 'abid_shanto'}`,
          incomingText: '[🔔 Test Admin Ping Request]',
          outgoingText: '✅ BizOS বট টেস্ট মেসেজ সফলভাবে প্রেরণ করা হয়েছে। আপনার কানেকশন একটিভ রয়েছে।',
          status: 'success',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        MOCK_LOGS = [newLog, ...MOCK_LOGS];
        
        return true;
      }
    }
  });
}
