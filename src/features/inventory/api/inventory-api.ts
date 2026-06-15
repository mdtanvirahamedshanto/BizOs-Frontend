import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ProductInput, AdjustmentInput } from '../types';
import { db } from '@/lib/db';
import { usePwaStore } from '@/features/pwa/stores/use-pwa-store';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockCount: number;
  unit: string;
  categoryId?: string;
  brand?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface InventoryLedgerItem {
  id: string;
  timestamp: string;
  type: 'stock_in' | 'stock_out' | 'damage' | 'adjust' | 'sale';
  quantityDelta: number;
  balanceAfter: number;
  reason: string;
  operator: string;
}

// Global variable representing in-memory mock products list for local editing
let MOCK_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'মিনিকেট চাল ২৫ কেজি', sku: 'MC-25', barcode: '8901234567890', price: 1500, costPrice: 1350, stockCount: 5, unit: 'বস্তা', categoryId: 'cat-1', brand: 'তীর', createdAt: '2026-05-01' },
  { id: 'p-2', name: 'তীর সয়াবিন তেল ৫ লিটার', sku: 'TSO-5', barcode: '8901234567891', price: 900, costPrice: 810, stockCount: 12, unit: 'বোতল', categoryId: 'cat-1', brand: 'তীর', createdAt: '2026-05-02' },
  { id: 'p-3', name: 'ড্যানো গুঁড়ো দুধ ১ কেজি', sku: 'DGM-1', barcode: '8901234567892', price: 850, costPrice: 765, stockCount: 3, unit: 'প্যাকেট', categoryId: 'cat-1', brand: 'ড্যানো', createdAt: '2026-05-03' },
  { id: 'p-4', name: 'ফ্রেশ চিনি ১ কেজি', sku: 'FC-1', barcode: '8901234567893', price: 130, costPrice: 118, stockCount: 8, unit: 'প্যাকেট', categoryId: 'cat-1', brand: 'ফ্রেশ', createdAt: '2026-05-04' },
  { id: 'p-5', name: 'এলইডি বাল্ব ১৮ ওয়াট', sku: 'LB-18', barcode: '8901234567894', price: 280, costPrice: 220, stockCount: 15, unit: 'পিস', categoryId: 'cat-2', brand: 'সুপারস্টার', createdAt: '2026-05-05' },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'নিত্যপ্রয়োজনীয় খাদ্য সামগ্রী (Groceries)' },
  { id: 'cat-2', name: 'ইলেকট্রনিক্স এক্সেসরিজ (Electronics)' },
  { id: 'cat-3', name: 'কসমেটিকস ও রূপচর্চা (Cosmetics)' },
];

const MOCK_LEDGERS: Record<string, InventoryLedgerItem[]> = {
  'p-1': [
    { id: 'lg-1', timestamp: '2026-06-01 09:30', type: 'stock_in', quantityDelta: 10, balanceAfter: 10, reason: 'নতুন চাল স্টক ক্রয়', operator: 'মোঃ আব্দুল করিম' },
    { id: 'lg-2', timestamp: '2026-06-05 14:10', type: 'sale', quantityDelta: -5, balanceAfter: 5, reason: 'বিক্রয় (মেমো: INV-01)', operator: 'ক্যাশিয়ার রাসেল' },
  ],
  'p-2': [
    { id: 'lg-3', timestamp: '2026-06-02 11:20', type: 'stock_in', quantityDelta: 20, balanceAfter: 20, reason: 'স্টক রিসিভড', operator: 'মোঃ আব্দুল করিম' },
    { id: 'lg-4', timestamp: '2026-06-10 18:15', type: 'sale', quantityDelta: -8, balanceAfter: 12, reason: 'বিক্রয় (মেমো: INV-03)', operator: 'ক্যাশিয়ার রাসেল' },
  ],
};

/**
 * Hook to retrieve products list
 */
export function useProductsQuery(search = '', categoryId = '', lowStockOnly = false) {
  return useQuery({
    queryKey: ['products', 'list', search, categoryId, lowStockOnly],
    queryFn: async (): Promise<Product[]> => {
      try {
        return await apiClient.get<Product[]>(`/products?search=${search}&category=${categoryId}&lowStock=${lowStockOnly}`);
      } catch (error) {
        console.warn('[Products API] Using mockup fallbacks.', error);
        await new Promise((resolve) => setTimeout(resolve, 300));

        let list = [...MOCK_PRODUCTS];

        if (search) {
          const s = search.toLowerCase();
          list = list.filter((p) => 
            p.name.toLowerCase().includes(s) || 
            p.barcode?.includes(s) || 
            p.sku?.toLowerCase().includes(s)
          );
        }

        if (categoryId) {
          list = list.filter((p) => p.categoryId === categoryId);
        }

        if (lowStockOnly) {
          list = list.filter((p) => p.stockCount <= 5); // threshold of 5 is alert level
        }

        return list;
      }
    },
  });
}

