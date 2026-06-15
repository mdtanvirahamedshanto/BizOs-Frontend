// =============================================================================
// BizOS API SDK — Payments Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams, PaymentMethod } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentType = 'RECEIVED' | 'MADE';
export type PayableType = 'sale' | 'purchase' | 'khata';

export interface Payment {
  id: string;
  shopId: string;
  payableType: PayableType;
  payableId: string;
  type: PaymentType;
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  isRefunded: boolean;
  refundedAt?: string;
  createdAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreatePaymentRequest {
  payableType: PayableType;
  payableId: string;
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface RefundPaymentRequest {
  notes?: string;
}

export interface PaymentQueryParams extends PaginationParams {
  payableType?: PayableType;
  payableId?: string;
  type?: PaymentType;
  method?: PaymentMethod;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Record a new payment against a sale, purchase, or khata account
 */
export async function createPayment(data: CreatePaymentRequest): Promise<Payment> {
  const res = await apiClient.post<Payment>('/payments', data);
  return res.data;
}

/**
 * List all payments with optional filters
 */
export async function listPayments(
  params?: PaymentQueryParams,
): Promise<PaginatedResponse<Payment>> {
  const res = await apiClient.get<PaginatedResponse<Payment>>('/payments', {
    params: buildParams(params),
  });
  return res.data;
}

/**
 * Get a single payment by ID
 */
export async function getPayment(paymentId: string): Promise<Payment> {
  const res = await apiClient.get<Payment>(`/payments/${paymentId}`);
  return res.data;
}

/**
 * Issue a refund for a previously collected payment
 */
export async function refundPayment(
  paymentId: string,
  data?: RefundPaymentRequest,
): Promise<Payment> {
  const res = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, data ?? {});
  return res.data;
}
