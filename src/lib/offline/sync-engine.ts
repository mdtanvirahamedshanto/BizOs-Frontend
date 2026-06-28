import { db, type OutboxTransaction } from '@/lib/db';
import { sales, products, khata } from '@/lib/api';
import { takaToCents } from '@/lib/crm/money';
import { ApiError } from '@/lib/api/types';
import { resolveSyncConflict } from './conflict-resolver';
import type { CheckoutInput } from '@/features/pos/types';

const MAX_BATCH = 20;

function checkoutToSaleRequest(input: CheckoutInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (input.discount / 100));
  const taxAmount = Math.round((subtotal - discountAmount) * (input.taxRate / 100));
  const netPayable = subtotal - discountAmount + taxAmount;

  return {
    customerId: input.customerId ?? undefined,
    discountType: input.discount > 0 ? ('PERCENTAGE' as const) : undefined,
    discountValue: input.discount > 0 ? input.discount : undefined,
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    payment:
      input.paymentType !== 'due' && input.cashReceived > 0
        ? {
            amountCents: takaToCents(
              input.paymentType === 'partial'
                ? input.cashReceived
                : Math.max(input.cashReceived, netPayable),
            ),
            method: input.paymentType === 'mobile_banking' ? ('BKASH' as const) : ('CASH' as const),
          }
        : undefined,
  };
}

async function processTransaction(txn: OutboxTransaction): Promise<void> {
  switch (txn.type) {
    case 'sale_create':
      await sales.createSale(checkoutToSaleRequest(txn.payload as CheckoutInput));
      break;
    case 'stock_adjustment': {
      const payload = txn.payload as {
        productId: string;
        quantity: number;
        type: 'IN' | 'OUT' | 'ADJUSTMENT';
        notes?: string;
      };
      await products.adjustStock(payload.productId, {
        quantity: payload.quantity,
        type: payload.type,
        notes: payload.notes,
      });
      break;
    }
    case 'ledger_create': {
      const payload = txn.payload as {
        customerId?: string;
        accountId?: string;
        amountCents: number;
        method: string;
        notes?: string;
      };
      
      let accountId = payload.accountId;
      if (!accountId && payload.customerId) {
         const account = await khata.ensureKhataAccount({ partyType: 'CUSTOMER', partyId: payload.customerId });
         accountId = account.id;
      }
      if (!accountId) throw new Error('Missing accountId or customerId for ledger_create');

      await khata.recordCollection(accountId, {
        amountCents: payload.amountCents,
        method: payload.method as 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET',
        notes: payload.notes,
      });
      break;
    }
    default:
      throw new Error(`Unknown outbox type: ${txn.type}`);
  }
}

function toApiError(error: unknown): { status?: number; message: string } {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message };
  }
  if (error && typeof error === 'object') {
    const maybe = error as { status?: number; response?: { status?: number }; message?: string };
    return {
      status: maybe.status ?? maybe.response?.status,
      message: maybe.message ?? 'Sync failed',
    };
  }
  return { message: error instanceof Error ? error.message : 'Sync failed' };
}

export async function processOutboxQueue(): Promise<{ synced: number; failed: number }> {
  if (!db || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const transactions = await db.outbox
    .where('status')
    .anyOf(['pending', 'failed'])
    .limit(MAX_BATCH)
    .toArray();

  let synced = 0;
  let failed = 0;

  for (const txn of transactions) {
    await db.outbox.update(txn.id, { status: 'processing' });

    try {
      await processTransaction(txn);
      await db.outbox.delete(txn.id);
      synced += 1;
    } catch (error) {
      const apiError = toApiError(error);
      const resolution = resolveSyncConflict(txn, apiError);

      if (resolution === 'drop') {
        await db.outbox.delete(txn.id);
        synced += 1;
        continue;
      }

      if (resolution === 'fail') {
        await db.outbox.update(txn.id, {
          status: 'failed',
          retryCount: txn.retryCount + 1,
          lastError: apiError.message,
        });
        failed += 1;
        continue;
      }

      await db.outbox.update(txn.id, {
        status: 'pending',
        retryCount: txn.retryCount + 1,
        lastError: apiError.message,
      });
      failed += 1;
    }
  }

  return { synced, failed };
}

export function registerBackgroundSync(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready
    .then((registration) => {
      if ('sync' in registration) {
        return (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('bizos-outbox-sync');
      }
    })
    .catch(() => undefined);
}
