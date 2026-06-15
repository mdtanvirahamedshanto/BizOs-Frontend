// =============================================================================
// BizOS API SDK — Products & Categories Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';

// ─── Category Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface CategoryQueryParams extends PaginationParams {
  search?: string;
  parentId?: string | null;
}

// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  shopId: string;
  categoryId?: string;
  category?: Pick<Category, 'id' | 'name'>;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  brand?: string;
  /** Price in cents (e.g. 1500 = ৳15.00) */
  sellPriceCents: number;
  /** Cost price in cents */
  costPriceCents: number;
  /** Tax rate 0–1 (e.g. 0.15 = 15%) */
  taxRate: number;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  categoryId?: string;
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
  categoryId?: string;
  brand?: string;
  barcode?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

// ─── Stock Movement Types ─────────────────────────────────────────────────────

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';

export interface StockMovement {
  id: string;
  shopId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCostCents?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  creator?: { id: string; name: string } | null;
}

export interface StockAdjustmentRequest {
  type: StockMovementType;
  quantity: number;
  notes?: string | null;
}

export interface StockMovementQueryParams extends PaginationParams {}

export interface StockAdjustmentResult {
  product: Product;
  movement: StockMovement;
  balanceAfter: number;
}

// ─── Category API Functions ───────────────────────────────────────────────────

/**
 * Create a new product category (supports nesting via parentId)
 */
export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const res = await apiClient.post<Category>('/categories', data);
  return res.data;
}

/**
 * List categories with optional search and pagination
 */
export async function listCategories(
  params?: CategoryQueryParams,
): Promise<PaginatedResponse<Category>> {
  const res = await apiClient.get<PaginatedResponse<Category>>('/categories', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get the full nested category tree (no pagination)
 */
export async function getCategoryTree(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/categories/tree');
  return res.data;
}

/**
 * Get a single category by ID
 */
export async function getCategory(categoryId: string): Promise<Category> {
  const res = await apiClient.get<Category>(`/categories/${categoryId}`);
  return res.data;
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest,
): Promise<Category> {
  const res = await apiClient.put<Category>(`/categories/${categoryId}`, data);
  return res.data;
}

/**
 * Delete a category by ID
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}

// ─── Product API Functions ────────────────────────────────────────────────────

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const res = await apiClient.post<Product>('/products', data);
  return res.data;
}

/**
 * List products with filtering and cursor-based pagination
 */
export async function listProducts(
  params?: ProductQueryParams,
): Promise<PaginatedResponse<Product>> {
  const res = await apiClient.get<PaginatedResponse<Product>>('/products', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get all distinct brand names used in the shop's catalog
 */
export async function getProductBrands(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/products/brands');
  return res.data;
}

/**
 * Get all distinct measurement units used in the shop's catalog
 */
export async function getProductUnits(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/products/units');
  return res.data;
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product> {
  const res = await apiClient.get<Product>(`/products/${productId}`);
  return res.data;
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, data: UpdateProductRequest): Promise<Product> {
  const res = await apiClient.put<Product>(`/products/${productId}`, data);
  return res.data;
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}

/**
 * List stock movements (inventory ledger) for a product
 */
export async function listStockMovements(
  productId: string,
  params?: StockMovementQueryParams,
): Promise<PaginatedResponse<StockMovement>> {
  const res = await apiClient.get<PaginatedResponse<StockMovement>>(
    `/products/${productId}/stock-movements`,
    {
      params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
    },
  );
  return res.data;
}

/**
 * Record a manual stock adjustment (stock in, out, damage, or correction)
 */
export async function adjustStock(
  productId: string,
  data: StockAdjustmentRequest,
): Promise<StockAdjustmentResult> {
  const res = await apiClient.post<StockAdjustmentResult>(
    `/products/${productId}/stock-adjustments`,
    data,
  );
  return res.data;
}
