// =============================================================================
// BizOS — TanStack Query Purchase Hooks
// Covers purchase order tracking, stock acquisitions, statuses, and returns.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchases } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseStatusRequest,
  ReturnPurchaseRequest,
  PurchaseQueryParams,
  PaginatedResponse,
} from '@/lib/api';

/**
 * Standard paginated list of purchases.
 */
export function usePurchasesQuery(params?: PurchaseQueryParams) {
  return useQuery<PaginatedResponse<Purchase>>({
    queryKey: queryKeys.purchases.list(params),
    queryFn: () => purchases.listPurchases(params),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Infinite query for listing purchases (continuous scroll of supply invoice files).
 */
export function useInfinitePurchasesQuery(params?: PurchaseQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Purchase>>({
    queryKey: queryKeys.purchases.list(params),
    queryFn: ({ pageParam }) =>
      purchases.listPurchases({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Retrieve details of a single purchase order.
 */
export function usePurchaseQuery(purchaseId: string) {
  return useQuery<Purchase>({
    queryKey: queryKeys.purchases.detail(purchaseId),
    queryFn: () => purchases.getPurchase(purchaseId),
    enabled: !!purchaseId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Create a new purchase order.
 * Invalidates:
 * - Purchases lists
 * - Product lists (stock level adjustment)
 * - Suppliers list and specific supplier due details
 * - Cashbook balance (if payment was processed)
 * - Reports (inventory valuation / expense dashboard)
 */
export function useCreatePurchaseMutation() {
  const queryClient = useQueryClient();
  return useMutation<Purchase, Error, CreatePurchaseRequest>({
    mutationFn: purchases.createPurchase,
    onSuccess: (newPurchase) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      
      if (newPurchase.supplierId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(newPurchase.supplierId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.due(newPurchase.supplierId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      }

      queryClient.setQueryData(queryKeys.purchases.detail(newPurchase.id), newPurchase);
    },
  });
}

/**
 * Update the operational status of a purchase order (e.g. DRAFT -> RECEIVED).
 */
export function useUpdatePurchaseStatusMutation(purchaseId: string) {
  const queryClient = useQueryClient();
  return useMutation<Purchase, Error, UpdatePurchaseStatusRequest>({
    mutationFn: (data) => purchases.updatePurchaseStatus(purchaseId, data),
    onSuccess: (updatedPurchase) => {
      queryClient.setQueryData(queryKeys.purchases.detail(purchaseId), updatedPurchase);
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

      if (updatedPurchase.supplierId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(updatedPurchase.supplierId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.due(updatedPurchase.supplierId) });
      }
    },
  });
}

/**
 * Register a purchase return transaction.
 */
export function useReturnPurchaseMutation(purchaseId: string) {
  const queryClient = useQueryClient();
  return useMutation<Purchase, Error, ReturnPurchaseRequest>({
    mutationFn: (data) => purchases.returnPurchase(purchaseId, data),
    onSuccess: (updatedPurchase) => {
      queryClient.setQueryData(queryKeys.purchases.detail(purchaseId), updatedPurchase);
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

      if (updatedPurchase.supplierId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(updatedPurchase.supplierId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.due(updatedPurchase.supplierId) });
      }
    },
  });
}
