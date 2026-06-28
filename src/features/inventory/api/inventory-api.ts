/**
 * Inventory feature hooks — adapters over TanStack Query + Products SDK.
 */

import { useMemo, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { usePwaStore } from '@/features/pwa/stores/use-pwa-store';
import { registerBackgroundSync } from '@/lib/offline/sync-engine';
import {
  useProductsQuery as useProductsQueryBase,
  useProductQuery as useProductQueryBase,
  useCategoriesQuery as useCategoriesQueryBase,
  useCreateCategoryMutation as useCreateCategoryMutationBase,
  useProductBrandsQuery,
  useProductUnitsQuery,
  useCreateProductMutation as useCreateProductMutationBase,
  useUpdateProductMutation as useUpdateProductMutationBase,
  useDeleteProductMutation as useDeleteProductMutationBase,
} from '@/hooks/queries/use-product-query';
import {
  useStockMovementsQuery,
  useAdjustStockMutation as useAdjustStockMutationBase,
} from '@/hooks/queries/use-inventory-query';
import {
  toProductView,
  toCategoryView,
  productInputToCreateRequest,
  productInputToUpdateRequest,
  adjustmentInputToRequest,
  computeRunningBalances,
} from '@/lib/crm/product-mappers';
import type {
  ProductView,
  CategoryView,
  InventoryLedgerItemView,
} from '@/lib/crm/product-mappers';
import type { ProductInput, AdjustmentInput } from '../types';

export type Product = ProductView;
export type Category = CategoryView;
export type InventoryLedgerItem = InventoryLedgerItemView;

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useProductsQuery(
  search = '',
  categoryId = '',
  lowStockOnly = false,
  brand = '',
  barcode = '',
  cursor?: string,
  limit = 20,
) {
  const debouncedSearch = useDebouncedValue(search.trim());

  const query = useProductsQueryBase({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    brand: brand || undefined,
    barcode: barcode || undefined,
    lowStock: lowStockOnly || undefined,
    cursor,
    limit,
  });

  const products = useMemo(
    () => (query.data?.data ?? []).map(toProductView),
    [query.data],
  );

  return {
    ...query,
    data: products,
    meta: query.data?.meta,
  };
}

export function useProductDetailsQuery(productId: string | null) {
  const query = useProductQueryBase(productId ?? '');
  return {
    ...query,
    data: query.data ? toProductView(query.data) : undefined,
  };
}

export function useCategoriesQuery() {
  const query = useCategoriesQueryBase({ limit: 100 });
  const categories = useMemo(
    () => (query.data?.data ?? []).map(toCategoryView),
    [query.data],
  );
  return { ...query, data: categories };
}

export { useProductBrandsQuery, useProductUnitsQuery };

export function useInventoryLedgerQuery(productId: string | null) {
  const productQuery = useProductQueryBase(productId ?? '');
  const movementsQuery = useStockMovementsQuery(productId ?? '', { limit: 50 });

  const ledger = useMemo(() => {
    const movements = movementsQuery.data?.data ?? [];
    const currentStock = productQuery.data?.stockQuantity ?? 0;
    if (!movements.length) return [];
    return computeRunningBalances(movements, currentStock);
  }, [movementsQuery.data, productQuery.data]);

  return {
    ...movementsQuery,
    isLoading: movementsQuery.isLoading || productQuery.isLoading,
    data: ledger,
  };
}

export function useCreateCategoryMutation() {
  const base = useCreateCategoryMutationBase();

  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      base.mutateAsync(input),
  });
}

export function useCreateProductMutation() {
  const base = useCreateProductMutationBase();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      base.mutateAsync(productInputToCreateRequest(input)),
  });
}

export function useUpdateProductMutation() {
  const base = useUpdateProductMutationBase();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      base.mutateAsync({
        id,
        data: productInputToUpdateRequest(input),
      }),
  });
}

export { useDeleteProductMutationBase as useDeleteProductMutation };

export function useAdjustStockMutation() {
  const base = useAdjustStockMutationBase();

  return useMutation({
    mutationFn: async ({ productId, input }: { productId: string; input: AdjustmentInput }) => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOffline) {
        if (db) {
          const req = adjustmentInputToRequest(input);
          await db.queueTransaction('stock_adjustment', {
            productId,
            quantity: req.quantity,
            type: req.type,
            notes: req.notes,
          });
          usePwaStore.getState().updateOutboxCount();
          registerBackgroundSync();
        }
        throw new Error('Offline mode active');
      }

      return base.mutateAsync({ productId, data: adjustmentInputToRequest(input) });
    },
  });
}
