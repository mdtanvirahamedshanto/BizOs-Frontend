// =============================================================================
// BizOS API SDK — Suppliers Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalDueCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDueTracking {
  supplierId: string;
  supplierName: string;
  totalPurchasesCents: number;
  totalPaidCents: number;
  outstandingDueCents: number;
  lastPurchaseDate?: string;
}

export interface SupplierLedgerEntry {
  id: string;
  type: 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT';
  description: string;
  amountCents: number;
  balanceCents: number;
  createdAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateSupplierRequest {
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

export interface SupplierQueryParams extends PaginationParams {
  search?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * List all suppliers for the current shop
 */
export async function listSuppliers(
  params?: SupplierQueryParams,
): Promise<PaginatedResponse<Supplier>> {
  const res = await apiClient.get<PaginatedResponse<Supplier>>('/suppliers', {
    params: buildParams(params),
  });
  return res.data;
}

/**
 * Get a single supplier by ID
 */
export async function getSupplier(supplierId: string): Promise<Supplier> {
  const res = await apiClient.get<Supplier>(`/suppliers/${supplierId}`);
  return res.data;
}

/**
 * Create a new supplier
 */
export async function createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
  const res = await apiClient.post<Supplier>('/suppliers', data);
  return res.data;
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(
  supplierId: string,
  data: UpdateSupplierRequest,
): Promise<Supplier> {
  const res = await apiClient.put<Supplier>(`/suppliers/${supplierId}`, data);
  return res.data;
}

/**
 * Delete a supplier by ID
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  await apiClient.delete(`/suppliers/${supplierId}`);
}

/**
 * Get a supplier's outstanding due and purchase summary
 */
export async function getSupplierDueTracking(supplierId: string): Promise<SupplierDueTracking> {
  const res = await apiClient.get<SupplierDueTracking>(`/suppliers/${supplierId}/due-tracking`);
  return res.data;
}

/**
 * Get paginated purchase history for a supplier
 */
export async function getSupplierPurchaseHistory(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<SupplierLedgerEntry>>(
    `/suppliers/${supplierId}/purchases`,
    { params: buildParams(params) },
  );
  return res.data;
}

/**
 * Get the full ledger (credit/debit log) for a supplier
 */
export async function getSupplierLedger(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<SupplierLedgerEntry>>(
    `/suppliers/${supplierId}/ledger`,
    { params: buildParams(params) },
  );
  return res.data;
}

/**
 * Get all payments made to a supplier
 */
export async function getSupplierPayments(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<SupplierLedgerEntry>>(
    `/suppliers/${supplierId}/payments`,
    { params: buildParams(params) },
  );
  return res.data;
}
