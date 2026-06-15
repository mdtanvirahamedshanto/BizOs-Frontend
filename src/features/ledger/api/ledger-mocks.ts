import type { Supplier, SupplierLedgerItem } from './suppliers-api';

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'supp-1', name: 'মোঃ খোরশেদ আলম (Alom)', phone: '01811223344', companyName: 'আলম হোলসেল ডিস্ট্রিবিউটর', address: 'কারওয়ান বাজার, ঢাকা', dueAmount: 15400, dueCents: 1540000, notes: 'প্রধান চাল ও ডাল সরবরাহকারী', createdAt: '2026-02-10' },
  { id: 'supp-2', name: 'কামরুল হাসান (Kamrul)', phone: '01922334455', companyName: 'হাসান ট্রেডার্স', address: 'চকবাজার, ঢাকা', dueAmount: 8000, dueCents: 800000, notes: 'সয়াবিন তেল ও মশলা সরবরাহকারী', createdAt: '2026-03-15' },
  { id: 'supp-3', name: 'নুরজাহান বেগম (Nurjahan)', phone: '01733445566', companyName: 'নুর ট্রেড ইন্টারন্যাশনাল', address: 'যাত্রাবাড়ী, ঢাকা', dueAmount: 0, dueCents: 0, notes: 'প্যাকেজিং সামগ্রী সরবরাহকারী', createdAt: '2026-04-01' },
];

export const MOCK_SUPPLIER_LEDGERS: Record<string, SupplierLedgerItem[]> = {
  'supp-1': [
    { id: 'slg-1', timestamp: '2026-06-01 11:30', description: 'মিনিকেট চাল ৫০ বস্তা ক্রয়', type: 'purchase', amount: 75000, balanceAfter: 75000 },
    { id: 'slg-2', timestamp: '2026-06-05 14:00', description: 'ব্যাংক ট্রান্সফার পেমেন্ট', type: 'settlement', amount: 59600, balanceAfter: 15400 },
  ],
  'supp-2': [
    { id: 'slg-3', timestamp: '2026-05-18 10:00', description: 'তীর তেল ২০ কার্টন ক্রয়', type: 'purchase', amount: 18000, balanceAfter: 18000 },
    { id: 'slg-4', timestamp: '2026-05-25 16:30', description: 'নগদ ক্যাশ পেমেন্ট', type: 'settlement', amount: 10000, balanceAfter: 8000 },
  ],
  'supp-3': [
    { id: 'slg-5', timestamp: '2026-06-10 09:30', description: 'প্যাকেজিং ব্যাগ ক্রয়', type: 'purchase', amount: 5000, balanceAfter: 5000 },
    { id: 'slg-6', timestamp: '2026-06-12 15:45', description: 'বিকাশ পেমেন্ট', type: 'settlement', amount: 5000, balanceAfter: 0 },
  ],
};
