import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CustomerInput, LedgerEntryInput } from '../types';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  dueAmount: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerLedgerItem {
  id: string;
  timestamp: string;
  description: string;
  type: 'sale' | 'collect' | 'give'; // sale = order credit (due), collect = due payed, give = cash refund / adjustment
  amount: number;
  balanceAfter: number;
}

// Global variable representing in-memory mock customers list for local preview edits
let MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'মোঃ আব্দুর রহমান (Rahman)', phone: '01711223344', address: 'মিরপুর ঢাকা', dueAmount: 5200, notes: 'বিশ্বস্ত কাস্টমার, সাধারণত মাসের শেষে পরিশোধ করেন।', createdAt: '2026-01-10' },
  { id: 'cust-2', name: 'আবুল কালাম (Kalam)', phone: '01819876543', address: 'উত্তরা ঢাকা', dueAmount: 12000, notes: 'পাইকারি ক্রেতা।', createdAt: '2026-02-15' },
  { id: 'cust-3', name: 'সাদিয়া ইসলাম (Sadia)', phone: '01511223355', address: 'ধানমন্ডি ঢাকা', dueAmount: 0, notes: 'নগদ ক্রেতা।', createdAt: '2026-03-20' },
  { id: 'cust-4', name: 'রাসেল মিয়া (Rasel)', phone: '01912344321', address: 'মোহাম্মদপুর ঢাকা', dueAmount: 1200, notes: 'বকেয়া আংশিক পরিশোধ করেছেন।', createdAt: '2026-04-05' },
];

const MOCK_LEDGERS: Record<string, CustomerLedgerItem[]> = {
  'cust-1': [
    { id: 'lg-1', timestamp: '2026-06-01 10:30', description: 'চাল ও ডাল ক্রয় (মেমো: INV-01)', type: 'sale', amount: 8200, balanceAfter: 8200 },
    { id: 'lg-2', timestamp: '2026-06-05 15:00', description: 'নগদ বকেয়া আদায়', type: 'collect', amount: 3000, balanceAfter: 5200 },
  ],
  'cust-2': [
    { id: 'lg-3', timestamp: '2026-05-12 11:20', description: 'মোটরসাইকেল পার্টস পাইকারি ক্রয় (মেমো: INV-08)', type: 'sale', amount: 15000, balanceAfter: 15000 },
    { id: 'lg-4', timestamp: '2026-05-20 18:10', description: 'বকেয়া আদায়', type: 'collect', amount: 3000, balanceAfter: 12000 },
  ],
  'cust-3': [
    { id: 'lg-5', timestamp: '2026-06-10 12:40', description: 'শাড়ি ও জামা ক্রয় (মেমো: INV-12)', type: 'sale', amount: 5000, balanceAfter: 5000 },
    { id: 'lg-6', timestamp: '2026-06-10 12:45', description: 'নগদ পরিশোধ (পরিপূর্ন)', type: 'collect', amount: 5000, balanceAfter: 0 },
  ],
  'cust-4': [
    { id: 'lg-7', timestamp: '2026-06-12 10:15', description: 'খাদ্য সামগ্রী ক্রয় (মেমো: INV-15)', type: 'sale', amount: 2200, balanceAfter: 2200 },
    { id: 'lg-8', timestamp: '2026-06-14 17:30', description: 'বকেয়া আদায়', type: 'collect', amount: 1000, balanceAfter: 1200 },
  ],
};

/**
 * Hook to retrieve filtered/searched list of customers
 */
export function useCustomersQuery(search = '', filterTab: 'all' | 'dues' | 'paid' = 'all') {
  return useQuery({
    queryKey: ['customers', 'list', search, filterTab],
    queryFn: async (): Promise<Customer[]> => {
      try {
        return await apiClient.get<Customer[]>(`/customers?search=${search}&filter=${filterTab}`);
      } catch (error) {
        console.warn('[Customers API] Using mockup fallbacks.', error);
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        let list = [...MOCK_CUSTOMERS];
        
        if (search) {
          const s = search.toLowerCase();
          list = list.filter((c) => c.name.toLowerCase().includes(s) || c.phone.includes(s));
        }
        
        if (filterTab === 'dues') {
          list = list.filter((c) => c.dueAmount > 0);
        } else if (filterTab === 'paid') {
          list = list.filter((c) => c.dueAmount === 0);
        }

        return list;
      }
    },
  });
}

