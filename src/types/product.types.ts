// =============================================================================
// BizOS — Product & Category Types
// Covers: category hierarchy, product catalog, brands, units
// =============================================================================

import type { UUID, ISODateString, Cents, DecimalRate, UrlString } from './common.types';
import type { PaginationParams, SoftDeletable } from './common.types';

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly parentId: UUID | null;
  readonly sortOrder: number;
}

/** Recursive category node for tree rendering */
export interface CategoryTreeNode extends Category {
  readonly children: readonly CategoryTreeNode[];
}

/** Lightweight category reference embedded in Product */
export type CategoryRef = Pick<Category, 'id' | 'name' | 'slug'>;

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product extends SoftDeletable {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly categoryId: UUID | null;
  readonly category: CategoryRef | null;
  readonly name: string;
  readonly slug: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly description: string | null;
  readonly brand: string | null;
  /** Retail selling price in cents */
  readonly sellPriceCents: Cents;
  /** Cost price / purchase price in cents */
  readonly costPriceCents: Cents;
  /** Tax rate as decimal 0–1 (e.g. 0.15 = 15%) */
  readonly taxRate: DecimalRate;
  /** Unit of measure: "pcs", "kg", "litre", etc. */
  readonly unit: string;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly images: readonly UrlString[];
  readonly isActive: boolean;
}

/** Compact product reference embedded in sale/purchase line items */
export type ProductRef = Pick<Product, 'id' | 'name' | 'sku' | 'unit'>;

/** Product with computed stock status — used in inventory lists */
export interface ProductWithStockStatus extends Product {
  readonly isLowStock: boolean;
  readonly isOutOfStock: boolean;
  /** Calculated: stockQuantity * costPriceCents */
  readonly stockValueCents: Cents;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: UUID;
  sortOrder?: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CategoryQueryParams extends PaginationParams {
  search?: string;
  parentId?: UUID | null;
}

export interface CreateProductRequest {
  categoryId?: UUID;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  brand?: string;
  sellPriceCents: number;
  costPriceCents?: number;
  taxRate?: number;
  unit?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  images?: string[];
  isActive?: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  categoryId?: UUID;
  brand?: string;
  barcode?: string;
  isActive?: boolean;
}
