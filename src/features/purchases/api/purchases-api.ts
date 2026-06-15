/**
 * Purchase feature hooks — adapters over TanStack Query + Purchases SDK.
 */

import { useMemo, useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  usePurchasesQuery as usePurchasesQueryBase,
  usePurchaseQuery as usePurchaseQueryBase,
  useCreatePurchaseMutation as useCreatePurchaseMutationBase,
  useUpdatePurchaseStatusMutation as useUpdatePurchaseStatusMutationBase,
  useReturnPurchaseMutation as useReturnPurchaseMutationBase,
} from '@/hooks/queries/use-purchase-query';
import { toPurchaseView, createPurchaseInputToRequest } from '@/lib/crm/purchase-mappers';
import type { PurchaseView, CreatePurchaseInput } from '@/lib/crm/purchase-mappers';
import type { PurchaseStatus, ReturnPurchaseRequest } from '@/lib/api';

export type Purchase = PurchaseView;

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function usePurchasesQuery(
  search = '',
  status?: PurchaseStatus,
  cursor?: string,
  limit = 20,
) {
  const debouncedSearch = useDebouncedValue(search.trim());

  const query = usePurchasesQueryBase({
    search: debouncedSearch || undefined,
    status,
    cursor,
    limit,
  });

  const purchases = useMemo(
    () => (query.data?.data ?? []).map(toPurchaseView),
    [query.data],
  );

  return {
    ...query,
    data: purchases,
    meta: query.data?.meta,
  };
}

export function usePurchaseDetailsQuery(purchaseId: string | null) {
  const query = usePurchaseQueryBase(purchaseId ?? '');
  return {
    ...query,
    data: query.data ? toPurchaseView(query.data) : undefined,
  };
}

export function useCreatePurchaseMutation() {
  const base = useCreatePurchaseMutationBase();
  return useMutation({
    mutationFn: (input: CreatePurchaseInput) =>
      base.mutateAsync(createPurchaseInputToRequest(input)),
  });
}

export function useUpdatePurchaseStatusMutation(purchaseId: string) {
  const base = useUpdatePurchaseStatusMutationBase(purchaseId);
  return useMutation({
    mutationFn: (data: Parameters<typeof base.mutateAsync>[0]) => base.mutateAsync(data),
  });
}

export function useReturnPurchaseMutation(purchaseId: string) {
  const base = useReturnPurchaseMutationBase(purchaseId);
  return useMutation({
    mutationFn: (data: ReturnPurchaseRequest) => base.mutateAsync(data),
  });
}
