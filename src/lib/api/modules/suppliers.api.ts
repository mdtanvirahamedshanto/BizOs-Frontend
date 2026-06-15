// =============================================================================
// BizOS API SDK — Suppliers Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';
import type { CustomerAddress } from './customers.api';

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
  purchaseDueCents: number;
  khataBalanceCents: number;
  totalShopOwesCents: number;
  /** @deprecated use totalShopOwesCents */
  totalPurchasesCents?: number;
  totalPaidCents?: number;
  outstandingDueCents?: number;
  lastPurchaseDate?: string;
}

export interface SupplierLedgerEntry {
  id: string;
  type: 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT' | 'DEBIT' | 'CREDIT' | 'REPAYMENT';
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

// ─── Normalizers (backend Prisma shape → SDK shape) ──────────────────────────

function formatAddressField(address: unknown): string | undefined {
  if (!address) return undefined;
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const a = address as CustomerAddress;
    return [a.street, a.area, a.city, a.district].filter(Boolean).join(', ') || undefined;
  }
  return undefined;
}

function normalizeSupplier(raw: Record<string, unknown>): Supplier {
  const khataBalance = (raw.khataBalanceCents as number) ?? 0;
  const purchaseDue = (raw.purchaseDueCents as number) ?? (raw.totalDueCents as number) ?? 0;
  const payable = purchaseDue + (khataBalance < 0 ? Math.abs(khataBalance) : 0);

  return {
    id: raw.id as string,
    shopId: raw.shopId as string,
    name: raw.name as string,
    companyName: (raw.companyName as string) ?? (raw.company as string) ?? undefined,
    phone: (raw.phone as string) ?? undefined,
    email: (raw.email as string) ?? undefined,
    address: formatAddressField(raw.address),
    notes: (raw.notes as string) ?? undefined,
    totalDueCents: payable,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

function toCreatePayload(data: CreateSupplierRequest): Record<string, unknown> {
  return {
    name: data.name,
    company: data.companyName,
    phone: data.phone,
    email: data.email,
    address: data.address ? { street: data.address } : undefined,
    notes: data.notes,
  };
}

function toUpdatePayload(data: UpdateSupplierRequest): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.companyName !== undefined) payload.company = data.companyName;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email;
  if (data.address !== undefined) payload.address = data.address ? { street: data.address } : null;
  if (data.notes !== undefined) payload.notes = data.notes;
  return payload;
}

function normalizeLedgerEntry(raw: Record<string, unknown>): SupplierLedgerEntry {
  return {
    id: raw.id as string,
    type: (raw.type as SupplierLedgerEntry['type']) ?? 'ADJUSTMENT',
    description: (raw.description as string) ?? 'লেনদেন',
    amountCents: (raw.amountCents as number) ?? 0,
    balanceCents: (raw.balanceCents as number) ?? (raw.runningBalanceCents as number) ?? 0,
    createdAt: (raw.createdAt as string) ?? (raw.entryDate as string) ?? new Date().toISOString(),
  };
}

function normalizeDueTracking(raw: Record<string, unknown>): SupplierDueTracking {
  const purchaseDueCents = (raw.purchaseDueCents as number) ?? 0;
  const khataBalanceCents = (raw.khataBalanceCents as number) ?? 0;
  const totalShopOwesCents =
    (raw.totalShopOwesCents as number) ??
    purchaseDueCents + (khataBalanceCents < 0 ? Math.abs(khataBalanceCents) : 0);

  return {
    supplierId: raw.supplierId as string,
    supplierName: raw.supplierName as string,
    purchaseDueCents,
    khataBalanceCents,
    totalShopOwesCents,
    outstandingDueCents: totalShopOwesCents,
    totalPurchasesCents: purchaseDueCents,
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listSuppliers(
  params?: SupplierQueryParams,
): Promise<PaginatedResponse<Supplier>> {
  const res = await apiClient.get<PaginatedResponse<Record<string, unknown>>>('/suppliers', {
    params: buildParams(params),
  });
  return {
    data: res.data.data.map(normalizeSupplier),
    meta: res.data.meta,
  };
}

export async function getSupplier(supplierId: string): Promise<Supplier> {
  const res = await apiClient.get<Record<string, unknown>>(`/suppliers/${supplierId}`);
  return normalizeSupplier(res.data);
}

export async function createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
  const res = await apiClient.post<Record<string, unknown>>('/suppliers', toCreatePayload(data));
  return normalizeSupplier(res.data);
}

export async function updateSupplier(
  supplierId: string,
  data: UpdateSupplierRequest,
): Promise<Supplier> {
  const res = await apiClient.put<Record<string, unknown>>(
    `/suppliers/${supplierId}`,
    toUpdatePayload(data),
  );
  return normalizeSupplier(res.data);
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  await apiClient.delete(`/suppliers/${supplierId}`);
}

export async function getSupplierDueTracking(supplierId: string): Promise<SupplierDueTracking> {
  const res = await apiClient.get<Record<string, unknown>>(
    `/suppliers/${supplierId}/due-tracking`,
  );
  return normalizeDueTracking(res.data);
}

export async function getSupplierPurchaseHistory(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
    `/suppliers/${supplierId}/purchases`,
    { params: buildParams(params) },
  );
  return {
    data: res.data.data.map(normalizeLedgerEntry),
    meta: res.data.meta,
  };
}

export async function getSupplierLedger(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
    `/suppliers/${supplierId}/ledger`,
    { params: buildParams(params) },
  );
  return {
    data: res.data.data.map(normalizeLedgerEntry),
    meta: res.data.meta,
  };
}

export async function getSupplierPayments(
  supplierId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupplierLedgerEntry>> {
  const res = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(
    `/suppliers/${supplierId}/payments`,
    { params: buildParams(params) },
  );
  return {
    data: res.data.data.map((e) => normalizeLedgerEntry({ ...e, type: 'PAYMENT' })),
    meta: res.data.meta,
  };
}
