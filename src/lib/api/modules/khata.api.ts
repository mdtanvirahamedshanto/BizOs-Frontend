// =============================================================================
// BizOS API SDK — Khata (Credit Ledger) Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, PaymentMethod } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type KhataPartyType = 'CUSTOMER' | 'SUPPLIER';
export type KhataEntryType = 'CREDIT' | 'DEBIT' | 'COLLECTION' | 'REPAYMENT' | 'ADJUSTMENT';

export interface KhataAccount {
  id: string;
  shopId: string;
  partyType: KhataPartyType;
  partyId: string;
  partyName: string;
  /** Positive = party owes the shop; Negative = shop owes party */
  balanceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KhataEntry {
  id: string;
  accountId: string;
  type: KhataEntryType;
  amountCents: number;
  balanceAfterCents: number;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  description?: string;
  createdAt: string;
}

export interface KhataDueSummary {
  totalDueCents: number;
  totalReceivableCents: number;
  customerDueCents: number;
  supplierDueCents: number;
  accountsCount: number;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface KhataQueryParams extends PaginationParams {
  partyType?: KhataPartyType;
  isActive?: boolean;
}

export interface KhataEntryQueryParams extends PaginationParams {}

export interface RecordCollectionRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface RecordRepaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface KhataAdjustmentRequest {
  type: 'CREDIT' | 'DEBIT' | 'ADJUSTMENT';
  amountCents: number;
  description: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Get the aggregated due/receivable summary across all khata accounts
 */
export async function getKhataDueSummary(): Promise<KhataDueSummary> {
  const res = await apiClient.get<KhataDueSummary>('/khata/due-summary');
  return res.data;
}

/**
 * List all khata (credit) accounts for the shop
 */
export async function listKhataAccounts(
  params?: KhataQueryParams,
): Promise<PaginatedResponse<KhataAccount>> {
  const res = await apiClient.get<PaginatedResponse<KhataAccount>>('/khata/accounts', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a single khata account by ID
 */
export async function getKhataAccount(accountId: string): Promise<KhataAccount> {
  const res = await apiClient.get<KhataAccount>(`/khata/accounts/${accountId}`);
  return res.data;
}

/**
 * List all ledger entries for a khata account (paginated)
 */
export async function listKhataEntries(
  accountId: string,
  params?: KhataEntryQueryParams,
): Promise<PaginatedResponse<KhataEntry>> {
  const res = await apiClient.get<PaginatedResponse<KhataEntry>>(
    `/khata/accounts/${accountId}/entries`,
    { params: buildParams(params) },
  );
  return res.data;
}

/**
 * Record a cash collection from a customer (reduces their due balance)
 */
export async function recordCollection(
  accountId: string,
  data: RecordCollectionRequest,
): Promise<KhataEntry> {
  const res = await apiClient.post<KhataEntry>(`/khata/accounts/${accountId}/collection`, data);
  return res.data;
}

/**
 * Record a repayment to a supplier (reduces what shop owes)
 */
export async function recordRepayment(
  accountId: string,
  data: RecordRepaymentRequest,
): Promise<KhataEntry> {
  const res = await apiClient.post<KhataEntry>(`/khata/accounts/${accountId}/repayment`, data);
  return res.data;
}

/**
 * Record a manual adjustment (credit, debit, or correction) on a khata account
 */
export async function recordKhataAdjustment(
  accountId: string,
  data: KhataAdjustmentRequest,
): Promise<KhataEntry> {
  const res = await apiClient.post<KhataEntry>(`/khata/accounts/${accountId}/adjustments`, data);
  return res.data;
}
