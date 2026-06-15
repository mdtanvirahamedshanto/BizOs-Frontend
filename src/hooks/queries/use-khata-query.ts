// =============================================================================
// BizOS — TanStack Query Khata (Credit Ledger) Hooks
// Covers khata accounts, entry ledgers, due summaries, collection/repayment.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { khata } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  KhataAccount,
  KhataEntry,
  KhataDueSummary,
  KhataQueryParams,
  KhataEntryQueryParams,
  RecordCollectionRequest,
  RecordRepaymentRequest,
  KhataAdjustmentRequest,
  PaginatedResponse,
} from '@/lib/api';

/**
 * Retrieve the aggregated due/receivable summary across all khata accounts.
 */
export function useKhataDueSummaryQuery() {
  return useQuery<KhataDueSummary>({
    queryKey: queryKeys.khata.dueSummary(),
    queryFn: khata.getKhataDueSummary,
    staleTime: 2 * 60 * 1000, // Stale after 2 minutes
  });
}

/**
 * Standard paginated list of credit/debit ledger accounts.
 */
export function useKhataAccountsQuery(params?: KhataQueryParams) {
  return useQuery<PaginatedResponse<KhataAccount>>({
    queryKey: queryKeys.khata.accounts(params),
    queryFn: () => khata.listKhataAccounts(params),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Infinite query for credit/debit ledger accounts.
 */
export function useInfiniteKhataAccountsQuery(params?: KhataQueryParams) {
  return useInfiniteQuery<PaginatedResponse<KhataAccount>>({
    queryKey: queryKeys.khata.accounts(params),
    queryFn: ({ pageParam }) =>
      khata.listKhataAccounts({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Retrieve a single khata account.
 */
export function useKhataAccountQuery(accountId: string) {
  return useQuery<KhataAccount>({
    queryKey: queryKeys.khata.detail(accountId),
    queryFn: () => khata.getKhataAccount(accountId),
    enabled: !!accountId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Standard paginated list of ledger entry updates.
 */
export function useKhataEntriesQuery(accountId: string, params?: KhataEntryQueryParams) {
  return useQuery<PaginatedResponse<KhataEntry>>({
    queryKey: queryKeys.khata.entries(accountId, params),
    queryFn: () => khata.listKhataEntries(accountId, params),
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // Ledger entries cache stale after 1 minute
  });
}

/**
 * Infinite query for ledger entry updates.
 */
export function useInfiniteKhataEntriesQuery(accountId: string, params?: KhataEntryQueryParams) {
  return useInfiniteQuery<PaginatedResponse<KhataEntry>>({
    queryKey: queryKeys.khata.entries(accountId, params),
    queryFn: ({ pageParam }) =>
      khata.listKhataEntries(accountId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Record payment collection from a customer.
 * Invalidates:
 * - Specific account details and listings
 * - Credit due summaries
 * - Cashbook balance drawer
 * - Dashboard reports
 */
export function useRecordCollectionMutation(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<KhataEntry, Error, RecordCollectionRequest>({
    mutationFn: (data) => khata.recordCollection(accountId, data),
    onSuccess: (newEntry) => {
      // Invalidate Khata cache
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.detail(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.entriesList(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.dueSummary() });
      
      // Invalidate Cash drawer and general reports
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      
      // Also update customer cache if relevant
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

/**
 * Record a payment repayment to a supplier.
 */
export function useRecordRepaymentMutation(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<KhataEntry, Error, RecordRepaymentRequest>({
    mutationFn: (data) => khata.recordRepayment(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.detail(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.entriesList(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.dueSummary() });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
}

/**
 * Adjust outstanding balances manually.
 */
export function useRecordKhataAdjustmentMutation(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation<KhataEntry, Error, KhataAdjustmentRequest>({
    mutationFn: (data) => khata.recordKhataAdjustment(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.detail(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.entriesList(accountId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.dueSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
}