/**
 * Hook to retrieve specific customer profile
 */
export function useCustomerDetailsQuery(customerId: string | null) {
  return useQuery({
    queryKey: ['customers', 'details', customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<Customer> => {
      try {
        return await apiClient.get<Customer>(`/customers/${customerId}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const found = MOCK_CUSTOMERS.find((c) => c.id === customerId);
        if (!found) throw new Error('Customer not found');
        return found;
      }
    },
  });
}

/**
 * Hook to retrieve specific customer's due ledger transaction history
 */
export function useCustomerLedgerQuery(customerId: string | null) {
  return useQuery({
    queryKey: ['customers', 'ledger', customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<CustomerLedgerItem[]> => {
      try {
        return await apiClient.get<CustomerLedgerItem[]>(`/customers/${customerId}/ledger`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return MOCK_LEDGERS[customerId || ''] || [];
      }
    },
  });
}

/**
 * Hook to create a customer registry
 */
export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomerInput) => {
      try {
        return await apiClient.post<Customer>('/customers', data);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: data.name,
          phone: data.phone,
          address: data.address,
          dueAmount: data.initialDue || 0,
          notes: data.notes,
          createdAt: new Date().toISOString().split('T')[0],
        };
        MOCK_CUSTOMERS.unshift(newCust);
        
        // Add initial ledger entry if dues exist
        if (newCust.dueAmount > 0) {
          MOCK_LEDGERS[newCust.id] = [
            {
              id: `lg-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              description: 'প্রারম্ভিক বকেয়া (Initial Due)',
              type: 'sale',
              amount: newCust.dueAmount,
              balanceAfter: newCust.dueAmount,
            }
          ];
        }
        return newCust;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Hook to edit customer parameters
 */
export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; input: CustomerInput }) => {
      try {
        return await apiClient.put<Customer>(`/customers/${data.id}`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        MOCK_CUSTOMERS = MOCK_CUSTOMERS.map((c) => {
          if (c.id === data.id) {
            return {
              ...c,
              name: data.input.name,
              phone: data.input.phone,
              address: data.input.address,
              notes: data.input.notes,
            };
          }
          return c;
        });
        return MOCK_CUSTOMERS.find((c) => c.id === data.id)!;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'details', variables.id] });
    },
  });
}

/**
 * Hook to delete customer registry
 */
export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await apiClient.delete<{ success: boolean }>(`/customers/${id}`);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter((c) => c.id !== id);
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Hook to write new due ledger transactions (collections/payments)
 */
export function useAddLedgerEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { customerId: string; input: LedgerEntryInput }) => {
      try {
        return await apiClient.post<CustomerLedgerItem>(`/customers/${data.customerId}/ledger`, data.input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const customer = MOCK_CUSTOMERS.find((c) => c.id === data.customerId);
        if (!customer) throw new Error('Customer not found');

        const adjustVal = data.input.type === 'collect' ? -data.input.amount : data.input.amount;
        const previousDue = customer.dueAmount;
        const nextDue = Math.max(0, previousDue + adjustVal);

        customer.dueAmount = nextDue;

        const newEntry: CustomerLedgerItem = {
          id: `lg-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          description: data.input.description,
          type: data.input.type === 'collect' ? 'collect' : 'give',
          amount: data.input.amount,
          balanceAfter: nextDue,
        };

        if (!MOCK_LEDGERS[data.customerId]) {
          MOCK_LEDGERS[data.customerId] = [];
        }
        MOCK_LEDGERS[data.customerId].unshift(newEntry);

        return newEntry;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'details', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'ledger', variables.customerId] });
    },
  });
}
