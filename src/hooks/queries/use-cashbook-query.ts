// =============================================================================
// BizOS — TanStack Query Cashbook Hooks
// Covers real-time cash balance tracking, cash ledger logging, daily closings.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashbook } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  CashEntry,
  CashBalance,
  ClosingPreview,
  DailyClosing,
  ManualCashEntryRequest,
  DailyClosingRequest,
  CashbookQueryParams,
  PaginatedResponse,
} from '@/lib/api';

/**
 * Retrieve the real-time cash in drawer balance.
 * Set to a short staleTime (30s) to guarantee accurate figures for POS cash checkout checks.
 */
export function useCashbookBalanceQuery() {
  return useQuery<CashBalance>({
    queryKey: queryKeys.cashbook.balance(),
    queryFn: cashbook.getCashBalance,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Standard paginated list of cash ledger transaction entries.
 */
export function useCashbookEntriesQuery(params?: CashbookQueryParams) {
  return useQuery<PaginatedResponse<CashEntry>>({
    queryKey: queryKeys.cashbook.entries(params),
    queryFn: () => cashbook.listCashbookEntries(params),
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Infinite query for cash ledger transaction entries.
 */
export function useInfiniteCashbookEntriesQuery(params?: CashbookQueryParams) {
  return useInfiniteQuery<PaginatedResponse<CashEntry>>({
    queryKey: queryKeys.cashbook.entries(params),
    queryFn: ({ pageParam }) =>
      cashbook.listCashbookEntries({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Retrieve today's expected daily closing balance aggregates preview.
 */
export function useClosingPreviewQuery() {
  return useQuery<ClosingPreview>({
    queryKey: queryKeys.cashbook.closingPreview(),
    queryFn: cashbook.getClosingPreview,
    staleTime: 5 * 1000, // Extremely fresh preview (5s)
  });
}

/**
 * Retrieve list of all past validated daily closing tallies.
 */
export function useDailyClosingsQuery() {
  return useQuery<DailyClosing[]>({
    queryKey: queryKeys.cashbook.closings(),
    queryFn: cashbook.listDailyClosings,
    staleTime: 10 * 60 * 1000, // Past closings are static (10m)
  });
}

/**
 * Record a manual cash-in transaction.
 */
export function useRecordCashInMutation() {
  const queryClient = useQueryClient();
  return useMutation<CashEntry, Error, ManualCashEntryRequest>({
    mutationFn: cashbook.recordCashIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.entries() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.closingPreview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

/**
 * Record a manual cash-out transaction.
 */
export function useRecordCashOutMutation() {
  const queryClient = useQueryClient();
  return useMutation<CashEntry, Error, ManualCashEntryRequest>({
    mutationFn: cashbook.recordCashOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.entries() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.closingPreview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

/**
 * Record the verified count actual cash drawer closing at end-of-day.
 */
export function useRecordDailyClosingMutation() {
  const queryClient = useQueryClient();
  return useMutation<DailyClosing, Error, DailyClosingRequest>({
    mutationFn: cashbook.recordDailyClosing,
    onSuccess: () => {
      // Refresh the entire cashbook domain and closing tallies
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
