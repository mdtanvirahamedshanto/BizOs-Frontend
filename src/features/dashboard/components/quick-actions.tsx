import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  PlusCircle, 
  UserPlus, 
  FilePlus,
  Truck
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'নতুন বিক্রি (POS)',
      sub: 'New POS Sale',
      href: '/dashboard/pos',
      icon: ShoppingBag,
      color: 'bg-primary text-white hover:bg-primary/90',
    },
    {
      label: 'প্রোডাক্ট যোগ করুন',
      sub: 'Add Stock Item',
      href: '/dashboard/inventory',
      icon: PlusCircle,
      color: 'bg-emerald-600 text-white hover:bg-emerald-700',
    },
    {
      label: 'বাকি আদায়/হিসাব',
      sub: 'Record Due Cash',
      href: '/dashboard/ledger',
      icon: UserPlus,
      color: 'bg-rose-600 text-white hover:bg-rose-700',
    },
    {
      label: 'খরচ এন্ট্রি করুন',
      sub: 'Add Expense',
      href: '/dashboard/expenses',
      icon: FilePlus,
      color: 'bg-amber-600 text-white hover:bg-amber-700',
    },
    {
      label: 'মহাজন / সরবরাহকারী',
      sub: 'Suppliers & Payables',
      href: '/dashboard/ledger',
      icon: Truck,
      color: 'bg-indigo-600 text-white hover:bg-indigo-700',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">সহজ একশন সমূহ</h3>
        <p className="text-[10px] text-slate-400 font-medium">Quick Operational Links</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all active:scale-[0.97] border border-transparent ${act.color}`}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold leading-none mb-1">{act.label}</span>
              <span className="text-[9px] opacity-75 font-normal leading-none">{act.sub}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
