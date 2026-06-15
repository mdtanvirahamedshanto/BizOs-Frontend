import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  price: number;
  costPrice: number;
  stockCount: number;
  unit: string;
  categoryId?: string;
  vatRate?: number;
  serverUpdatedAt?: number;
  updatedAt: number;
}

export interface LocalCategory {
  id: string;
  name: string;
  serverUpdatedAt?: number;
  updatedAt: number;
}

export interface LocalCustomer {
  id: string;
  name: string;
  phone: string;
  dueAmount: number;
  serverUpdatedAt?: number;
  updatedAt: number;
}

export interface SyncMetaRecord {
  key: string;
  lastSyncedAt: number;
  productCount?: number;
  customerCount?: number;
}

export type OutboxType = 'sale_create' | 'stock_adjustment' | 'ledger_create';

export interface OutboxTransaction {
  id: string;
  idempotencyKey: string;
  type: OutboxType;
  payload: unknown;
  clientTimestamp: number;
  timestamp: number;
  status: 'pending' | 'processing' | 'failed';
  retryCount: number;
  lastError?: string;
}

export class BizOSDatabase extends Dexie {
  products!: Table<LocalProduct>;
  categories!: Table<LocalCategory>;
  customers!: Table<LocalCustomer>;
  outbox!: Table<OutboxTransaction>;
  syncMeta!: Table<SyncMetaRecord>;

  constructor() {
    super('BizOS_LocalDB');

    this.version(1).stores({
      products: 'id, &barcode, name, categoryId, updatedAt',
      categories: 'id, name, updatedAt',
      customers: 'id, name, &phone, updatedAt',
      outbox: 'id, type, timestamp, status',
    });

    this.version(2).stores({
      products: 'id, &barcode, name, categoryId, updatedAt, serverUpdatedAt',
      categories: 'id, name, updatedAt, serverUpdatedAt',
      customers: 'id, name, &phone, updatedAt, serverUpdatedAt',
      outbox: 'id, idempotencyKey, type, timestamp, status, clientTimestamp',
      syncMeta: 'key, lastSyncedAt',
    });
  }

  async queueTransaction(type: OutboxType, payload: unknown): Promise<string> {
    const id = crypto.randomUUID();
    const idempotencyKey = crypto.randomUUID();
    const now = Date.now();

    await this.outbox.add({
      id,
      idempotencyKey,
      type,
      payload,
      clientTimestamp: now,
      timestamp: now,
      status: 'pending',
      retryCount: 0,
    });

    return id;
  }
}

// Instantiated as a singleton client-side database helper
export const db = typeof window !== 'undefined' ? new BizOSDatabase() : null;
