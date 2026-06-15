// =============================================================================
// BizOS API SDK — Cashbook Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CashEntryType = 'IN' | 'OUT';
export type CashEntrySource =
  | 'SALE'
  | 'PURCHASE_PAYMENT'
  | 'EXPENSE'
  | 'MANUAL_IN'
  | 'MANUAL_OUT'
  | 'CLOSING';

export interface CashEntry {
  id: string;
  shopId: string;
  type: CashEntryType;
  source: CashEntrySource;
  amountCents: number;
  balanceAfterCents: number;
  description: string;
  reference?: string;
  entryDate: string;
  createdAt: string;
}

export interface CashBalance {
  currentBalanceCents: number;
  lastUpdatedAt: string;
}

export interface ClosingPreview {
  openingBalanceCents: number;
  totalCashInCents: number;
  totalCashOutCents: number;
  expectedClosingBalanceCents: number;
  date: string;
}

export interface DailyClosing {
  id: string;
  shopId: string;
  date: string;
  openingBalanceCents: number;
  totalCashInCents: number;
  totalCashOutCents: number;
  expectedBalanceCents: number;
  actualBalanceCents: number;
  discrepancyCents: number;
  notes?: string;
  createdAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface ManualCashEntryRequest {
  amountCents: number;
  description: string;
  reference?: string;
}

export interface DailyClosingRequest {
  actualBalanceCents: number;
  notes?: string;
}

export interface CashbookQueryParams extends PaginationParams {
  type?: CashEntryType;
  startDate?: Date;
  endDate?: Date;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Record a manual cash-in entry (e.g. owner investment, loan received)
 */
export async function recordCashIn(data: ManualCashEntryRequest): Promise<CashEntry> {
  const res = await apiClient.post<CashEntry>('/cashbook/cash-in', data);
  return res.data;
}

/**
 * Record a manual cash-out entry (e.g. owner withdrawal, misc payment)
 */
export async function recordCashOut(data: ManualCashEntryRequest): Promise<CashEntry> {
  const res = await apiClient.post<CashEntry>('/cashbook/cash-out', data);
  return res.data;
}

/**
 * Get the current real-time cash balance
 */
export async function getCashBalance(): Promise<CashBalance> {
  const res = await apiClient.get<CashBalance>('/cashbook/balance');
  return res.data;
}

/**
 * List cashbook entries with optional type/date filters
 */
export async function listCashbookEntries(
  params?: CashbookQueryParams,
): Promise<PaginatedResponse<CashEntry>> {
  const res = await apiClient.get<PaginatedResponse<CashEntry>>('/cashbook/entries', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a preview of today's closing (expected balance before confirming)
 */
export async function getClosingPreview(): Promise<ClosingPreview> {
  const res = await apiClient.get<ClosingPreview>('/cashbook/closing-preview');
  return res.data;
}

/**
 * Record the end-of-day cash closing with the actual counted balance
 */
export async function recordDailyClosing(data: DailyClosingRequest): Promise<DailyClosing> {
  const res = await apiClient.post<DailyClosing>('/cashbook/closing', data);
  return res.data;
}

/**
 * List all past daily closing records
 */
export async function listDailyClosings(): Promise<DailyClosing[]> {
  const res = await apiClient.get<DailyClosing[]>('/cashbook/closings');
  return res.data;
}
