import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SupplierInput, SettlementRecordInput } from '../types';

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

let MOCK_SUPPLIERS: Supplier[] = [
  { id: 'supp-1', name: 'মোঃ খোরশেদ আলম (Alom)', phone: '01811223344', companyName: 'আলম হোলসেল ডিস্ট্রিবিউটর', address: 'কারওয়ান বাজার, ঢাকা', dueAmount: 15400, notes: 'প্রধান চাল ও ডাল সরবরাহকারী', createdAt: '2026-02-10' },
  { id: 'supp-2', name: 'কামরুল হাসান (Kamrul)', phone: '01922334455', companyName: 'হাসান ট্রেডার্স', address: 'চকবাজার, ঢাকা', dueAmount: 8000, notes: 'সয়াবিন তেল ও মশলা সরবরাহকারী', createdAt: '2026-03-15' },
  { id: 'supp-3', name: 'নুরজাহান বেগম (Nurjahan)', phone: '01733445566', companyName: 'নুর ট্রেড ইন্টারন্যাশনাল', address: 'যাত্রাবাড়ী, ঢাকা', dueAmount: 0, notes: 'প্যাকেজিং সামগ্রী সরবরাহকারী', createdAt: '2026-04-01' },
];

const MOCK_SUPPLIER_LEDGERS: Record<string, SupplierLedgerItem[]> = {
  'supp-1': [
    { id: 'slg-1', timestamp: '2026-06-01 11:30', description: 'মিনিকেট চাল ৫০ বস্তা ক্রয়', type: 'purchase', amount: 75000, balanceAfter: 75000 },
    { id: 'slg-2', timestamp: '2026-06-05 14:00', description: 'ব্যাংক ট্রান্সফার পেমেন্ট', type: 'settlement', amount: 59600, balanceAfter: 15400, paymentMode: 'bank', transactionId: 'TXN891023' },
  ],
  'supp-2': [
    { id: 'slg-3', timestamp: '2026-05-18 10:00', description: 'তীর তেল ২০ কার্টন ক্রয়', type: 'purchase', amount: 18000, balanceAfter: 18000 },
    { id: 'slg-4', timestamp: '2026-05-25 16:30', description: 'নগদ ক্যাশ পেমেন্ট', type: 'settlement', amount: 10000, balanceAfter: 8000, paymentMode: 'cash' },
  ],
  'supp-3': [
    { id: 'slg-5', timestamp: '2026-06-10 09:30', description: 'প্যাকেজিং ব্যাগ ক্রয়', type: 'purchase', amount: 5000, balanceAfter: 5000 },
    { id: 'slg-6', timestamp: '2026-06-12 15:45', description: 'বিকাশ পেমেন্ট', type: 'settlement', amount: 5000, balanceAfter: 0, paymentMode: 'bkash', transactionId: 'BKSH821038' },
  ],
};

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
      try {
        return await apiClient.post<SupplierLedgerItem>(`/suppliers/${data.supplierId}/settle`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
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
