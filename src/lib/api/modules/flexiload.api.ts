// =============================================================================
// BizOS API SDK — Flexiload (Mobile Recharge) Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, TransactionStatus } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FlexiloadOperator = 'GP' | 'ROBI' | 'AIRTEL' | 'BL' | 'TELETALK';
export type FlexiloadConnectionType = 'PREPAID' | 'POSTPAID';

export interface FlexiloadAccount {
  id: string;
  shopId: string;
  operator: FlexiloadOperator;
  accountNumber: string;
  balanceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlexiloadTransaction {
  id: string;
  shopId: string;
  accountId: string;
  account?: Pick<FlexiloadAccount, 'id' | 'operator' | 'accountNumber'>;
  recipientPhone: string;
  amountCents: number;
  commissionCents: number;
  netAmountCents: number;
  connectionType: FlexiloadConnectionType;
  status: TransactionStatus;
  createdAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateFlexiloadAccountRequest {
  operator: FlexiloadOperator;
  accountNumber: string;
  balanceCents?: number;
  isActive?: boolean;
}

export type UpdateFlexiloadAccountRequest = Partial<CreateFlexiloadAccountRequest>;

export interface CreateFlexiloadTransactionRequest {
  accountId: string;
  recipientPhone: string;
  amountCents: number;
  commissionCents?: number;
  status?: TransactionStatus;
  connectionType?: FlexiloadConnectionType;
}

export interface FlexiloadQueryParams extends PaginationParams {
  accountId?: string;
  operator?: FlexiloadOperator;
  connectionType?: FlexiloadConnectionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

// ─── Flexiload Account API ────────────────────────────────────────────────────

export async function createFlexiloadAccount(
  data: CreateFlexiloadAccountRequest,
): Promise<FlexiloadAccount> {
  const res = await apiClient.post<FlexiloadAccount>('/flexiload/accounts', data);
  return res.data;
}

export async function listFlexiloadAccounts(): Promise<FlexiloadAccount[]> {
  const res = await apiClient.get<FlexiloadAccount[]>('/flexiload/accounts');
  return res.data;
}

export async function getFlexiloadAccount(accountId: string): Promise<FlexiloadAccount> {
  const res = await apiClient.get<FlexiloadAccount>(`/flexiload/accounts/${accountId}`);
  return res.data;
}

export async function updateFlexiloadAccount(
  accountId: string,
  data: UpdateFlexiloadAccountRequest,
): Promise<FlexiloadAccount> {
  const res = await apiClient.put<FlexiloadAccount>(`/flexiload/accounts/${accountId}`, data);
  return res.data;
}

// ─── Flexiload Recharge API ───────────────────────────────────────────────────

/**
 * Process a mobile recharge for a recipient number
 */
export async function createFlexiloadRecharge(
  data: CreateFlexiloadTransactionRequest,
): Promise<FlexiloadTransaction> {
  const res = await apiClient.post<FlexiloadTransaction>('/flexiload/recharge', data);
  return res.data;
}

/**
 * List recharge transactions with optional filters
 */
export async function listFlexiloadRecharges(
  params?: FlexiloadQueryParams,
): Promise<PaginatedResponse<FlexiloadTransaction>> {
  const res = await apiClient.get<PaginatedResponse<FlexiloadTransaction>>('/flexiload/recharges', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a single recharge transaction by ID
 */
export async function getFlexiloadRecharge(rechargeId: string): Promise<FlexiloadTransaction> {
  const res = await apiClient.get<FlexiloadTransaction>(`/flexiload/recharges/${rechargeId}`);
  return res.data;
}
