// =============================================================================
// BizOS — Inventory Types
// Covers: stock movements (immutable ledger), stock adjustment requests,
//         low-stock alerts, and inventory report items
// =============================================================================

import type { UUID, ISODateString, Cents } from './common.types';
import type { PaginationParams } from './common.types';
import type { ProductRef } from './product.types';

// ─── Stock Movement Type ──────────────────────────────────────────────────────

/**
 * Mirrors the Prisma StockMovementType enum.
 * IN    = stock received (purchase / initial stock)
 * OUT   = stock dispatched (sale / write-off)
 * ADJUSTMENT = manual correction
 * RETURN     = customer / supplier return
 * DAMAGE     = damaged / spoiled write-off
 */
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';

// ─── Stock Movement (Immutable Ledger Entry) ──────────────────────────────────

/**
 * An append-only record of every stock change.
 * Never deleted — forms the complete inventory audit trail.
 */
export interface StockMovement {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly productId: UUID;
  readonly product: ProductRef | null;
  readonly type: StockMovementType;
  /** Positive = stock increased; Negative = stock decreased */
  readonly quantity: number;
  readonly unitCostCents: Cents | null;
  /** What triggered this movement: "sale" | "purchase" | "adjustment" */
  readonly referenceType: StockMovementReferenceType | null;
  readonly referenceId: UUID | null;
  readonly notes: string | null;
  readonly createdBy: UUID | null;
  readonly createdByName: string | null;
  readonly createdAt: ISODateString;
}

export type StockMovementReferenceType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage';

// ─── Stock Level Snapshot ─────────────────────────────────────────────────────

/** Current stock level for a single product — used in inventory dashboards */
export interface StockLevel {
  readonly productId: UUID;
  readonly productName: string;
  readonly sku: string;
  readonly unit: string;
  readonly quantity: number;
  readonly lowStockThreshold: number;
  readonly isLowStock: boolean;
  readonly isOutOfStock: boolean;
  readonly costPriceCents: Cents;
  readonly stockValueCents: Cents;
  readonly lastMovementAt: ISODateString | null;
}

// ─── Inventory Report Snapshot ────────────────────────────────────────────────

export interface InventoryReportItem {
  readonly productId: UUID;
  readonly sku: string;
  readonly name: string;
  readonly brand: string | null;
  readonly categoryName: string | null;
  readonly unit: string;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly isLowStock: boolean;
  readonly isOutOfStock: boolean;
  readonly sellPriceCents: Cents;
  readonly costPriceCents: Cents;
  readonly stockValueCents: Cents;
}

export interface InventoryReport {
  readonly generatedAt: ISODateString;
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly totalStockValueCents: Cents;
  readonly items: readonly InventoryReportItem[];
}

// ─── Low Stock Alert ──────────────────────────────────────────────────────────

export interface LowStockAlert {
  readonly productId: UUID;
  readonly productName: string;
  readonly sku: string;
  readonly currentStock: number;
  readonly threshold: number;
  readonly deficitQuantity: number;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/** Manual stock adjustment — e.g. from a physical count */
export interface StockAdjustmentRequest {
  readonly productId: UUID;
  readonly type: Extract<StockMovementType, 'IN' | 'OUT' | 'ADJUSTMENT' | 'DAMAGE'>;
  readonly quantity: number;
  readonly unitCostCents?: number;
  readonly notes: string;
}

export interface StockMovementQueryParams extends PaginationParams {
  productId?: UUID;
  type?: StockMovementType;
  referenceType?: StockMovementReferenceType;
  startDate?: Date;
  endDate?: Date;
}
