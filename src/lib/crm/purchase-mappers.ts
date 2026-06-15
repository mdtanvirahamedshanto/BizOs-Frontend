import type { Purchase as ApiPurchase, PurchaseItem as ApiPurchaseItem } from '@/lib/api';
import { centsToTaka, takaToCents } from './money';

export interface PurchaseItemView {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseView {
  id: string;
  referenceNumber: string;
  supplierId?: string;
  supplierName?: string;
  purchaseDate: string;
  expectedDate?: string;
  receivedDate?: string;
  status: ApiPurchase['status'];
  paymentStatus: ApiPurchase['paymentStatus'];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  notes?: string;
  items: PurchaseItemView[];
  createdAt: string;
}

export interface CreatePurchaseLineInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseInput {
  supplierId?: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED';
  notes?: string;
  tax?: number;
  discount?: number;
  items: CreatePurchaseLineInput[];
  paymentAmount?: number;
  paymentMethod?: 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'CARD' | 'CHECK' | 'OTHER';
}

function normalizePurchaseItem(item: ApiPurchaseItem & { totalCents?: number }): PurchaseItemView {
  const lineTotalCents = item.lineTotalCents ?? item.totalCents ?? item.quantity * item.unitCostCents;
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    quantity: item.quantity,
    unitCost: centsToTaka(item.unitCostCents),
    lineTotal: centsToTaka(lineTotalCents),
  };
}

export function toPurchaseView(purchase: ApiPurchase & { referenceNumber?: string }): PurchaseView {
  return {
    id: purchase.id,
    referenceNumber: purchase.referenceNumber ?? purchase.id.slice(0, 8).toUpperCase(),
    supplierId: purchase.supplierId,
    supplierName: purchase.supplierName,
    purchaseDate: purchase.purchaseDate,
    expectedDate: purchase.expectedDate,
    receivedDate: purchase.receivedDate,
    status: purchase.status,
    paymentStatus: purchase.paymentStatus,
    subtotal: centsToTaka(purchase.subtotalCents),
    tax: centsToTaka(purchase.taxCents),
    discount: centsToTaka(purchase.discountCents),
    total: centsToTaka(purchase.totalCents),
    paid: centsToTaka(purchase.paidCents),
    due: centsToTaka(purchase.dueCents),
    notes: purchase.notes,
    items: (purchase.items ?? []).map(normalizePurchaseItem),
    createdAt: purchase.createdAt,
  };
}

export function createPurchaseInputToRequest(input: CreatePurchaseInput) {
  return {
    supplierId: input.supplierId || undefined,
    status: input.status,
    notes: input.notes,
    taxCents: takaToCents(input.tax ?? 0),
    discountCents: takaToCents(input.discount ?? 0),
    items: input.items.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitCostCents: takaToCents(line.unitCost),
    })),
    payment:
      input.paymentAmount && input.paymentAmount > 0
        ? {
            amountCents: takaToCents(input.paymentAmount),
            method: input.paymentMethod ?? 'CASH',
          }
        : undefined,
  };
}
