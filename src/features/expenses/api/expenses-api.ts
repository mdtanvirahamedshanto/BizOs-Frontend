/**
 * Expense feature hooks — adapters over TanStack Query + Expenses SDK.
 */

import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  useExpensesQuery as useExpensesQueryBase,
  useExpenseCategoriesQuery as useExpenseCategoriesQueryBase,
  useCreateExpenseMutation as useCreateExpenseMutationBase,
  useUpdateExpenseMutation as useUpdateExpenseMutationBase,
  useDeleteExpenseMutation as useDeleteExpenseMutationBase,
  useRecurringExpensesQuery,
  useCreateRecurringExpenseMutation as useCreateRecurringExpenseMutationBase,
  useProcessRecurringExpensesMutation,
  useCreateExpenseCategoryMutation as useCreateExpenseCategoryMutationBase,
} from '@/hooks/queries/use-expense-query';
import {
  toExpenseView,
  toExpenseCategoryView,
  toRecurringExpenseView,
  expenseInputToRequest,
  type ExpenseView,
  type ExpenseCategoryView,
  type ExpenseInput,
} from '@/lib/crm/expense-mappers';

export type Expense = ExpenseView;
export type ExpenseCategory = ExpenseCategoryView;

export function useExpensesQuery(
  search = '',
  categoryId = '',
  cursor?: string,
  limit = 20,
) {
  const query = useExpensesQueryBase({
    search: search || undefined,
    categoryId: categoryId || undefined,
    cursor,
    limit,
  });

  const expenses = useMemo(
    () => (query.data?.data ?? []).map(toExpenseView),
    [query.data],
  );

  return { ...query, data: expenses, meta: query.data?.meta };
}

export function useExpenseCategoriesQuery() {
  const query = useExpenseCategoriesQueryBase();
  const categories = useMemo(
    () => (query.data ?? []).map(toExpenseCategoryView),
    [query.data],
  );
  return { ...query, data: categories };
}

export function useRecurringExpensesListQuery() {
  const query = useRecurringExpensesQuery({ limit: 50 });
  const items = useMemo(
    () => (query.data?.data ?? []).map(toRecurringExpenseView),
    [query.data],
  );
  return { ...query, data: items };
}

export function useCreateExpenseMutation() {
  const base = useCreateExpenseMutationBase();
  return useMutation({
    mutationFn: (input: ExpenseInput) => base.mutateAsync(expenseInputToRequest(input)),
  });
}

export function useUpdateExpenseMutation() {
  const base = useUpdateExpenseMutationBase();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) =>
      base.mutateAsync({ id, data: expenseInputToRequest(input) }),
  });
}

export { useDeleteExpenseMutationBase as useDeleteExpenseMutation };

export function useCreateRecurringExpenseMutation() {
  const base = useCreateRecurringExpenseMutationBase();
  return useMutation({
    mutationFn: (data: Parameters<typeof base.mutateAsync>[0]) => base.mutateAsync(data),
  });
}

export { useProcessRecurringExpensesMutation };

export function useCreateExpenseCategoryMutation() {
  const base = useCreateExpenseCategoryMutationBase();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) => base.mutateAsync(input),
  });
}
