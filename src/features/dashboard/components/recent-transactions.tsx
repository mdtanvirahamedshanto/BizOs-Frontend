import React from 'react';
import { RecentTransaction } from '../api/dashboard-api';
import { formatTaka } from './kpi-cards';

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">সাম্প্রতিক কার্যক্রম</h3>
        <p className="text-[10px] text-slate-400 font-medium">Recent Ledger Transactions & Cashflow</p>
      </div>

      {/* Desktop view table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
              <th className="py-2.5">আইডি / মেমো</th>
              <th className="py-2.5">বিবরণ / গ্রাহক</th>
              <th className="py-2.5">টাইপ</th>
              <th className="py-2.5 text-right">টাকা (৳)</th>
              <th className="py-2.5 text-center">স্ট্যাটাস</th>
              <th className="py-2.5 text-right">সময়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 font-mono font-bold text-slate-500">{tx.invoiceNo}</td>
                <td className="py-3 font-semibold">{tx.customerName}</td>
                <td className="py-3">
                  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    tx.type === 'sale' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : tx.type === 'expense' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {tx.type === 'sale' ? 'বিক্রি' : tx.type === 'expense' ? 'খরচ' : 'বকেয়া আদায়'}
                  </span>
                </td>
                <td className="py-3 text-right font-extrabold text-slate-800">{formatTaka(tx.amount)}</td>
                <td className="py-3 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tx.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : tx.paymentStatus === 'unpaid'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {tx.paymentStatus === 'paid' ? 'পরিশোধিত' : tx.paymentStatus === 'unpaid' ? 'বাকি' : 'আংশিক'}
                  </span>
                </td>
                <td className="py-3 text-right text-slate-400 font-semibold">{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view responsive card stacks */}
      <div className="block sm:hidden space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold">{tx.invoiceNo}</span>
              <span className="text-[10px] text-slate-400 font-medium">{tx.timestamp}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate leading-none mb-1">{tx.customerName}</p>
                <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                  tx.type === 'sale' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {tx.type === 'sale' ? 'বিক্রি' : 'খরচ'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-slate-800 leading-none mb-1">{formatTaka(tx.amount)}</p>
                <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  tx.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {tx.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বাকি'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
