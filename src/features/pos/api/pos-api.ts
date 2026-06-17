import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInfiniteProductsQuery } from '@/hooks/queries/use-product-query';
import { toProductView } from '@/lib/crm/product-mappers';
import { usePosCartStore } from '../stores/use-pos-cart';
import { Product } from '@/features/inventory/api/inventory-api';
import { Customer } from '@/features/customers/api/customers-api';
import { CheckoutInput } from '../types';
import { usePOSHistoryStore } from '../stores/use-pos-history';
import { db } from '@/lib/db';
import { usePwaStore } from '@/features/pwa/stores/use-pwa-store';
import { registerBackgroundSync } from '@/lib/offline/sync-engine';
import { useOffline } from '@/hooks/use-offline';
import { MOCK_PRODUCTS } from './pos-mocks';

/** Demo fallbacks must never appear in production (would let cashiers sell
 * non-existent items / show fake customers). Dev/preview only. */
const ALLOW_MOCK_FALLBACK = process.env.NODE_ENV === 'development';

export interface CheckoutResultItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  returnedQuantity?: number;
}

export interface CheckoutResult {
  success: boolean;
  invoiceNo: string;
  transactionId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netPayable: number;
  cashReceived: number;
  changeDue: number;
  dueAmount: number;
  timestamp: string;
  items: CheckoutResultItem[];
  isReturned?: boolean;
  isVoided?: boolean;
}

/**
 * Hook to retrieve products catalog in POS screen (fast lookup)
 */
export function usePOSProductsQuery(search = '') {
  const isOffline = useOffline();
  const query = useInfiniteProductsQuery(
    {
      search: search || undefined,
      isActive: true,
      limit: 50,
    },
    { enabled: !isOffline },
  );

  const offlineQuery = useQuery({
    queryKey: ['pos', 'offline-products', search],
    queryFn: async () => {
      const { getOfflineProducts } = await import('@/lib/offline/cache-sync');
      return getOfflineProducts(search);
    },
    enabled: isOffline,
    staleTime: 60_000,
  });

  const products = useMemo(() => {
    if (isOffline) {
      const cached = offlineQuery.data ?? [];
      return cached.map(
        (p): Product => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          sku: p.sku ?? '',
          price: p.price,
          costPrice: p.costPrice,
          stockCount: p.stockCount,
          unit: p.unit,
          categoryId: p.categoryId,
          lowStockThreshold: 0,
          isActive: true,
          createdAt: new Date(p.updatedAt).toISOString(),
        }),
      );
    }

    const pages = query.data?.pages ?? [];
    const fromApi = pages.flatMap((page) => page.data.map(toProductView));
    if (fromApi.length > 0) return fromApi;

    // A successful-but-empty catalog is a valid state (new shop): show nothing
    // rather than fake inventory. Mocks are dev-only convenience.
    if (!ALLOW_MOCK_FALLBACK) return [];

    if (search) {
      const s = search.toLowerCase();
      return MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.barcode?.includes(s) ||
          p.sku?.toLowerCase().includes(s),
      );
    }
    return MOCK_PRODUCTS;
  }, [isOffline, offlineQuery.data, query.data, search]);

  return {
    ...(isOffline ? offlineQuery : query),
    data: products,
  };
}

/**
 * Hook to retrieve customers list in POS screen for selectors
 */
