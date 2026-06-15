// =============================================================================
// BizOS API SDK — Purchases Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, PaymentMethod, PurchaseStatus, PaymentStatus } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCostCents: number;
  lineTotalCents: number;
}

export interface Purchase {
  id: string;
  shopId: string;
  supplierId?: string;
  supplierName?: string;
  purchaseDate: string;
  expectedDate?: string;
  receivedDate?: string;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  paidCents: number;
  dueCents: number;
  notes?: string;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreatePurchaseItemRequest {
  productId: string;
  quantity: number;
  unitCostCents: number;
}

export interface CreatePurchasePaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CreatePurchaseRequest {
  supplierId?: string;
  purchaseDate?: string;
  expectedDate?: string;
  status?: Exclude<PurchaseStatus, 'CANCELLED'>;
  taxCents?: number;
  discountCents?: number;
  notes?: string;
  items: CreatePurchaseItemRequest[];
  payment?: CreatePurchasePaymentRequest;
}

export interface UpdatePurchaseStatusRequest {
  status?: PurchaseStatus;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface ReturnPurchaseItemRequest {
  productId: string;
  quantity: number;
}

export interface ReturnPurchaseRequest {
  items?: ReturnPurchaseItemRequest[];
  refundAmountCents?: number;
  notes?: string;
}

export interface PurchaseQueryParams extends PaginationParams {
  search?: string;
  status?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Create a new purchase order (supports immediate RECEIVED or draft/ordered)
 */
export async function createPurchase(data: CreatePurchaseRequest): Promise<Purchase> {
  const res = await apiClient.post<Purchase>('/purchases', data);
  return res.data;
}

/**
 * List purchases with optional filters and cursor pagination
 */
export async function listPurchases(
  params?: PurchaseQueryParams,
): Promise<PaginatedResponse<Purchase>> {
  const res = await apiClient.get<PaginatedResponse<Purchase>>('/purchases', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a single purchase by ID
 */
export async function getPurchase(purchaseId: string): Promise<Purchase> {
  const res = await apiClient.get<Purchase>(`/purchases/${purchaseId}`);
  return res.data;
}

/**
 * Update the status or dates of a purchase order
 */
export async function updatePurchaseStatus(
  purchaseId: string,
  data: UpdatePurchaseStatusRequest,
): Promise<Purchase> {
  const res = await apiClient.put<Purchase>(`/purchases/${purchaseId}/status`, data);
  return res.data;
}

/**
 * Process a return for a purchase (adjusts inventory and due)
 */
export async function returnPurchase(
  purchaseId: string,
  data: ReturnPurchaseRequest,
): Promise<Purchase> {
  const res = await apiClient.post<Purchase>(`/purchases/${purchaseId}/return`, data);
  return res.data;
}
