import { db, type LocalCustomer, type LocalProduct } from '@/lib/db';
import { customers, products } from '@/lib/api';
import { centsToTaka } from '@/lib/crm/money';

const PRODUCT_PAGE_LIMIT = 100;
const CUSTOMER_PAGE_LIMIT = 100;

async function syncProductsToIndexedDb(): Promise<number> {
  if (!db) return 0;

  let cursor: string | undefined;
  let total = 0;

  do {
    const page = await products.listProducts({ limit: PRODUCT_PAGE_LIMIT, cursor, isActive: true });
    const rows: LocalProduct[] = page.data.map((p) => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode,
      sku: p.sku,
      price: centsToTaka(p.sellPriceCents),
      costPrice: centsToTaka(p.costPriceCents),
      stockCount: p.stockQuantity,
      unit: p.unit,
      categoryId: p.categoryId,
      vatRate: p.taxRate,
      serverUpdatedAt: new Date(p.updatedAt).getTime(),
      updatedAt: Date.now(),
    }));

    await db.products.bulkPut(rows);
    total += rows.length;
    cursor = page.meta?.nextCursor ?? undefined;
  } while (cursor);

  return total;
}

async function syncCustomersToIndexedDb(): Promise<number> {
  if (!db) return 0;

  let cursor: string | undefined;
  let total = 0;

  do {
    const page = await customers.listCustomers({ limit: CUSTOMER_PAGE_LIMIT, cursor });
    const rows: LocalCustomer[] = page.data.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? '',
      dueAmount: 0,
      serverUpdatedAt: new Date(c.updatedAt).getTime(),
      updatedAt: Date.now(),
    }));

    await db.customers.bulkPut(rows);
    total += rows.length;
    cursor = page.meta?.nextCursor ?? undefined;
  } while (cursor);

  return total;
}

export async function syncReferenceDataToIndexedDb(): Promise<{ products: number; customers: number }> {
  // Offline support is temporarily skipped per request
  return { products: 0, customers: 0 };
}

export async function getOfflineProducts(search = ''): Promise<LocalProduct[]> {
  if (!db) return [];

  const all = await db.products.orderBy('name').toArray();
  if (!search) return all;

  const term = search.toLowerCase();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.barcode?.includes(term) ||
      p.sku?.toLowerCase().includes(term),
  );
}

export async function getOfflineCustomers(search = ''): Promise<LocalCustomer[]> {
  if (!db) return [];

  const all = await db.customers.orderBy('name').toArray();
  if (!search) return all;

  const term = search.toLowerCase();
  return all.filter((c) => c.name.toLowerCase().includes(term) || c.phone.includes(term));
}
