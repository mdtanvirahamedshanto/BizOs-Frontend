// =============================================================================
// BizOS — Customer Types
// Covers: customer profile, address, attachments, query params
// =============================================================================

import type { UUID, ISODateString, Cents, UrlString } from './common.types';
import type { AddressBD, PaginationParams, SoftDeletable } from './common.types';

// ─── Customer Address ─────────────────────────────────────────────────────────

export interface CustomerAddress extends AddressBD {}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface CustomerAttachment {
  readonly fileName: string;
  readonly url: UrlString;
  readonly sizeBytes?: number;
  readonly mimeType?: string;
  readonly uploadedAt: ISODateString;
}

// ─── Customer Entity ──────────────────────────────────────────────────────────

export interface Customer extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: CustomerAddress | null;
  readonly tags: readonly string[];
  readonly notes: string | null;
  readonly attachments: readonly CustomerAttachment[];
  /** Aggregate: total amount purchased across all sales (in cents) */
  readonly totalPurchasesCents: Cents;
  /** Aggregate: total number of completed orders */
  readonly totalOrders: number;
}

/** Lightweight customer reference embedded in other models (e.g. Sale) */
export type CustomerRef = Pick<Customer, 'id' | 'name' | 'phone'>;

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: CustomerAddress;
  tags?: string[];
  notes?: string;
  attachments?: Array<Omit<CustomerAttachment, 'uploadedAt'>>;
}

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
}

// ─── Customer Stats (extended view) ──────────────────────────────────────────

export interface CustomerStats {
  readonly customerId: UUID;
  readonly totalOrders: number;
  readonly totalSpentCents: Cents;
  readonly averageOrderValueCents: Cents;
  readonly lastOrderDate: ISODateString | null;
  readonly outstandingDueCents: Cents;
}
