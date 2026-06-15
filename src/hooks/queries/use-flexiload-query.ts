// =============================================================================
// BizOS — TanStack Query Flexiload Hooks
// Covers mobile recharge account lines, transaction recharges, and queries.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flexiload } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  FlexiloadAccount,
  FlexiloadTransaction,
  CreateFlexiloadAccountRequest,
  UpdateFlexiloadAccountRequest,
  CreateFlexiloadTransactionRequest,
  FlexiloadQueryParams,
  PaginatedResponse,
} from '@/lib/api';

// ─── Flexiload Accounts Hooks ──────────────────────────────────────────────────

/**
 * Retrieve all registered Flexiload SIM account lines.
 */
export function useFlexiloadAccountsQuery() {
  return useQuery<FlexiloadAccount[]>({
    queryKey: queryKeys.flexiload.accounts(),
    queryFn: flexiload.listFlexiloadAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Retrieve a specific Flexiload account details.
 */
export function useFlexiloadAccountQuery(accountId: string) {
  return useQuery<FlexiloadAccount>({
    queryKey: [...queryKeys.flexiload.accounts(), accountId],
    queryFn: () => flexiload.getFlexiloadAccount(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Register a new Flexiload SIM account line.
 */
export function useCreateFlexiloadAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<FlexiloadAccount, Error, CreateFlexiloadAccountRequest>({
    mutationFn: flexiload.createFlexiloadAccount,
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flexiload.accounts() });
      queryClient.setQueryData([...queryKeys.flexiload.accounts(), newAccount.id], newAccount);
    },
  });
}

/**
 * Update an existing Flexiload SIM account line.
 */
export function useUpdateFlexiloadAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<FlexiloadAccount, Error, { id: string; data: UpdateFlexiloadAccountRequest }>({
    mutationFn: ({ id, data }) => flexiload.updateFlexiloadAccount(id, data),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData([...queryKeys.flexiload.accounts(), updatedAccount.id], updatedAccount);
      queryClient.invalidateQueries({ queryKey: queryKeys.flexiload.accounts() });
    },
  });
}

// ─── Flexiload Recharge Transaction Hooks ───────────────────────────────────────

/**
 * Standard paginated list of recharge transactions.
 */
export function useFlexiloadRechargesQuery(params?: FlexiloadQueryParams) {
  return useQuery<PaginatedResponse<FlexiloadTransaction>>({
    queryKey: queryKeys.flexiload.transactions(params),
    queryFn: () => flexiload.listFlexiloadRecharges(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Infinite query for listing recharge transactions.
 */
export function useInfiniteFlexiloadRechargesQuery(params?: FlexiloadQueryParams) {
  return useInfiniteQuery<PaginatedResponse<FlexiloadTransaction>>({
    queryKey: queryKeys.flexiload.transactions(params),
    queryFn: ({ pageParam }) =>
      flexiload.listFlexiloadRecharges({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Retrieve a specific recharge record details.
 */
export function useFlexiloadRechargeQuery(rechargeId: string) {
  return useQuery<FlexiloadTransaction>({
    queryKey: [...queryKeys.flexiload.all, 'recharge-detail', rechargeId],
    queryFn: () => flexiload.getFlexiloadRecharge(rechargeId),
    enabled: !!rechargeId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Execute a new mobile recharge transaction.
 * Invalidates:
 * - Flexiload accounts lists and recharges lists
 * - Cashbook balance drawer
 * - Dashboard reports
 */
export function useCreateFlexiloadRechargeMutation() {
  const queryClient = useQueryClient();
  return useMutation<FlexiloadTransaction, Error, CreateFlexiloadTransactionRequest>({
    mutationFn: flexiload.createFlexiloadRecharge,
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flexiload.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.flexiload.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.setQueryData([...queryKeys.flexiload.all, 'recharge-detail', newTx.id], newTx);
    },
  });
}
