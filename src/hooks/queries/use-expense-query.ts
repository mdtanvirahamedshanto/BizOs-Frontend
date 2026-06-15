// =============================================================================
// BizOS — TanStack Query Expense Hooks
// Covers expense categories, daily expense logging, recurring expense schedules.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenses } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Expense,
  ExpenseCategory,
  RecurringExpense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  ExpenseCategoryRequest,
  ExpenseQueryParams,
  RecurringExpenseQueryParams,
  PaginatedResponse,
} from '@/lib/api';

// ─── Expense Categories Hooks ─────────────────────────────────────────────────

export function useExpenseCategoriesQuery() {
  return useQuery<ExpenseCategory[]>({
    queryKey: queryKeys.expenses.categories(),
    queryFn: expenses.listExpenseCategories,
    staleTime: 20 * 60 * 1000, // Expense categories are highly static (20m)
  });
}

export function useExpenseCategoryQuery(categoryId: string) {
  return useQuery<ExpenseCategory>({
    queryKey: [...queryKeys.expenses.categories(), categoryId],
    queryFn: () => expenses.getExpenseCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 20 * 60 * 1000,
  });
}

export function useCreateExpenseCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<ExpenseCategory, Error, ExpenseCategoryRequest>({
    mutationFn: expenses.createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
    },
  });
}

export function useUpdateExpenseCategoryMutation(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation<ExpenseCategory, Error, ExpenseCategoryRequest>({
    mutationFn: (data) => expenses.updateExpenseCategory(categoryId, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData([...queryKeys.expenses.categories(), categoryId], updatedCategory);
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
    },
  });
}

export function useDeleteExpenseCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: expenses.deleteExpenseCategory,
    onSuccess: (_, categoryId) => {
      queryClient.removeQueries({ queryKey: [...queryKeys.expenses.categories(), categoryId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.categories() });
    },
  });
}

// ─── Daily Expenses Hooks ─────────────────────────────────────────────────────

export function useExpensesQuery(params?: ExpenseQueryParams) {
  return useQuery<PaginatedResponse<Expense>>({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => expenses.listExpenses(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInfiniteExpensesQuery(params?: ExpenseQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Expense>>({
    queryKey: queryKeys.expenses.list(params),
    queryFn: ({ pageParam }) =>
      expenses.listExpenses({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpenseQuery(expenseId: string) {
  return useQuery<Expense>({
    queryKey: queryKeys.expenses.detail(expenseId),
    queryFn: () => expenses.getExpense(expenseId),
    enabled: !!expenseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Record an expense. Deducts cash from cashbook and updates metrics.
 */
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseRequest>({
    mutationFn: expenses.createExpense,
    onSuccess: (newExpense) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.setQueryData(queryKeys.expenses.detail(newExpense.id), newExpense);
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, { id: string; data: UpdateExpenseRequest }>({
    mutationFn: ({ id, data }) => expenses.updateExpense(id, data),
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData(queryKeys.expenses.detail(updatedExpense.id), updatedExpense);
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: expenses.deleteExpense,
    onSuccess: (_, expenseId) => {
      queryClient.removeQueries({ queryKey: queryKeys.expenses.detail(expenseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

// ─── Recurring Expenses Hooks ─────────────────────────────────────────────────

export function useRecurringExpensesQuery(params?: RecurringExpenseQueryParams) {
  return useQuery<PaginatedResponse<RecurringExpense>>({
    queryKey: queryKeys.expenses.recurringList(params),
    queryFn: () => expenses.listRecurringExpenses(params),
    staleTime: 10 * 60 * 1000, // Recurring schedules are moderately static (10m)
  });
}

export function useInfiniteRecurringExpensesQuery(params?: RecurringExpenseQueryParams) {
  return useInfiniteQuery<PaginatedResponse<RecurringExpense>>({
    queryKey: queryKeys.expenses.recurringList(params),
    queryFn: ({ pageParam }) =>
      expenses.listRecurringExpenses({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecurringExpenseQuery(recurringId: string) {
  return useQuery<RecurringExpense>({
    queryKey: [...queryKeys.expenses.recurrings(), recurringId],
    queryFn: () => expenses.getRecurringExpense(recurringId),
    enabled: !!recurringId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRecurringExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<RecurringExpense, Error, CreateRecurringExpenseRequest>({
    mutationFn: expenses.createRecurringExpense,
    onSuccess: (newRec) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.recurrings() });
      queryClient.setQueryData([...queryKeys.expenses.recurrings(), newRec.id], newRec);
    },
  });
}

export function useUpdateRecurringExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<RecurringExpense, Error, { id: string; data: UpdateRecurringExpenseRequest }>({
    mutationFn: ({ id, data }) => expenses.updateRecurringExpense(id, data),
    onSuccess: (updatedRec) => {
      queryClient.setQueryData([...queryKeys.expenses.recurrings(), updatedRec.id], updatedRec);
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.recurrings() });
    },
  });
}

/**
 * Triggers batch processing on the backend to execute outstanding due recurring schedules.
 */
export function useProcessRecurringExpensesMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ processed: number }, Error, void>({
    mutationFn: expenses.processRecurringExpenses,
    onSuccess: (res) => {
      if (res.processed > 0) {
        // Invalidate both daily expenses list and recurring settings
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.balance() });
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      }
    },
  });
}
