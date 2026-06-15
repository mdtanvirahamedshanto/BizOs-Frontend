// =============================================================================
// BizOS — TanStack Query MFS Hooks
// Covers digital wallet accounts (bKash, Nagad, etc.) and cash-in/out logs.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mfs } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  MfsAccount,
  MfsTransaction,
  CreateMfsAccountRequest,
  UpdateMfsAccountRequest,
  CreateMfsTransactionRequest,
  MfsTransactionQueryParams,
  PaginatedResponse,
} from '@/lib/api';

// ─── MFS Accounts Hooks ───────────────────────────────────────────────────────

/**
 * Retrieve the list of all registered MFS accounts.
 */
export function useMfsAccountsQuery() {
  return useQuery<MfsAccount[]>({
    queryKey: queryKeys.mfs.accounts(),
    queryFn: mfs.listMfsAccounts,
    staleTime: 5 * 60 * 1000, // Accounts metadata is stable (5m)
  });
}

/**
 * Retrieve a specific MFS account's details.
 */
export function useMfsAccountQuery(accountId: string) {
  return useQuery<MfsAccount>({
    queryKey: [...queryKeys.mfs.accounts(), accountId],
    queryFn: () => mfs.getMfsAccount(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new MFS account (e.g. bKash Personal/Agent).
 */
export function useCreateMfsAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<MfsAccount, Error, CreateMfsAccountRequest>({
    mutationFn: mfs.createMfsAccount,
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfs.accounts() });
      queryClient.setQueryData([...queryKeys.mfs.accounts(), newAccount.id], newAccount);
    },
  });
}

/**
 * Update an existing MFS account's status/details.
 */
export function useUpdateMfsAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<MfsAccount, Error, { id: string; data: UpdateMfsAccountRequest }>({
    mutationFn: ({ id, data }) => mfs.updateMfsAccount(id, data),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData([...queryKeys.mfs.accounts(), updatedAccount.id], updatedAccount);
      queryClient.invalidateQueries({ queryKey: queryKeys.mfs.accounts() });
    },
  });
}

// ─── MFS Transactions Hooks ───────────────────────────────────────────────────

/**
 * Standard paginated list of MFS transactions (cash-ins, merchant pays…).
 */
export function useMfsTransactionsQuery(params?: MfsTransactionQueryParams) {
  return useQuery<PaginatedResponse<MfsTransaction>>({
    queryKey: queryKeys.mfs.transactions(params),
    queryFn: () => mfs.listMfsTransactions(params),
    staleTime: 2 * 60 * 1000, // Transaction records stale in 2 mins
  });
}

/**
 * Infinite query for listing MFS transactions.
 */
export function useInfiniteMfsTransactionsQuery(params?: MfsTransactionQueryParams) {
  return useInfiniteQuery<PaginatedResponse<MfsTransaction>>({
    queryKey: queryKeys.mfs.transactions(params),
    queryFn: ({ pageParam }) =>
      mfs.listMfsTransactions({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Retrieve a specific MFS transaction record.
 */
export function useMfsTransactionQuery(transactionId: string) {
  return useQuery<MfsTransaction>({
    queryKey: [...queryKeys.mfs.all, 'transaction-detail', transactionId],
    queryFn: () => mfs.getMfsTransaction(transactionId),
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Record a new MFS digital transaction.
 * Invalidates:
 * - MFS accounts balance
 * - MFS transactions lists
 * - Cashbook balance (in case MFS feeds cashbook drawer cash-ins/outs)
 * - General reports dashboard (metrics changes)
 */
export function useCreateMfsTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation<MfsTransaction, Error, CreateMfsTransactionRequest>({
    mutationFn: mfs.createMfsTransaction,
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mfs.accounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.mfs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.setQueryData([...queryKeys.mfs.all, 'transaction-detail', newTx.id], newTx);
    },
  });
}
