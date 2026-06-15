// =============================================================================
// BizOS — Khata (Credit Ledger) Types
// Covers: khata accounts, immutable entries, collections, repayments, adjustments
//
// Semantics:
//   balanceCents > 0  → party owes the shop (receivable / উধার)
//   balanceCents < 0  → shop owes the party (payable / বকেয়া)
// =============================================================================

import type { UUID, ISODateString, Cents } from './common.types';
import type { PaymentMethod, PartyType, PaginationParams } from './common.types';

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * CREDIT    = party's balance increased (they owe more / shop owes less)
 * DEBIT     = party's balance decreased (they paid / shop received goods)
 * ADJUSTMENT = manual correction
 */
export type KhataEntryType = 'CREDIT' | 'DEBIT' | 'ADJUSTMENT';

// ─── Khata Account ────────────────────────────────────────────────────────────

export interface KhataAccount {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly partyType: PartyType;
  readonly partyId: UUID;
  readonly partyName: string;
  readonly partyPhone: string | null;
  /**
   * Running balance in cents.
   * Positive: party owes shop.
   * Negative: shop owes party.
   */
  readonly balanceCents: Cents;
  /** Maximum credit extended to this party */
  readonly creditLimitCents: Cents;
  readonly isActive: boolean;
  readonly notes: string | null;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

/** Lightweight reference for summary cards */
export type KhataAccountRef = Pick<
  KhataAccount,
  'id' | 'partyType' | 'partyId' | 'partyName' | 'balanceCents'
>;

// ─── Khata Entry (Immutable Ledger) ──────────────────────────────────────────

/**
 * Immutable financial transaction record.
 * Never deleted — forms the complete credit ledger audit trail.
 */
export interface KhataEntry {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly khataAccountId: UUID;
  readonly type: KhataEntryType;
  /** Always stored as a positive integer (direction determined by type) */
  readonly amountCents: Cents;
  /** Running balance after this entry was applied */
  readonly runningBalanceCents: Cents;
  readonly description: string;
  /** What triggered this entry: "sale" | "purchase" | "payment" | "manual" */
  readonly referenceType: KhataReferenceType | null;
  readonly referenceId: UUID | null;
  readonly recordedBy: UUID;
  readonly recordedByName: string | null;
  readonly entryDate: ISODateString;
  readonly createdAt: ISODateString;
}

export type KhataReferenceType = 'sale' | 'purchase' | 'payment' | 'collection' | 'repayment' | 'adjustment';

// ─── Due Summary ──────────────────────────────────────────────────────────────

export interface KhataDueSummary {
  /** Total owed to the shop (sum of positive customer balances) */
  readonly totalReceivableCents: Cents;
  /** Total owed by the shop (sum of negative supplier balances) */
  readonly totalPayableCents: Cents;
  /** Net: receivableCents - payableCents */
  readonly netBalanceCents: Cents;
  /** Number of customer accounts with outstanding balance > 0 */
  readonly overdueCustomersCount: number;
  /** Number of supplier accounts where shop has outstanding payable */
  readonly overdueSupplierDueCount: number;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface KhataQueryParams extends PaginationParams {
  partyType?: PartyType;
  isActive?: boolean;
}

export interface KhataEntryQueryParams extends PaginationParams {}

/** Collect payment from a customer (reduces their balance) */
export interface RecordCollectionRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

/** Make repayment to a supplier (reduces shop's outstanding payable) */
export interface RecordRepaymentRequest {
  amountCents: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

/** Manual balance correction */
export interface KhataAdjustmentRequest {
  type: 'CREDIT' | 'DEBIT' | 'ADJUSTMENT';
  amountCents: number;
  /** Required description for audit purposes */
  description: string;
}
