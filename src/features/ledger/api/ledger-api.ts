import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SupplierInput, SettlementRecordInput } from '../types';
import { db } from '@/lib/db';
import { usePwaStore } from '@/features/pwa/stores/use-pwa-store';
import { MOCK_SUPPLIERS, MOCK_SUPPLIER_LEDGERS } from './ledger-mocks';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  companyName: string;
  address?: string;
  dueAmount: number;
  notes?: string;
  createdAt: string;
}

export interface SupplierLedgerItem {
  id: string;
  timestamp: string;
  description: string;
  type: 'purchase' | 'settlement';
  amount: number;
  balanceAfter: number;
  paymentMode?: 'cash' | 'bkash' | 'nagad' | 'bank';
  transactionId?: string;
}

/**
 * Hook to retrieve filtered suppliers list
 */
export function useSuppliersQuery(search = '', filterTab: 'all' | 'dues' | 'settled' = 'all') {
  return useQuery({
    queryKey: ['suppliers', 'list', search, filterTab],
    queryFn: async (): Promise<Supplier[]> => {
      try {
        return await apiClient.get<Supplier[]>(`/suppliers?search=${search}&filter=${filterTab}`);
      } catch (error) {
        console.warn('[Suppliers API] Using mockup fallbacks.', error);
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        let list = [...MOCK_SUPPLIERS];
        
        if (search) {
          const s = search.toLowerCase();
          list = list.filter((c) => c.name.toLowerCase().includes(s) || c.companyName.toLowerCase().includes(s) || c.phone.includes(s));
        }
        
        if (filterTab === 'dues') {
          list = list.filter((c) => c.dueAmount > 0);
        } else if (filterTab === 'settled') {
          list = list.filter((c) => c.dueAmount === 0);
        }

        return list;
      }
    },
  });
}

/**
 * Hook to retrieve specific supplier details
 */
export function useSupplierDetailsQuery(supplierId: string | null) {
  return useQuery({
    queryKey: ['suppliers', 'details', supplierId],
    enabled: !!supplierId,
    queryFn: async (): Promise<Supplier> => {
      try {
        return await apiClient.get<Supplier>(`/suppliers/${supplierId}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const found = MOCK_SUPPLIERS.find((s) => s.id === supplierId);
        if (!found) throw new Error('Supplier not found');
        return found;
      }
    },
  });
}

/**
 * Hook to retrieve specific supplier's ledger history
 */
export function useSupplierLedgerQuery(supplierId: string | null) {
  return useQuery({
    queryKey: ['suppliers', 'ledger', supplierId],
    enabled: !!supplierId,
    queryFn: async (): Promise<SupplierLedgerItem[]> => {
      try {
        return await apiClient.get<SupplierLedgerItem[]>(`/suppliers/${supplierId}/ledger`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return MOCK_SUPPLIER_LEDGERS[supplierId || ''] || [];
      }
    },
  });
}

/**
 * Hook to register new supplier
 */
export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierInput) => {
      try {
        return await apiClient.post<Supplier>('/suppliers', data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const newSupp: Supplier = {
          id: `supp-${Date.now()}`,
          name: data.name,
          phone: data.phone,
          companyName: data.companyName,
          address: data.address,
          dueAmount: data.initialDue || 0,
          notes: data.notes,
          createdAt: new Date().toISOString().split('T')[0],
        };
        MOCK_SUPPLIERS.unshift(newSupp);
        
        if (newSupp.dueAmount > 0) {
          MOCK_SUPPLIER_LEDGERS[newSupp.id] = [
            {
              id: `slg-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              description: 'প্রারম্ভিক বকেয়া (Initial Due)',
              type: 'purchase',
              amount: newSupp.dueAmount,
              balanceAfter: newSupp.dueAmount,
            }
          ];
        }
        return newSupp;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

/**
 * Hook to record supplier settlement payment
 */
export function useRecordSupplierSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { supplierId: string; input: SettlementRecordInput }) => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOffline) {
        console.log('[Ledger API] Client is offline. Queuing settlement record to outbox.');
        if (db) {
          await db.queueTransaction('ledger_create', data);
          usePwaStore.getState().updateOutboxCount();
        }
      }

      try {
        if (isOffline) {
          throw new Error('Offline mode active');
        }
        return await apiClient.post<SupplierLedgerItem>(`/suppliers/${data.supplierId}/settle`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const supplier = MOCK_SUPPLIERS.find((s) => s.id === data.supplierId);
        if (!supplier) throw new Error('Supplier not found');

        const previousDue = supplier.dueAmount;
        const nextDue = Math.max(0, previousDue - data.input.amount);
        
        supplier.dueAmount = nextDue;

        const newEntry: SupplierLedgerItem = {
          id: `slg-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          description: data.input.notes || 'পাওনা বকেয়া পরিশোধ (Settlement)',
          type: 'settlement',
          amount: data.input.amount,
          balanceAfter: nextDue,
          paymentMode: data.input.paymentMode,
          transactionId: data.input.transactionId,
        };

        if (!MOCK_SUPPLIER_LEDGERS[data.supplierId]) {
          MOCK_SUPPLIER_LEDGERS[data.supplierId] = [];
        }
        MOCK_SUPPLIER_LEDGERS[data.supplierId].unshift(newEntry);

        return newEntry;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'details', variables.supplierId] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'ledger', variables.supplierId] });
    },
  });
}
