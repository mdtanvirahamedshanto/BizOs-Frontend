import type { Product as ApiProduct, Category as ApiCategory, StockMovement } from '@/lib/api';
import { centsToTaka, takaToCents } from './money';
import type { ProductInput, AdjustmentInput } from '@/features/inventory/types';
import type { CreateProductRequest, StockAdjustmentRequest } from '@/lib/api';

export interface ProductView {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockCount: number;
  lowStockThreshold: number;
  unit: string;
  categoryId?: string;
  categoryName?: string;
  brand?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryView {
  id: string;
  name: string;
}

export interface InventoryLedgerItemView {
  id: string;
  timestamp: string;
  type: 'stock_in' | 'stock_out' | 'damage' | 'adjust' | 'sale' | 'purchase' | 'return';
  quantityDelta: number;
  balanceAfter?: number;
  reason: string;
  operator: string;
}

export function toProductView(product: ApiProduct): ProductView {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    price: centsToTaka(product.sellPriceCents),
    costPrice: centsToTaka(product.costPriceCents),
    stockCount: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
    categoryId: product.categoryId,
    categoryName: product.category?.name,
    brand: product.brand,
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
}

export function toCategoryView(category: ApiCategory): CategoryView {
  return {
    id: category.id,
    name: category.name,
  };
}

export function productInputToCreateRequest(input: ProductInput): CreateProductRequest {
  return {
    name: input.name,
    sku: input.sku || `SKU-${Date.now()}`,
    barcode: input.barcode || undefined,
    brand: input.brand || undefined,
    categoryId: input.categoryId || undefined,
    sellPriceCents: takaToCents(input.price),
    costPriceCents: takaToCents(input.costPrice),
    unit: input.unit,
    stockQuantity: input.stockCount,
    lowStockThreshold: 10,
    isActive: true,
  };
}

export function productInputToUpdateRequest(input: ProductInput): Partial<CreateProductRequest> {
  return {
    name: input.name,
    sku: input.sku || undefined,
    barcode: input.barcode || undefined,
    brand: input.brand || undefined,
    categoryId: input.categoryId || undefined,
    sellPriceCents: takaToCents(input.price),
    costPriceCents: takaToCents(input.costPrice),
    unit: input.unit,
  };
}

const ADJUSTMENT_TYPE_MAP: Record<AdjustmentInput['type'], StockAdjustmentRequest['type']> = {
  stock_in: 'IN',
  stock_out: 'OUT',
  damage: 'DAMAGE',
  adjust: 'ADJUSTMENT',
};

export function adjustmentInputToRequest(input: AdjustmentInput): StockAdjustmentRequest {
  return {
    type: ADJUSTMENT_TYPE_MAP[input.type],
    quantity: input.quantity,
    notes: input.reason,
  };
}

function mapMovementType(
  type: StockMovement['type'],
  referenceType?: string | null,
): InventoryLedgerItemView['type'] {
  if (referenceType === 'sale') return 'sale';
  if (referenceType === 'purchase') return 'purchase';
  switch (type) {
    case 'IN':
      return 'stock_in';
    case 'OUT':
      return 'stock_out';
    case 'DAMAGE':
      return 'damage';
    case 'RETURN':
      return 'return';
    case 'ADJUSTMENT':
    default:
      return 'adjust';
  }
}

export function stockMovementToLedgerItem(
  movement: StockMovement,
  balanceAfter?: number,
): InventoryLedgerItemView {
  const created = new Date(movement.createdAt);
  return {
    id: movement.id,
    timestamp: created.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    type: mapMovementType(movement.type, movement.referenceType),
    quantityDelta: movement.quantity,
    balanceAfter,
    reason: movement.notes || movement.referenceType || movement.type,
    operator: movement.creator?.name || 'সিস্টেম',
  };
}

export function computeRunningBalances(
  movements: StockMovement[],
  currentStock: number,
): InventoryLedgerItemView[] {
  const sorted = [...movements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let running = currentStock;
  return sorted.map((movement) => {
    const item = stockMovementToLedgerItem(movement, running);
    running -= movement.quantity;
    return item;
  });
}