export function usePOSCustomersQuery(search = '') {
  return useQuery({
    queryKey: ['pos', 'customers', search],
    queryFn: async (): Promise<Customer[]> => {
      try {
        const { customers: customersApi } = await import('@/lib/api');
        const res = await customersApi.listCustomers({ search: search || undefined, limit: 50 });
        const { toCustomerView } = await import('@/lib/crm/mappers');
        return res.data.map((c) => toCustomerView(c, 0));
      } catch (err) {
        // In production, surface the error to the UI instead of masking it
        // with fake customers.
        if (!ALLOW_MOCK_FALLBACK) throw err;

        await new Promise((resolve) => setTimeout(resolve, 100));

        const fallback: Customer[] = [
          {
            id: 'cust-1',
            name: 'মোঃ আব্দুর রহমান (Rahman)',
            phone: '01711223344',
            address: 'মিরপুর ঢাকা',
            dueAmount: 5200,
            dueCents: 520000,
            notes: 'বিশ্বস্ত কাস্টমার',
            createdAt: '2026-01-10',
          },
          {
            id: 'cust-2',
            name: 'আবুল কালাম (Kalam)',
            phone: '01819876543',
            address: 'উত্তরা ঢাকা',
            dueAmount: 12000,
            dueCents: 1200000,
            notes: 'পাইকারি ক্রেতা',
            createdAt: '2026-02-15',
          },
        ];

        if (search) {
          const s = search.toLowerCase();
          return fallback.filter(
            (c) => c.name.toLowerCase().includes(s) || c.phone.includes(s),
          );
        }
        return fallback;
      }
    },
  });
}

function buildCheckoutResult(input: CheckoutInput, cartProducts: Product[]): CheckoutResult {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (input.discount / 100));
  const taxAmount = Math.round((subtotal - discountAmount) * (input.taxRate / 100));
  const netPayable = subtotal - discountAmount + taxAmount;

  let dueAmount = 0;
  let cashReceived = input.cashReceived;
  let changeDue = 0;

  if (input.paymentType === 'due') {
    dueAmount = netPayable;
    cashReceived = 0;
  } else if (input.paymentType === 'partial') {
    dueAmount = Math.max(0, netPayable - input.cashReceived);
  } else {
    cashReceived = Math.max(input.cashReceived, netPayable);
    changeDue = Math.max(0, cashReceived - netPayable);
  }

  const productMap = new Map(cartProducts.map((p) => [p.id, p]));

  return {
    success: true,
    invoiceNo: `BOS-${Date.now().toString().slice(-8)}`,
    transactionId: `tx-${Math.random().toString(36).slice(2, 10)}`,
    totalAmount: subtotal,
    discountAmount,
    taxAmount,
    netPayable,
    cashReceived,
    changeDue,
    dueAmount,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    items: input.items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        name: product?.name ?? 'Unknown',
        quantity: item.quantity,
        unit: product?.unit ?? 'pcs',
        price: item.price,
      };
    }),
  };
}

/**
 * Hook to process POS checkout
 */
export function usePOSCheckoutMutation() {
  const queryClient = useQueryClient();
  const clearCart = usePosCartStore((state) => state.clearCart);
  const addSale = usePOSHistoryStore((state) => state.addSale);
  const cartItems = usePosCartStore((state) => state.cartItems);

  return useMutation({
    mutationFn: async (input: CheckoutInput): Promise<CheckoutResult> => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOffline) {
        if (db) {
          await db.queueTransaction('sale_create', input);
          usePwaStore.getState().updateOutboxCount();
          registerBackgroundSync();
        }
        throw new Error('Offline mode active');
      }

      try {
        const { sales: salesApi } = await import('@/lib/api');
        const { takaToCents } = await import('@/lib/crm/money');

        const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountAmount = Math.round(subtotal * (input.discount / 100));
        const taxAmount = Math.round((subtotal - discountAmount) * (input.taxRate / 100));
        const netPayable = subtotal - discountAmount + taxAmount;

        const sale = await salesApi.createSale({
          customerId: input.customerId ?? undefined,
          discountType: input.discount > 0 ? 'PERCENTAGE' : undefined,
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
                  method: input.paymentType === 'mobile_banking' ? 'BKASH' : 'CASH',
                }
              : undefined,
        });

        const products = cartItems.map((c) => c.product);
        const result = buildCheckoutResult(input, products);
        return {
          ...result,
          invoiceNo: sale.invoiceNumber,
          transactionId: sale.id,
          timestamp: sale.createdAt,
        };
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (result) => {
      clearCart();
      addSale(result);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
