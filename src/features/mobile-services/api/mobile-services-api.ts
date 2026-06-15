import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MfsTransactionInput, FlexiloadTransactionInput } from '../types';

export interface MfsTransaction {
  id: string;
  provider: 'bkash' | 'nagad' | 'rocket' | 'upay';
  type: 'cash_in' | 'cash_out' | 'send_money';
  mobileNumber: string;
  amount: number;
  fee: number;
  commission: number;
  transactionId?: string;
  notes?: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface FlexiloadTransaction {
  id: string;
  operator: 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk';
  connectionType: 'prepaid' | 'postpaid';
  mobileNumber: string;
  amount: number;
  commission: number;
  transactionId?: string;
  notes?: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface MobileServicesSummary {
  bkashBalance: number;
  nagadBalance: number;
  rocketBalance: number;
  upayBalance: number;
  totalCommissions: number;
  totalMFSTransactionsCount: number;
  totalFlexiloadRechargesCount: number;
}

// Memory local databases
let MOCK_MFS_TRANSACTIONS: MfsTransaction[] = [
  { id: 'mfs-1', provider: 'bkash', type: 'cash_out', mobileNumber: '01711223344', amount: 5000, fee: 92.5, commission: 21.4, transactionId: 'BKB821038', timestamp: '2026-06-15 10:30', status: 'success' },
  { id: 'mfs-2', provider: 'nagad', type: 'cash_in', mobileNumber: '01819876543', amount: 2000, fee: 0, commission: 0, transactionId: 'NGD910238', timestamp: '2026-06-15 09:15', status: 'success' },
  { id: 'mfs-3', provider: 'rocket', type: 'send_money', mobileNumber: '01511223355', amount: 1500, fee: 5, commission: 0, transactionId: 'RCK810239', timestamp: '2026-06-14 18:45', status: 'success' },
];

let MOCK_FLEXILOAD_TRANSACTIONS: FlexiloadTransaction[] = [
  { id: 'fl-1', operator: 'gp', connectionType: 'prepaid', mobileNumber: '01712345678', amount: 100, commission: 2.8, transactionId: 'FLG82103', timestamp: '2026-06-15 11:00', status: 'success' },
  { id: 'fl-2', operator: 'robi', connectionType: 'prepaid', mobileNumber: '01812345678', amount: 250, commission: 7.0, transactionId: 'FLR91023', timestamp: '2026-06-15 10:15', status: 'success' },
  { id: 'fl-3', operator: 'banglalink', connectionType: 'postpaid', mobileNumber: '01912345678', amount: 500, commission: 14.0, transactionId: 'FLB81023', timestamp: '2026-06-14 15:30', status: 'success' },
];

let MOCK_SUMMARY: MobileServicesSummary = {
  bkashBalance: 25400,
  nagadBalance: 18200,
  rocketBalance: 8500,
  upayBalance: 3200,
  totalCommissions: 285.2,
  totalMFSTransactionsCount: 3,
  totalFlexiloadRechargesCount: 3,
};

/**
 * Hook to retrieve MFS transactions ledger
 */
export function useMFSTransactionsQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'mfs-transactions'],
    queryFn: async (): Promise<MfsTransaction[]> => {
      try {
        return await apiClient.get<MfsTransaction[]>('/mobile-services/mfs');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [...MOCK_MFS_TRANSACTIONS];
      }
    },
  });
}

/**
 * Hook to retrieve Flexiload transactions ledger
 */
export function useFlexiloadTransactionsQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'flexiload-transactions'],
    queryFn: async (): Promise<FlexiloadTransaction[]> => {
      try {
        return await apiClient.get<FlexiloadTransaction[]>('/mobile-services/flexiload');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return [...MOCK_FLEXILOAD_TRANSACTIONS];
      }
    },
  });
}

/**
 * Hook to retrieve Mobile Services dashboard totals
 */
export function useMobileServicesSummaryQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'summary'],
    queryFn: async (): Promise<MobileServicesSummary> => {
      try {
        return await apiClient.get<MobileServicesSummary>('/mobile-services/summary');
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return { ...MOCK_SUMMARY };
      }
    },
  });
}

/**
 * Hook to record MFS transaction
 */
export function useRecordMFSTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MfsTransactionInput): Promise<MfsTransaction> => {
      try {
        return await apiClient.post<MfsTransaction>('/mobile-services/mfs', input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const transactionId = input.transactionId || `TXM${Math.floor(Math.random() * 10000000)}`;

        const newTx: MfsTransaction = {
          id: `mfs-${Date.now()}`,
          provider: input.provider,
          type: input.type,
          mobileNumber: input.mobileNumber,
          amount: input.amount,
          fee: input.fee,
          commission: input.commission,
          transactionId,
          notes: input.notes,
          timestamp,
          status: 'success',
        };

        // Update mock local DB
        MOCK_MFS_TRANSACTIONS.unshift(newTx);
        
        // Adjust agent balances and commission totals
        if (input.provider === 'bkash') {
          MOCK_SUMMARY.bkashBalance += input.type === 'cash_out' ? input.amount : -input.amount;
        } else if (input.provider === 'nagad') {
          MOCK_SUMMARY.nagadBalance += input.type === 'cash_out' ? input.amount : -input.amount;
        } else if (input.provider === 'rocket') {
          MOCK_SUMMARY.rocketBalance += input.type === 'cash_out' ? input.amount : -input.amount;
        } else if (input.provider === 'upay') {
          MOCK_SUMMARY.upayBalance += input.type === 'cash_out' ? input.amount : -input.amount;
        }

        MOCK_SUMMARY.totalCommissions += input.commission;
        MOCK_SUMMARY.totalMFSTransactionsCount += 1;

        return newTx;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-services'] });
    },
  });
}

/**
 * Hook to record Flexiload recharge
 */
export function useRecordFlexiloadTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FlexiloadTransactionInput): Promise<FlexiloadTransaction> => {
      try {
        return await apiClient.post<FlexiloadTransaction>('/mobile-services/flexiload', input);
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const transactionId = `TXF${Math.floor(Math.random() * 1000000)}`;
        
        // standard agent commission rate (typically 2.8% or ৳২৮ per ৳১০০০)
        const commissionRate = 0.028;
        const commission = Math.round(input.amount * commissionRate * 100) / 100;

        const newTx: FlexiloadTransaction = {
          id: `fl-${Date.now()}`,
          operator: input.operator,
          connectionType: input.connectionType,
          mobileNumber: input.mobileNumber,
          amount: input.amount,
          commission,
          transactionId,
          notes: input.notes,
          timestamp,
          status: 'success',
        };

        // Update local mock db
        MOCK_FLEXILOAD_TRANSACTIONS.unshift(newTx);
        
        // Deduct balances (assuming it deducts from default cash/MFS source, for simplicity we just track recharges and commission)
        MOCK_SUMMARY.totalCommissions += commission;
        MOCK_SUMMARY.totalFlexiloadRechargesCount += 1;

        return newTx;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-services'] });
    },
  });
}
