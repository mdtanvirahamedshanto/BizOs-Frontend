// =============================================================================
// BizOS — TanStack Query Supplier Hooks
// Covers listing, due tracking, ledger entries, and CRUD mutations.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliers } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Supplier,
  SupplierDueTracking,
  SupplierLedgerEntry,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/api';

/**
 * Standard paginated query for suppliers.
 */
export function useSuppliersQuery(params?: SupplierQueryParams) {
  return useQuery<PaginatedResponse<Supplier>>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => suppliers.listSuppliers(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Infinite query for supplier listings.
 */
export function useInfiniteSuppliersQuery(params?: SupplierQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Supplier>>({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: ({ pageParam }) =>
      suppliers.listSuppliers({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Retrieve details for a single supplier.
 */
export function useSupplierQuery(supplierId: string) {
  return useQuery<Supplier>({
    queryKey: queryKeys.suppliers.detail(supplierId),
    queryFn: () => suppliers.getSupplier(supplierId),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Retrieve supplier due tracking summary.
 */
export function useSupplierDueTrackingQuery(supplierId: string) {
  return useQuery<SupplierDueTracking>({
    queryKey: queryKeys.suppliers.due(supplierId),
    queryFn: () => suppliers.getSupplierDueTracking(supplierId),
    enabled: !!supplierId,
    staleTime: 3 * 60 * 1000, // Due details cached for 3 minutes
  });
}

/**
 * Retrieve paginated supplier ledger entries.
 */
export function useSupplierLedgerQuery(supplierId: string, params?: PaginationParams) {
  return useQuery<PaginatedResponse<SupplierLedgerEntry>>({
    queryKey: queryKeys.suppliers.ledger(supplierId, params),
    queryFn: () => suppliers.getSupplierLedger(supplierId, params),
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000, // Ledgers cached for 2 minutes
  });
}

/**
 * Infinite query for supplier ledger entries.
 */
export function useInfiniteSupplierLedgerQuery(supplierId: string, params?: PaginationParams) {
  return useInfiniteQuery<PaginatedResponse<SupplierLedgerEntry>>({
    queryKey: queryKeys.suppliers.ledger(supplierId, params),
    queryFn: ({ pageParam }) =>
      suppliers.getSupplierLedger(supplierId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: !!supplierId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Retrieve paginated purchase history for a supplier.
 */
export function useSupplierPurchaseHistoryQuery(supplierId: string, params?: PaginationParams) {
  return useQuery<PaginatedResponse<SupplierLedgerEntry>>({
    queryKey: [...queryKeys.suppliers.all, 'purchase-history', supplierId, params ?? {}],
    queryFn: () => suppliers.getSupplierPurchaseHistory(supplierId, params),
    enabled: !!supplierId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Retrieve paginated payment history to a supplier.
 */
export function useSupplierPaymentsQuery(supplierId: string, params?: PaginationParams) {
  return useQuery<PaginatedResponse<SupplierLedgerEntry>>({
    queryKey: [...queryKeys.suppliers.all, 'payments-history', supplierId, params ?? {}],
    queryFn: () => suppliers.getSupplierPayments(supplierId, params),
    enabled: !!supplierId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Create a supplier.
 */
export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, CreateSupplierRequest>({
    mutationFn: suppliers.createSupplier,
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      queryClient.setQueryData(queryKeys.suppliers.detail(newSupplier.id), newSupplier);
    },
  });
}

/**
 * Update a supplier.
 */
export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation<Supplier, Error, { id: string; data: UpdateSupplierRequest }>({
    mutationFn: ({ id, data }) => suppliers.updateSupplier(id, data),
    onSuccess: (updatedSupplier) => {
      queryClient.setQueryData(queryKeys.suppliers.detail(updatedSupplier.id), updatedSupplier);
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      // Invalidate due tracking as terms or details might have modified balance aggregates
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.due(updatedSupplier.id) });
    },
  });
}

/**
 * Delete a supplier.
 */
export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: suppliers.deleteSupplier,
    onSuccess: (_, supplierId) => {
      queryClient.removeQueries({ queryKey: queryKeys.suppliers.detail(supplierId) });
      queryClient.removeQueries({ queryKey: queryKeys.suppliers.due(supplierId) });
      queryClient.removeQueries({ queryKey: queryKeys.suppliers.ledgers(supplierId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
    },
  });
}
