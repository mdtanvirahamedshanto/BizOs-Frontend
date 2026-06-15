// =============================================================================
// BizOS — Sales Types
// Covers: sale, sale items, invoice, returns, POS cart
// =============================================================================

import type { UUID, ISODateString, Cents } from './common.types';
import type {
  SaleStatus,
  PaymentStatus,
  PaymentMethod,
  DiscountType,
  PaginationParams,
  SoftDeletable,
} from './common.types';
import type { CustomerRef } from './customer.types';

// ─── Sale Item (Line Item) ────────────────────────────────────────────────────

export interface SaleItem {
  readonly id: UUID;
  readonly saleId: UUID;
  readonly productId: UUID;
  /** Snapshot of name at time of sale — immutable */
  readonly productName: string;
  /** Snapshot of SKU at time of sale — immutable */
  readonly sku: string;
  readonly quantity: number;
  readonly unitPriceCents: Cents;
  /** Applied item-level discount in cents */
  readonly discountCents: Cents;
  readonly taxCents: Cents;
  readonly totalCents: Cents;
}

// ─── Sale ─────────────────────────────────────────────────────────────────────

export interface Sale extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  /** Sequential invoice number (e.g. "INV-2024-00042") */
  readonly invoiceNumber: string;
  readonly customerId: UUID | null;
  readonly customer: CustomerRef | null;
  readonly soldBy: UUID;
  readonly soldByName: string | null;
  readonly saleDate: ISODateString;
  readonly status: SaleStatus;
  readonly paymentStatus: PaymentStatus;
  readonly subtotalCents: Cents;
  readonly discountType: DiscountType | null;
  readonly discountValue: number;
  /** Resolved discount amount in cents */
  readonly discountCents: Cents;
  readonly taxCents: Cents;
  readonly totalCents: Cents;
  readonly paidCents: Cents;
  readonly dueCents: Cents;
  readonly notes: string | null;
  readonly items: readonly SaleItem[];
}

/** Lightweight sale summary for list views */
export type SaleSummary = Omit<Sale, 'items'>;

// ─── POS Cart Types ───────────────────────────────────────────────────────────

/**
 * A cart line item before becoming a persisted SaleItem.
 * Used during the POS checkout flow.
 */
export interface CartItem {
  productId: UUID;
  productName: string;
  sku: string;
  unitPriceCents: Cents;
  quantity: number;
  discountType?: DiscountType;
  discountValue?: number;
  /** Computed: (unitPriceCents × quantity) - discount */
  readonly lineTotalCents: Cents;
}

export interface Cart {
  items: CartItem[];
  customerId?: UUID;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
}

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface SaleReturnItem {
  productId: UUID;
  quantity: number;
}

export interface SaleReturn {
  readonly id: UUID;
  readonly originalSaleId: UUID;
  readonly items: readonly SaleReturnItem[];
  readonly refundAmountCents: Cents;
  readonly notes: string | null;
  readonly processedAt: ISODateString;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateSaleItemRequest {
  productId: UUID;
  quantity: number;
  discountType?: DiscountType;
  discountValue?: number;
}

export interface SalePaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CreateSaleRequest {
  customerId?: UUID;
  /** ISO date string; defaults to now */
  saleDate?: string;
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  items: CreateSaleItemRequest[];
  payment?: SalePaymentRequest;
}

export interface ReturnSaleRequest {
  items?: SaleReturnItem[];
  refundAmountCents?: number;
  notes?: string;
}

export interface SaleQueryParams extends PaginationParams {
  search?: string;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  customerId?: UUID;
  startDate?: Date;
  endDate?: Date;
}
