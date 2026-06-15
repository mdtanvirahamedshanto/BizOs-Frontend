/**
 * Supplier feature hooks — adapters over TanStack Query + Khata SDK.
 */

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useSuppliersQuery as useSuppliersQueryBase,
  useSupplierQuery as useSupplierQueryBase,
  useSupplierDueTrackingQuery,
  useSupplierLedgerQuery as useSupplierLedgerQueryBase,
  useSupplierPaymentsQuery,
  useCreateSupplierMutation as useCreateSupplierMutationBase,
  useUpdateSupplierMutation as useUpdateSupplierMutationBase,
  useDeleteSupplierMutation as useDeleteSupplierMutationBase,
} from '@/hooks/queries/use-supplier-query';
import { useKhataAccountsQuery } from '@/hooks/queries/use-khata-query';
import { khata } from '@/lib/api';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  toSupplierView,
  supplierLedgerToView,
  toPaymentMethod,
  type SupplierView,
  type SupplierLedgerItemView,
} from '@/lib/crm/mappers';
import { takaToCents } from '@/lib/crm/money';
import type { SupplierInput, SettlementRecordInput } from '../types';

export type Supplier = SupplierView;
export type SupplierLedgerItem = SupplierLedgerItemView;

function useKhataSupplierMaps() {
  const { data } = useKhataAccountsQuery({ partyType: 'SUPPLIER', limit: 100 });
  return useMemo(() => {
    const payableByParty = new Map<string, number>();
    const accountByParty = new Map<string, string>();
    for (const account of data?.data ?? []) {
      const payable = account.balanceCents < 0 ? Math.abs(account.balanceCents) : 0;
      payableByParty.set(account.partyId, payable);
      accountByParty.set(account.partyId, account.id);
    }
    return { payableByParty, accountByParty };
  }, [data]);
}

async function resolveSupplierKhataAccountId(supplierId: string): Promise<string | null> {
  const res = await khata.listKhataAccounts({ partyType: 'SUPPLIER', limit: 100 });
  return res.data.find((a) => a.partyId === supplierId)?.id ?? null;
}

export function useSuppliersQuery(
  search = '',
  filterTab: 'all' | 'dues' | 'settled' = 'all',
  cursor?: string,
  limit = 20,
) {
  const { payableByParty, accountByParty } = useKhataSupplierMaps();

  const query = useSuppliersQueryBase({
    search: search || undefined,
    cursor,
    limit,
  });

  const suppliers = useMemo(() => {
    let list = (query.data?.data ?? []).map((s) =>
      toSupplierView(
        s,
        payableByParty.get(s.id) ?? s.totalDueCents,
        accountByParty.get(s.id),
      ),
    );

    if (filterTab === 'dues') {
      list = list.filter((s) => s.dueCents > 0);
    } else if (filterTab === 'settled') {
      list = list.filter((s) => s.dueCents <= 0);
    }

    return list;
  }, [query.data, payableByParty, accountByParty, filterTab]);

  return {
    ...query,
    data: suppliers,
    meta: query.data?.meta,
  };
}

export function useSupplierQuery(supplierId: string) {
  const { payableByParty, accountByParty } = useKhataSupplierMaps();
  const query = useSupplierQueryBase(supplierId);
  const dueQuery = useSupplierDueTrackingQuery(supplierId);

  const supplier = useMemo(() => {
    if (!query.data) return undefined;
    const dueCents =
      dueQuery.data?.totalShopOwesCents ??
      payableByParty.get(query.data.id) ??
      query.data.totalDueCents;
    return toSupplierView(query.data, dueCents, accountByParty.get(query.data.id));
  }, [query.data, dueQuery.data, payableByParty, accountByParty]);

  return { ...query, data: supplier };
}

export function useSupplierLedgerQuery(supplierId: string | null) {
  const query = useSupplierLedgerQueryBase(supplierId ?? '', { limit: 50 });

  const ledger = useMemo(
    () => (query.data?.data ?? []).map(supplierLedgerToView),
    [query.data],
  );

  return {
    ...query,
    data: ledger,
    enabled: !!supplierId,
  };
}

export function useSupplierPaymentsHistoryQuery(supplierId: string | null) {
  const query = useSupplierPaymentsQuery(supplierId ?? '', { limit: 50 });

  const payments = useMemo(
    () => (query.data?.data ?? []).map(supplierLedgerToView),
    [query.data],
  );

  return {
    ...query,
    data: payments,
    enabled: !!supplierId,
  };
}

export function useCreateSupplierMutation() {
  const base = useCreateSupplierMutationBase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SupplierInput) => {
      const supplier = await base.mutateAsync({
        name: input.name,
        companyName: input.companyName,
        phone: input.phone,
        address: input.address,
        notes: input.notes,
      });

      if (input.initialDue && input.initialDue > 0) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.khata.accounts() });
        const accountId = await resolveSupplierKhataAccountId(supplier.id);
        if (accountId) {
          await khata.recordKhataAdjustment(accountId, {
            type: 'CREDIT',
            amountCents: takaToCents(input.initialDue),
            description: 'প্রারম্ভিক পাওনা',
          });
        }
      }

      return toSupplierView(supplier, input.initialDue ? takaToCents(input.initialDue) : 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
}

export function useUpdateSupplierMutation() {
  const base = useUpdateSupplierMutationBase();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<SupplierInput>;
    }) =>
      base.mutateAsync({
        id,
        data: {
          name: input.name,
          companyName: input.companyName,
          phone: input.phone,
          address: input.address,
          notes: input.notes,
        },
      }),
  });
}

export function useDeleteSupplierMutation() {
  return useDeleteSupplierMutationBase();
}

export function useRecordSupplierSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      input,
    }: {
      supplierId: string;
      input: SettlementRecordInput;
    }) => {
      let accountId = await resolveSupplierKhataAccountId(supplierId);

      if (!accountId) {
        throw new Error('মহাজনের খাতা অ্যাকাউন্ট পাওয়া যায়নি।');
      }

      await khata.recordRepayment(accountId, {
        amountCents: takaToCents(input.amount),
        method: toPaymentMethod(input.paymentMode),
        reference: input.transactionId,
        notes: input.notes,
      });
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.ledger(supplierId) });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.suppliers.all, 'payments-history', supplierId],
      });
    },
  });
}
