// =============================================================================
// BizOS API SDK — Sales Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, PaymentMethod, SaleStatus, PaymentStatus } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  lineTotalCents: number;
}

export interface Sale {
  id: string;
  shopId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  saleDate: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmountCents: number;
  taxAmountCents: number;
  totalCents: number;
  paidCents: number;
  dueCents: number;
  notes?: string;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
}

export interface SalePaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CreateSaleRequest {
  customerId?: string;
  saleDate?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  notes?: string;
  items: CreateSaleItemRequest[];
  payment?: SalePaymentRequest;
}

export interface ReturnSaleItemRequest {
  productId: string;
  quantity: number;
}

export interface ReturnSaleRequest {
  items?: ReturnSaleItemRequest[];
  refundAmountCents?: number;
  notes?: string;
}

export interface SaleQueryParams extends PaginationParams {
  search?: string;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Create a new sale (supports cart checkout with optional payment)
 */
export async function createSale(data: CreateSaleRequest): Promise<Sale> {
  const res = await apiClient.post<Sale>('/sales', data);
  return res.data;
}

/**
 * List sales with optional filters and cursor pagination
 */
export async function listSales(params?: SaleQueryParams): Promise<PaginatedResponse<Sale>> {
  const res = await apiClient.get<PaginatedResponse<Sale>>('/sales', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a single sale by ID (with full item breakdown)
 */
export async function getSale(saleId: string): Promise<Sale> {
  const res = await apiClient.get<Sale>(`/sales/${saleId}`);
  return res.data;
}

/**
 * Generate and return a PDF invoice URL for a sale
 */
export async function generateInvoicePdf(saleId: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/sales/${saleId}/invoice`, {
    responseType: 'blob',
  });
  return res.data;
}

/**
 * Process a full or partial return for a completed sale
 */
export async function returnSale(saleId: string, data: ReturnSaleRequest): Promise<Sale> {
  const res = await apiClient.post<Sale>(`/sales/${saleId}/return`, data);
  return res.data;
}
