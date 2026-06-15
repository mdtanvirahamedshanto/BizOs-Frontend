// =============================================================================
// BizOS API SDK — Telegram Integration Module
// =============================================================================

import { apiClient } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TelegramLinkStatus {
  isLinked: boolean;
  telegramUserId?: string;
  telegramUsername?: string;
  linkedAt?: string;
}

export interface TelegramLinkToken {
  linkToken: string;
  linkUrl: string;
  expiresAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Generate a one-time link token for connecting a Telegram account
 */
export async function createTelegramLinkToken(): Promise<TelegramLinkToken> {
  const res = await apiClient.post<TelegramLinkToken>('/telegram/link');
  return res.data;
}

/**
 * Get the current Telegram account link status for the shop
 */
export async function getTelegramLinkStatus(): Promise<TelegramLinkStatus> {
  const res = await apiClient.get<TelegramLinkStatus>('/telegram/link');
  return res.data;
}

/**
 * Unlink the connected Telegram account from the shop
 */
export async function unlinkTelegramAccount(): Promise<void> {
  await apiClient.delete('/telegram/link');
}
