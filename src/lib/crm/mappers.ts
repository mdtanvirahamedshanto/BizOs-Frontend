import type {
  Customer as ApiCustomer,
  CustomerAddress,
  KhataEntry,
  Supplier as ApiSupplier,
  SupplierLedgerEntry,
  PaymentMethod,
} from '@/lib/api';
import { centsToTaka } from './money';

export function formatAddress(address?: CustomerAddress | string | null): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.street, address.area, address.city, address.district]
    .filter(Boolean)
    .join(', ');
}

export function parseAddressString(address?: string): CustomerAddress | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return { street: trimmed };
}

export interface CustomerView {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dueAmount: number;
  dueCents: number;
  notes?: string;
  createdAt: string;
  khataAccountId?: string;
}

export function toCustomerView(
  customer: ApiCustomer,
  balanceCents = 0,
  khataAccountId?: string,
): CustomerView {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone ?? '',
    email: customer.email,
    address: formatAddress(customer.address),
    dueAmount: centsToTaka(balanceCents > 0 ? balanceCents : 0),
    dueCents: balanceCents,
    notes: customer.notes,
    createdAt: customer.createdAt,
    khataAccountId,
  };
}

export interface CustomerLedgerItemView {
  id: string;
  timestamp: string;
  description: string;
  type: 'sale' | 'collect' | 'give';
  amount: number;
  balanceAfter: number;
}

export function khataEntryToLedgerItem(entry: KhataEntry): CustomerLedgerItemView {
  let type: CustomerLedgerItemView['type'] = 'give';
  if (entry.type === 'COLLECTION' || entry.type === 'CREDIT') {
    type = 'collect';
  } else if (entry.type === 'DEBIT') {
    type = 'sale';
  }

  return {
    id: entry.id,
    timestamp: entry.createdAt,
    description: entry.description ?? entry.notes ?? 'লেনদেন',
    type,
    amount: centsToTaka(entry.amountCents),
    balanceAfter: centsToTaka(entry.balanceAfterCents),
  };
}

export interface SupplierView {
  id: string;
  name: string;
  phone: string;
  companyName: string;
  email?: string;
  address?: string;
  notes?: string;
  dueAmount: number;
  dueCents: number;
  createdAt: string;
  khataAccountId?: string;
}

export function toSupplierView(
  supplier: ApiSupplier,
  payableCents = 0,
  khataAccountId?: string,
): SupplierView {
  const dueCents = payableCents > 0
    ? payableCents
    : supplier.totalDueCents > 0
      ? supplier.totalDueCents
      : Math.abs(Math.min(supplier.totalDueCents ?? 0, 0));

  return {
    id: supplier.id,
    name: supplier.name,
    phone: supplier.phone ?? '',
    companyName: supplier.companyName ?? supplier.name,
    email: supplier.email,
    address: typeof supplier.address === 'string'
      ? supplier.address
      : formatAddress(supplier.address as CustomerAddress | null | undefined),
    notes: supplier.notes,
    dueAmount: centsToTaka(dueCents),
    dueCents,
    createdAt: supplier.createdAt,
    khataAccountId,
  };
}

export interface SupplierLedgerItemView {
  id: string;
  timestamp: string;
  description: string;
  type: 'purchase' | 'settlement';
  amount: number;
  balanceAfter: number;
}

export function supplierLedgerToView(entry: SupplierLedgerEntry): SupplierLedgerItemView {
  const isPayment =
    entry.type === 'PAYMENT' || entry.type === 'REPAYMENT' || entry.type === 'CREDIT';
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    description: entry.description,
    type: isPayment ? 'settlement' : 'purchase',
    amount: centsToTaka(entry.amountCents),
    balanceAfter: centsToTaka(Math.abs(entry.balanceCents)),
  };
}

export function khataEntryToSupplierLedger(entry: KhataEntry): SupplierLedgerItemView {
  const isRepayment = entry.type === 'REPAYMENT' || entry.type === 'CREDIT';
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    description: entry.description ?? entry.notes ?? 'লেনদেন',
    type: isRepayment ? 'settlement' : 'purchase',
    amount: centsToTaka(entry.amountCents),
    balanceAfter: centsToTaka(Math.abs(entry.balanceAfterCents)),
  };
}

const UI_PAYMENT_TO_API: Record<string, PaymentMethod> = {
  cash: 'CASH',
  bkash: 'BKASH',
  nagad: 'NAGAD',
  bank: 'BANK',
  rocket: 'ROCKET',
  card: 'CARD',
};

export function toPaymentMethod(mode: string): PaymentMethod {
  return UI_PAYMENT_TO_API[mode.toLowerCase()] ?? 'CASH';
}
