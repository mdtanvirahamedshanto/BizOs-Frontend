// =============================================================================
// BizOS — Supplier Types
// Covers: supplier profile, due tracking, ledger, payment history
// =============================================================================

import type { UUID, ISODateString, Cents } from './common.types';
import type { AddressGeneric, PaginationParams, SoftDeletable } from './common.types';
import type { PaymentMethod, PaymentStatus } from './common.types';

// ─── Supplier Entity ──────────────────────────────────────────────────────────

export interface Supplier extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  /** Trading / company name */
  readonly company: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: AddressGeneric | null;
  /** Net-30, COD, etc. */
  readonly paymentTerms: string | null;
  readonly notes: string | null;
  /** Aggregate total supplied across all purchases (cents) */
  readonly totalSuppliedCents: Cents;
}

/** Lightweight reference embedded in other models (e.g. Purchase) */
export type SupplierRef = Pick<Supplier, 'id' | 'name' | 'phone'>;

// ─── Due Tracking ─────────────────────────────────────────────────────────────

export interface SupplierDueTracking {
  readonly supplierId: UUID;
  readonly supplierName: string;
  readonly totalPurchasesCents: Cents;
  readonly totalPaidCents: Cents;
  readonly outstandingDueCents: Cents;
  readonly paymentStatus: PaymentStatus;
  readonly lastPurchaseDate: ISODateString | null;
  readonly lastPaymentDate: ISODateString | null;
}

// ─── Supplier Ledger Entry ────────────────────────────────────────────────────

export type SupplierLedgerEntryType = 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT' | 'RETURN';

export interface SupplierLedgerEntry {
  readonly id: UUID;
  readonly type: SupplierLedgerEntryType;
  readonly description: string;
  readonly amountCents: Cents;
  readonly balanceCents: Cents;
  readonly paymentMethod?: PaymentMethod;
  readonly reference?: string;
  readonly createdAt: ISODateString;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateSupplierRequest {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: AddressGeneric;
  paymentTerms?: string;
  notes?: string;
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

export interface SupplierQueryParams extends PaginationParams {
  search?: string;
}
