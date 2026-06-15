// =============================================================================
// BizOS API SDK — Telegram Integration Module
// =============================================================================

import { apiClient } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TelegramLinkStatus {
  linked: boolean;
  linkedAt?: string;
  telegramUsername?: string;
}

export interface TelegramLinkToken {
  token: string;
  deepLink: string;
  expiresIn: number;
}

export interface TelegramBotSettings {
  sendDailyReport: boolean;
  sendLowStockAlert: boolean;
  sendDueNotification: boolean;
}

export interface TelegramIntegrationStatus {
  account: {
    connected: boolean;
    username?: string;
    userId?: string;
    linkedAt?: string;
  };
  bot: {
    connected: boolean;
    botUsername?: string;
    botName?: string;
    settings: TelegramBotSettings;
  };
}

export interface TelegramActivityLog {
  id: string;
  chatId: string;
  userTelegram: string;
  incomingText: string;
  outgoingText: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface TelegramActivityStats {
  totalCommandsProcessed: number;
  activeUsersCount: number;
  commandsUsage: { command: string; count: number }[];
  trafficChart: { date: string; sent: number; received: number }[];
  successRate: number;
  failedCount: number;
}

export interface TelegramBotCommand {
  key: string;
  command: string;
  description: string;
  replyTemplate: string;
  usageCount: number;
  enabled: boolean;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createTelegramLinkToken(): Promise<TelegramLinkToken> {
  const res = await apiClient.post<TelegramLinkToken>('/telegram/link');
  return res.data;
}

export async function getTelegramLinkStatus(): Promise<TelegramLinkStatus> {
  const res = await apiClient.get<TelegramLinkStatus>('/telegram/link');
  return res.data;
}

export async function unlinkTelegramAccount(): Promise<void> {
  await apiClient.delete('/telegram/link');
}

export async function getTelegramIntegrationStatus(): Promise<TelegramIntegrationStatus> {
  const res = await apiClient.get<TelegramIntegrationStatus>('/telegram/status');
  return res.data;
}

export async function listTelegramMessages(params?: {
  status?: 'success' | 'failed';
  limit?: number;
  offset?: number;
}): Promise<TelegramActivityLog[]> {
  const res = await apiClient.get<TelegramActivityLog[]>('/telegram/messages', { params });
  return res.data;
}

export async function getTelegramStats(): Promise<TelegramActivityStats> {
  const res = await apiClient.get<TelegramActivityStats>('/telegram/stats');
  return res.data;
}

export async function listTelegramCommands(): Promise<TelegramBotCommand[]> {
  const res = await apiClient.get<TelegramBotCommand[]>('/telegram/commands');
  return res.data;
}

export async function updateTelegramPreferences(
  settings: Partial<TelegramBotSettings>,
): Promise<TelegramIntegrationStatus> {
  const res = await apiClient.put<TelegramIntegrationStatus>('/telegram/preferences', settings);
  return res.data;
}

export async function sendTelegramTestMessage(): Promise<boolean> {
  const res = await apiClient.post<boolean>('/telegram/test');
  return res.data;
}
