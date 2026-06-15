// =============================================================================
// BizOS — TanStack Query Sales Hooks
// Covers POS checkouts, invoices, return tracking, and listing filters.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sales } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Sale,
  CreateSaleRequest,
  ReturnSaleRequest,
  SaleQueryParams,
  PaginatedResponse,
} from '@/lib/api';

/**
 * Standard paginated list of sales.
 */
export function useSalesQuery(params?: SaleQueryParams) {
  return useQuery<PaginatedResponse<Sale>>({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => sales.listSales(params),
    staleTime: 3 * 60 * 1000, // Sales data changes dynamically (3m)
  });
}

/**
 * Infinite query for listing sales (useful for continuous scrolling transaction history).
 */
export function useInfiniteSalesQuery(params?: SaleQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Sale>>({
    queryKey: queryKeys.sales.list(params),
    queryFn: ({ pageParam }) =>
      sales.listSales({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Retrieve details of a single sale, including individual line items.
 */
export function useSaleQuery(saleId: string) {
  return useQuery<Sale>({
    queryKey: queryKeys.sales.detail(saleId),
    queryFn: () => sales.getSale(saleId),
    enabled: !!saleId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Mutation to checkout a POS cart and finalize a sale.
 * Triggering this invalidates:
 * - Sales lists
 * - Product lists (stock level changes)
 * - Cashbook balance (payments made)
 * - Reports dashboard (revenue updates)
 * - Customer cache (if customer has outstanding dues)
 */
export function useCreateSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, CreateSaleRequest>({
    mutationFn: sales.createSale,
    onSuccess: (newSale) => {
      // Invalidate current modules
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      
      if (newSale.customerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(newSale.customerId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      }

      // Seed detail cache
      queryClient.setQueryData(queryKeys.sales.detail(newSale.id), newSale);
    },
  });
}

/**
 * Process a sale return (re-verify items, inventory re-stocking, refunds).
 */
export function useReturnSaleMutation(saleId: string) {
  const queryClient = useQueryClient();
  return useMutation<Sale, Error, ReturnSaleRequest>({
    mutationFn: (data) => sales.returnSale(saleId, data),
    onSuccess: (updatedSale) => {
      // Refresh individual sale record
      queryClient.setQueryData(queryKeys.sales.detail(saleId), updatedSale);
      
      // Invalidate dependencies
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
    },
  });
}

/**
 * Mutation for generating/fetching invoice PDF blob.
 */
export function useGenerateInvoiceMutation() {
  return useMutation<Blob, Error, string>({
    mutationFn: sales.generateInvoicePdf,
  });
}
