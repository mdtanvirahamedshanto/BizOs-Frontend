import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  price: number;
  costPrice: number;
  stockCount: number;
  unit: string; // e.g. 'kg', 'pcs', 'litre'
  categoryId?: string;
  vatRate?: number; // VAT percentage
  updatedAt: number;
}

export interface LocalCategory {
  id: string;
  name: string;
  updatedAt: number;
}

export interface LocalCustomer {
  id: string;
  name: string;
  phone: string;
  dueAmount: number; // For wholesale customer ledgers
  updatedAt: number;
}

export interface OutboxTransaction {
  id: string; // UUID/GUID
  type: 'sale_create' | 'stock_adjustment' | 'ledger_create';
  payload: any; // Direct structured request body
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

  constructor() {
    super('BizOS_LocalDB');
    
    // Define database schema versions and indexes
    // Note: only index fields that we intend to query on (like barcodes, phone numbers, or sync status)
    this.version(1).stores({
      products: 'id, &barcode, name, categoryId, updatedAt',
      categories: 'id, name, updatedAt',
      customers: 'id, name, &phone, updatedAt',
      outbox: 'id, type, timestamp, status',
    });
  }

  /**
   * Helper to append a transaction to the sync outbox
   */
  async queueTransaction(
    type: OutboxTransaction['type'],
    payload: any
  ): Promise<string> {
    const id = crypto.randomUUID();
    await this.outbox.add({
      id,
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    });
    return id;
  }
}

// Instantiated as a singleton client-side database helper
export const db = typeof window !== 'undefined' ? new BizOSDatabase() : null;
