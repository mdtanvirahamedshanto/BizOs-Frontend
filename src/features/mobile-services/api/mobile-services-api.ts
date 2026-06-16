import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mfs, flexiload } from '@/lib/api';
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

// ─── Auto-seeding Helpers ───────────────────────────────────────────────────

async function ensureMfsAccounts() {
  const accounts = await mfs.listMfsAccounts();
  const providers: Array<'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY'> = ['BKASH', 'NAGAD', 'ROCKET', 'UPAY'];
  const results = [...accounts];
  for (const provider of providers) {
    if (!accounts.some((a) => a.provider === provider)) {
      const newAcc = await mfs.createMfsAccount({
        provider,
        accountNumber:
          provider === 'BKASH'
            ? '01711223344'
            : provider === 'NAGAD'
            ? '01819876543'
            : provider === 'ROCKET'
            ? '01511223355'
            : '01911223366',
        accountType: 'AGENT',
        balanceCents: 5000000, // starting float 50,000 taka
        isActive: true,
      });
      results.push(newAcc);
    }
  }
  return results;
}

async function ensureFlexiloadAccounts() {
  const accounts = await flexiload.listFlexiloadAccounts();
  const operators: Array<'GP' | 'ROBI' | 'AIRTEL' | 'BL' | 'TELETALK'> = [
    'GP',
    'ROBI',
    'AIRTEL',
    'BL',
    'TELETALK',
  ];
  const results = [...accounts];
  for (const operator of operators) {
    if (!accounts.some((a) => a.operator === operator)) {
      const newAcc = await flexiload.createFlexiloadAccount({
        operator,
        accountNumber:
          operator === 'GP'
            ? '01712345678'
            : operator === 'ROBI'
            ? '01812345678'
            : operator === 'AIRTEL'
            ? '01612345678'
            : operator === 'BL'
            ? '01912345678'
            : '01512345678',
        balanceCents: 5000000, // starting float 50,000 taka
        isActive: true,
      });
      results.push(newAcc);
    }
  }
  return results;
}

function mapOperatorToBackend(op: string): 'GP' | 'ROBI' | 'AIRTEL' | 'BL' | 'TELETALK' {
  if (op === 'banglalink') return 'BL';
  return op.toUpperCase() as any;
}

function mapOperatorToFrontend(op: string): 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk' {
  if (op === 'BL') return 'banglalink';
  return op.toLowerCase() as any;
}

function mapBackendMfsToFrontend(tx: any): MfsTransaction {
  return {
    id: tx.id,
    provider: (tx.mfsAccount?.provider || 'bkash').toLowerCase() as any,
    type: tx.type.toLowerCase() as any,
    mobileNumber: tx.customerPhone,
    amount: tx.amountCents / 100,
    fee: tx.feeCents / 100,
    commission: tx.commissionCents / 100,
    transactionId: tx.txid || '',
    notes: tx.notes || '',
    timestamp: new Date(tx.createdAt).toISOString().replace('T', ' ').substring(0, 16),
    status: (tx.status || 'SUCCESS').toLowerCase() as any,
  };
}

function mapBackendFlexiloadToFrontend(tx: any): FlexiloadTransaction {
  return {
    id: tx.id,
    operator: mapOperatorToFrontend(tx.account?.operator || 'GP'),
    connectionType: (tx.connectionType || 'PREPAID').toLowerCase() as any,
    mobileNumber: tx.recipientPhone,
    amount: tx.amountCents / 100,
    commission: tx.commissionCents / 100,
    transactionId: tx.id,
    notes: '',
    timestamp: new Date(tx.createdAt).toISOString().replace('T', ' ').substring(0, 16),
    status: (tx.status || 'SUCCESS').toLowerCase() as any,
  };
}

// ─── API Hooks ──────────────────────────────────────────────────────────────

