/**
 * Customer feature hooks — adapters over TanStack Query + Khata SDK.
 */

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { usePwaStore } from '@/features/pwa/stores/use-pwa-store';
import { registerBackgroundSync } from '@/lib/offline/sync-engine';
import {
  useCustomersQuery as useCustomersQueryBase,
  useCustomerQuery as useCustomerQueryBase,
  useCreateCustomerMutation as useCreateCustomerMutationBase,
  useUpdateCustomerMutation as useUpdateCustomerMutationBase,
  useDeleteCustomerMutation as useDeleteCustomerMutationBase,
} from '@/hooks/queries/use-customer-query';
import {
  useKhataAccountsQuery,
  useKhataEntriesQuery,
} from '@/hooks/queries/use-khata-query';
import { khata } from '@/lib/api';
import { queryKeys } from '@/hooks/queries/query-keys';
import { parseAddressString, toCustomerView, khataEntryToLedgerItem, toPaymentMethod } from '@/lib/crm/mappers';
import { takaToCents } from '@/lib/crm/money';
import type { CustomerView, CustomerLedgerItemView } from '@/lib/crm/mappers';
import type { CustomerInput, LedgerEntryInput } from '../types';

export type Customer = CustomerView;
export type CustomerLedgerItem = CustomerLedgerItemView;

function useKhataBalanceMap(partyType: 'CUSTOMER' | 'SUPPLIER') {
  const { data } = useKhataAccountsQuery({ partyType, limit: 100 });
  return useMemo(() => {
    const balanceByParty = new Map<string, number>();
    const accountByParty = new Map<string, string>();
    for (const account of data?.data ?? []) {
      balanceByParty.set(account.partyId, account.balanceCents);
      accountByParty.set(account.partyId, account.id);
    }
    return { balanceByParty, accountByParty };
  }, [data]);
}

async function resolveKhataAccountId(
  partyType: 'CUSTOMER' | 'SUPPLIER',
  partyId: string,
): Promise<string> {
  const account = await khata.ensureKhataAccount({ partyType, partyId });
  return account.id;
}

export function useCustomersQuery(
  search = '',
  filterTab: 'all' | 'dues' | 'paid' = 'all',
  cursor?: string,
  limit = 20,
) {
  const { balanceByParty, accountByParty } = useKhataBalanceMap('CUSTOMER');

  const query = useCustomersQueryBase({
    search: search || undefined,
    cursor,
    limit,
  });

  const customers = useMemo(() => {
    let list = (query.data?.data ?? []).map((c) =>
      toCustomerView(c, balanceByParty.get(c.id) ?? 0, accountByParty.get(c.id)),
    );

    if (filterTab === 'dues') {
      list = list.filter((c) => c.dueCents > 0);
    } else if (filterTab === 'paid') {
      list = list.filter((c) => c.dueCents <= 0);
    }

    return list;
  }, [query.data, balanceByParty, accountByParty, filterTab]);

  return {
    ...query,
    data: customers,
    meta: query.data?.meta,
  };
}

export function useCustomerDetailsQuery(customerId: string) {
  const { balanceByParty, accountByParty } = useKhataBalanceMap('CUSTOMER');
  const query = useCustomerQueryBase(customerId);

  const customer = useMemo(() => {
    if (!query.data) return undefined;
    return toCustomerView(
      query.data,
      balanceByParty.get(query.data.id) ?? 0,
      accountByParty.get(query.data.id),
    );
  }, [query.data, balanceByParty, accountByParty]);

  return { ...query, data: customer };
}

export function useCustomerLedgerQuery(customerId: string) {
  const { accountByParty } = useKhataBalanceMap('CUSTOMER');
  const accountId = accountByParty.get(customerId) ?? '';

  const query = useKhataEntriesQuery(accountId, { limit: 50 });

  const ledger = useMemo(
    () => (query.data?.data ?? []).map(khataEntryToLedgerItem),
    [query.data],
  );

  return {
    ...query,
    data: ledger,
    isLoading: !accountId ? false : query.isLoading,
  };
}

export function useCreateCustomerMutation() {
  const base = useCreateCustomerMutationBase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CustomerInput) => {
      const customer = await base.mutateAsync({
        name: input.name,
        phone: input.phone,
        address: parseAddressString(input.address),
        notes: input.notes,
      });

      if (input.initialDue && input.initialDue > 0) {
        const accountId = await resolveKhataAccountId('CUSTOMER', customer.id);
        await khata.recordKhataAdjustment(accountId, {
            type: 'DEBIT',
            amountCents: takaToCents(input.initialDue),
            description: 'প্রারম্ভিক বকেয়া',
          });
      }

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomerMutation() {
  const base = useUpdateCustomerMutationBase();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CustomerInput }) =>
      base.mutateAsync({
        id,
        data: {
          name: input.name,
          phone: input.phone,
          address: parseAddressString(input.address),
          notes: input.notes,
        },
      }),
  });
}

export function useDeleteCustomerMutation() {
  return useDeleteCustomerMutationBase();
}

export function useAddLedgerEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      input,
      paymentMode,
    }: {
      customerId: string;
      input: LedgerEntryInput;
      paymentMode?: string;
    }) => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOffline) {
        if (input.type === 'collect') {
          if (db) {
            await db.queueTransaction('ledger_create', {
              customerId,
              amountCents: takaToCents(input.amount),
              method: paymentMode ? toPaymentMethod(paymentMode) : 'CASH',
              notes: input.description,
            });
            usePwaStore.getState().updateOutboxCount();
            registerBackgroundSync();
          }
          throw new Error('Offline mode active');
        } else {
          throw new Error('Offline mode does not support giving due adjustments yet.');
        }
      }

      const accountId = await resolveKhataAccountId('CUSTOMER', customerId);

      if (input.type === 'collect') {
        await khata.recordCollection(accountId, {
          amountCents: takaToCents(input.amount),
          method: paymentMode ? toPaymentMethod(paymentMode) : 'CASH',
          notes: input.description,
        });
      } else {
        await khata.recordKhataAdjustment(accountId, {
          type: 'DEBIT',
          amountCents: takaToCents(input.amount),
          description: input.description,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
