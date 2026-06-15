// =============================================================================
// BizOS — Purchase Types
// Covers: purchase orders, line items, returns, payments-due tracking
// =============================================================================

import type { UUID, ISODateString, Cents } from './common.types';
import type {
  PurchaseStatus,
  PaymentStatus,
  PaymentMethod,
  PaginationParams,
  SoftDeletable,
} from './common.types';
import type { SupplierRef } from './supplier.types';

// ─── Purchase Item (Line Item) ────────────────────────────────────────────────

export interface PurchaseItem {
  readonly id: UUID;
  readonly purchaseId: UUID;
  readonly productId: UUID;
  /** Snapshot of name at time of purchase — immutable */
  readonly productName: string;
  /** Snapshot of SKU at time of purchase — immutable */
  readonly sku: string;
  readonly quantity: number;
  readonly unitCostCents: Cents;
  readonly totalCents: Cents;
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export interface Purchase extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  /** Sequential reference number (e.g. "PO-2024-00019") */
  readonly referenceNumber: string;
  readonly supplierId: UUID | null;
  readonly supplier: SupplierRef | null;
  readonly purchasedBy: UUID;
  readonly purchasedByName: string | null;
  readonly purchaseDate: ISODateString;
  readonly expectedDate: ISODateString | null;
  readonly receivedDate: ISODateString | null;
  readonly status: PurchaseStatus;
  readonly paymentStatus: PaymentStatus;
  readonly subtotalCents: Cents;
  readonly taxCents: Cents;
  readonly discountCents: Cents;
  readonly totalCents: Cents;
  readonly paidCents: Cents;
  readonly dueCents: Cents;
  readonly notes: string | null;
  readonly items: readonly PurchaseItem[];
}

/** Lightweight summary for purchase list views */
export type PurchaseSummary = Omit<Purchase, 'items'>;

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface PurchaseReturnItem {
  productId: UUID;
  quantity: number;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreatePurchaseItemRequest {
  productId: UUID;
  quantity: number;
  unitCostCents: number;
}

export interface CreatePurchasePaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CreatePurchaseRequest {
  supplierId?: UUID;
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

export interface ReturnPurchaseRequest {
  items?: PurchaseReturnItem[];
  refundAmountCents?: number;
  notes?: string;
}

export interface PurchaseQueryParams extends PaginationParams {
  search?: string;
  status?: PurchaseStatus;
  paymentStatus?: PaymentStatus;
  supplierId?: UUID;
}
