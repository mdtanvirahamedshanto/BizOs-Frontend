import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '@/hooks/queries/query-keys';
import * as telegramSdk from '@/lib/api/modules/telegram.api';
import type {
  TelegramAccount,
  TelegramBot,
  TelegramCommand,
  TelegramLog,
  TelegramMetrics,
} from '../types';

function mapStatusToView(status: telegramSdk.TelegramIntegrationStatus): {
  account: TelegramAccount;
  bot: TelegramBot;
} {
  return {
    account: {
      connected: status.account.connected,
      username: status.account.username,
      userId: status.account.userId,
      linkedAt: status.account.linkedAt,
    },
    bot: {
      connected: status.bot.connected,
      botUsername: status.bot.botUsername,
      botName: status.bot.botName,
      settings: status.bot.settings,
    },
  };
}

export function useTelegramStatusQuery() {
  return useQuery({
    queryKey: queryKeys.telegram.status(),
    queryFn: async () => {
      const status = await telegramSdk.getTelegramIntegrationStatus();
      return mapStatusToView(status);
    },
  });
}

export function useTelegramLinkTokenMutation() {
  return useMutation({
    mutationFn: () => telegramSdk.createTelegramLinkToken(),
  });
}

export function useTelegramLinkStatusQuery(enabled = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...queryKeys.telegram.all, 'link'],
    queryFn: () => telegramSdk.getTelegramLinkStatus(),
    enabled,
    refetchInterval: (q) => (enabled && !q.state.data?.linked ? 3000 : false),
  });

  useEffect(() => {
    if (query.data?.linked) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.telegram.status() });
    }
  }, [query.data?.linked, queryClient]);

  return query;
}

export function useTelegramCommandsQuery() {
  return useQuery({
    queryKey: [...queryKeys.telegram.all, 'commands'],
    queryFn: async (): Promise<TelegramCommand[]> => telegramSdk.listTelegramCommands(),
  });
}

export function useTelegramLogsQuery(params?: { status?: 'success' | 'failed' }) {
  return useQuery({
    queryKey: [...queryKeys.telegram.all, 'logs', params ?? {}],
    queryFn: async (): Promise<TelegramLog[]> => telegramSdk.listTelegramMessages(params),
  });
}

export function useTelegramMetricsQuery() {
  return useQuery({
    queryKey: [...queryKeys.telegram.all, 'metrics'],
    queryFn: async (): Promise<TelegramMetrics> => {
      const stats = await telegramSdk.getTelegramStats();
      return {
        totalCommandsProcessed: stats.totalCommandsProcessed,
        activeUsersCount: stats.activeUsersCount,
        commandsUsage: stats.commandsUsage,
        trafficChart: stats.trafficChart.map((row) => ({
          date: row.date,
          sent: row.sent,
          received: row.received,
        })),
      };
    },
  });
}

export function useDisconnectAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await telegramSdk.unlinkTelegramAccount();
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegram.all });
    },
  });
}

export function useConfigureBotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: TelegramBot['settings']) => {
      const status = await telegramSdk.updateTelegramPreferences(settings);
      return mapStatusToView(status).bot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegram.all });
    },
  });
}

export function useUpdateCommandMutation() {
  return useMutation({
    mutationFn: async (data: { key: string; replyTemplate: string; enabled: boolean }) => data,
  });
}

export function useSendTestMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramSdk.sendTelegramTestMessage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.telegram.all, 'logs'] });
    },
  });
}