/**
 * Hook to retrieve specific product details
 */
export function useProductDetailsQuery(productId: string | null) {
  return useQuery({
    queryKey: ['products', 'details', productId],
    enabled: !!productId,
    queryFn: async (): Promise<Product> => {
      try {
        return await apiClient.get<Product>(`/products/${productId}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const found = MOCK_PRODUCTS.find((p) => p.id === productId);
        if (!found) throw new Error('Product not found');
        return found;
      }
    },
  });
}

/**
 * Hook to retrieve categories list
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories', 'list'],
    queryFn: async (): Promise<Category[]> => {
      try {
        return await apiClient.get<Category[]>('/categories');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return MOCK_CATEGORIES;
      }
    },
  });
}

/**
 * Hook to retrieve inventory audit log
 */
export function useInventoryLedgerQuery(productId: string | null) {
  return useQuery({
    queryKey: ['products', 'ledger', productId],
    enabled: !!productId,
    queryFn: async (): Promise<InventoryLedgerItem[]> => {
      try {
        return await apiClient.get<InventoryLedgerItem[]>(`/products/${productId}/ledger`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return MOCK_LEDGERS[productId || ''] || [
          {
            id: 'lg-fallback',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: 'stock_in',
            quantityDelta: MOCK_PRODUCTS.find(p => p.id === productId)?.stockCount || 0,
            balanceAfter: MOCK_PRODUCTS.find(p => p.id === productId)?.stockCount || 0,
            reason: 'প্রারম্ভিক স্টক এন্ট্রি (Initial Setup)',
            operator: 'মোঃ আব্দুল করিম',
          }
        ];
      }
    },
  });
}

/**
 * Hook to create product
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductInput) => {
      try {
        return await apiClient.post<Product>('/products', data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newProduct: Product = {
          id: `p-${Date.now()}`,
          name: data.name,
          sku: data.sku,
          barcode: data.barcode,
          price: data.price,
          costPrice: data.costPrice,
          stockCount: data.stockCount,
          unit: data.unit,
          categoryId: data.categoryId,
          brand: data.brand,
          createdAt: new Date().toISOString().split('T')[0],
        };
        MOCK_PRODUCTS.unshift(newProduct);
        return newProduct;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook to update product details
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; input: ProductInput }) => {
      try {
        return await apiClient.put<Product>(`/products/${data.id}`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        MOCK_PRODUCTS = MOCK_PRODUCTS.map((p) => {
          if (p.id === data.id) {
            return {
              ...p,
              name: data.input.name,
              sku: data.input.sku,
              barcode: data.input.barcode,
              price: data.input.price,
              costPrice: data.input.costPrice,
              unit: data.input.unit,
              categoryId: data.input.categoryId,
              brand: data.input.brand,
            };
          }
          return p;
        });
        return MOCK_PRODUCTS.find((p) => p.id === data.id)!;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'details', variables.id] });
    },
  });
}

/**
 * Hook to delete product
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await apiClient.delete<{ success: boolean }>(`/products/${id}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== id);
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook to adjust product stock
 */
export function useAdjustStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: string; input: AdjustmentInput }) => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOffline) {
        console.log('[Inventory API] Client is offline. Queuing stock adjustment to outbox.');
        if (db) {
          await db.queueTransaction('stock_adjustment', data);
          usePwaStore.getState().updateOutboxCount();
        }
      }

      try {
        if (isOffline) {
          throw new Error('Offline mode active');
        }
        return await apiClient.post<Product>(`/products/${data.productId}/adjust`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const product = MOCK_PRODUCTS.find((p) => p.id === data.productId);
        if (!product) throw new Error('Product not found');

        const delta = 
          data.input.type === 'stock_in' 
            ? data.input.quantity 
            : -data.input.quantity;

        const previousStock = product.stockCount;
        const nextStock = Math.max(0, previousStock + delta);

        product.stockCount = nextStock;

        // Log entry to history
        const newLedger: InventoryLedgerItem = {
          id: `lg-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: data.input.type,
          quantityDelta: delta,
          balanceAfter: nextStock,
          reason: data.input.reason,
          operator: 'মোঃ আব্দুল করিম (মালিক)',
        };

        if (!MOCK_LEDGERS[data.productId]) {
          MOCK_LEDGERS[data.productId] = [];
        }
        MOCK_LEDGERS[data.productId].unshift(newLedger);

        return product;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'details', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products', 'ledger', variables.productId] });
    },
  });
}
