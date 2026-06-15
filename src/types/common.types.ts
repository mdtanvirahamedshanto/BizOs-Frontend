// =============================================================================
// BizOS — Primitive & Utility Types
// Foundation types used across all domain modules.
// =============================================================================

// ─── Branded Scalar Types ─────────────────────────────────────────────────────
// Prevents accidental mixing of different ID types or monetary values.

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

/** UUID v4 string — all entity primary keys */
export type UUID = Brand<string, 'UUID'>;

/** ISO 8601 datetime string (e.g. "2024-06-15T10:30:00.000Z") */
export type ISODateString = Brand<string, 'ISODateString'>;

/** ISO 8601 date-only string (e.g. "2024-06-15") */
export type ISODateOnly = Brand<string, 'ISODateOnly'>;

/**
 * Monetary value stored as integer cents.
 * ৳15.50 is represented as 1550.
 * NEVER use floating point for financial math.
 */
export type Cents = Brand<number, 'Cents'>;

/** Percentage as decimal 0–1 (e.g. 0.15 = 15%) */
export type DecimalRate = Brand<number, 'DecimalRate'>;

/** Bangladeshi phone number (e.g. "+8801712345678") */
export type BDPhone = Brand<string, 'BDPhone'>;

/** Hex color string (e.g. "#FF5722") */
export type HexColor = Brand<string, 'HexColor'>;

/** URL string (validated) */
export type UrlString = Brand<string, 'UrlString'>;

// ─── Helper: make all properties optional & nullable ─────────────────────────

export type Nullable<T> = { [K in keyof T]: T[K] | null };
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  readonly total: number;
  readonly limit: number;
  readonly cursor?: string;
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  readonly message: string;
  readonly code?: string;
  /** Zod field-level validation errors: { fieldName: string[] } */
  readonly details?: Readonly<Record<string, readonly string[]>>;
  readonly statusCode?: number;
}

// ─── Shared Enums ─────────────────────────────────────────────────────────────

export type PaymentMethod =
  | 'CASH'
  | 'BKASH'
  | 'NAGAD'
  | 'ROCKET'
  | 'UPAY'
  | 'BANK'
  | 'CARD'
  | 'CHECK'
  | 'OTHER';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID';
export type PaymentType = 'RECEIVED' | 'MADE';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type SaleStatus = 'DRAFT' | 'COMPLETED' | 'RETURNED' | 'VOID';
export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PartyType = 'CUSTOMER' | 'SUPPLIER';

// ─── Address ──────────────────────────────────────────────────────────────────

export interface AddressGeneric {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface AddressBD {
  street?: string;
  area?: string;
  city?: string;
  district?: string;
}

// ─── Timestamps Mixin ─────────────────────────────────────────────────────────

export interface Timestamps {
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface SoftDeletable extends Timestamps {
  readonly deletedAt: ISODateString | null;
}