export function useMFSTransactionsQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'mfs-transactions'],
    queryFn: async (): Promise<MfsTransaction[]> => {
      await ensureMfsAccounts();
      const res = await mfs.listMfsTransactions({ limit: 100 });
      return res.data.map(mapBackendMfsToFrontend);
    },
  });
}

export function useFlexiloadTransactionsQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'flexiload-transactions'],
    queryFn: async (): Promise<FlexiloadTransaction[]> => {
      await ensureFlexiloadAccounts();
      const res = await flexiload.listFlexiloadRecharges({ limit: 100 });
      return res.data.map(mapBackendFlexiloadToFrontend);
    },
  });
}

export function useMobileServicesSummaryQuery() {
  return useQuery({
    queryKey: ['mobile-services', 'summary'],
    queryFn: async (): Promise<MobileServicesSummary> => {
      const mfsAccounts = await ensureMfsAccounts();
      const flexiAccounts = await ensureFlexiloadAccounts();

      const mfsTxs = await mfs.listMfsTransactions({ limit: 1000 });
      const flexiTxs = await flexiload.listFlexiloadRecharges({ limit: 1000 });

      const bkashBalance = (mfsAccounts.find((a) => a.provider === 'BKASH')?.balanceCents || 0) / 100;
      const nagadBalance = (mfsAccounts.find((a) => a.provider === 'NAGAD')?.balanceCents || 0) / 100;
      const rocketBalance = (mfsAccounts.find((a) => a.provider === 'ROCKET')?.balanceCents || 0) / 100;
      const upayBalance = (mfsAccounts.find((a) => a.provider === 'UPAY')?.balanceCents || 0) / 100;

      const mfsCommission = mfsTxs.data.reduce((sum, tx) => sum + (tx.commissionCents || 0), 0);
      const flexiCommission = flexiTxs.data.reduce((sum, tx) => sum + (tx.commissionCents || 0), 0);

      return {
        bkashBalance,
        nagadBalance,
        rocketBalance,
        upayBalance,
        totalCommissions: (mfsCommission + flexiCommission) / 100,
        totalMFSTransactionsCount: mfsTxs.data.length,
        totalFlexiloadRechargesCount: flexiTxs.data.length,
      };
    },
  });
}

export function useRecordMFSTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MfsTransactionInput): Promise<MfsTransaction> => {
      const accounts = await ensureMfsAccounts();
      const providerUpper = input.provider.toUpperCase();
      const account = accounts.find((a) => a.provider === providerUpper);
      if (!account) {
        throw new Error(`MFS account for ${input.provider} not found`);
      }

      const res = await mfs.createMfsTransaction({
        mfsAccountId: account.id,
        type: input.type.toUpperCase() as any,
        customerPhone: input.mobileNumber,
        amountCents: Math.round(input.amount * 100),
        feeCents: Math.round(input.fee * 100),
        commissionCents: Math.round(input.commission * 100),
        txid: input.transactionId || undefined,
        status: 'COMPLETED',
        notes: input.notes || undefined,
      });

      return mapBackendMfsToFrontend(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-services'] });
    },
  });
}

export function useRecordFlexiloadTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FlexiloadTransactionInput): Promise<FlexiloadTransaction> => {
      const accounts = await ensureFlexiloadAccounts();
      const operatorBackend = mapOperatorToBackend(input.operator);
      const account = accounts.find((a) => a.operator === operatorBackend);
      if (!account) {
        throw new Error(`Flexiload account for ${input.operator} not found`);
      }

      const commissionRate = 0.028;
      const commissionCents = Math.round(input.amount * commissionRate * 100);

      const res = await flexiload.createFlexiloadRecharge({
        accountId: account.id,
        recipientPhone: input.mobileNumber,
        amountCents: Math.round(input.amount * 100),
        commissionCents,
        status: 'COMPLETED',
        connectionType: input.connectionType.toUpperCase() as any,
      });

      return mapBackendFlexiloadToFrontend(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-services'] });
    },
  });
}
