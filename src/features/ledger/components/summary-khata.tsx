'use client';

import React from 'react';
import { useKhataSummaryQuery } from '../api/khata-api';
import { useCustomersQuery } from '@/features/customers/api/customers-api';
import { useSuppliersQuery } from '../api/suppliers-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Users, Truck, Scale } from 'lucide-react';

export function SummaryKhata() {
  const { data: summary, isLoading: isSummaryLoading } = useKhataSummaryQuery();
  const { data: customers, isLoading: isCustLoading } = useCustomersQuery('', 'all', undefined, 100);
  const { data: suppliers, isLoading: isSuppLoading } = useSuppliersQuery('', 'all', undefined, 100);

  const totalCustomerDues = summary?.totalCustomerDues ?? 0;
  const totalSupplierDues = summary?.totalSupplierDues ?? 0;
  const netBalance = summary?.netBalance ?? 0;

  if (isSummaryLoading || isCustLoading || isSuppLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">গ্রাহক বকেয়া (Receivables)</span>
            <h4 className="text-3xl font-black text-slate-800 font-sans">{formatTaka(totalCustomerDues)}</h4>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100/50 inline-block mt-1">
              {customers?.filter((c) => c.dueAmount > 0).length || 0} জন গ্রাহকের বাকি
            </span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Users className="h-7 w-7" />
          </div>
        </div>

        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মহাজন পাওনা (Payables)</span>
            <h4 className="text-3xl font-black text-slate-800 font-sans">{formatTaka(totalSupplierDues)}</h4>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-100/50 inline-block mt-1">
              {suppliers?.filter((s) => s.dueAmount > 0).length || 0} জন সরবরাহকারীর পাওনা
            </span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Truck className="h-7 w-7" />
          </div>
        </div>

        <div className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নীট হিসাব (Net Khata Balance)</span>
            <h4 className={`text-3xl font-black font-sans ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatTaka(Math.abs(netBalance))}
            </h4>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block mt-1 border ${
              netBalance >= 0 ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50' : 'bg-rose-50/80 text-rose-800 border-rose-200/50'
            }`}>
              {netBalance >= 0 ? 'উদ্বৃত্ত পাওনা' : 'উদ্বৃত্ত দেনা'}
            </span>
          </div>
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 relative z-10 ${
            netBalance >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600' : 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600'
          }`}>
            <Scale className="h-7 w-7" />
          </div>
          {/* Subtle background glow */}
          <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-300 ${
            netBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500 group-hover:opacity-30'
          }`} />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">লেনদেন খাতার অনুপাত বিশ্লেষণ</h3>
          <p className="text-[10px] text-slate-400 font-medium">Data from GET /khata/due-summary</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-500">
            <span>গ্রাহক বকেয়া</span>
            <span>মহাজন দেনা</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
            {totalCustomerDues === 0 && totalSupplierDues === 0 ? (
              <div className="h-full w-full bg-slate-200" />
            ) : (
              <>
                <div className="bg-primary h-full" style={{ width: `${(totalCustomerDues / (totalCustomerDues + totalSupplierDues || 1)) * 100}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${(totalSupplierDues / (totalCustomerDues + totalSupplierDues || 1)) * 100}%` }} />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800">শীর্ষ বকেয়াধারী গ্রাহক</h4>
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
              {customers?.filter((c) => c.dueAmount > 0).slice(0, 3).map((cust) => (
                <div key={cust.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">{cust.name}</p>
                    <p className="text-[10px] text-slate-400">{cust.phone}</p>
                  </div>
                  <span className="font-extrabold">{formatTaka(cust.dueAmount)}</span>
                </div>
              ))}
              {(!customers || customers.filter((c) => c.dueAmount > 0).length === 0) && (
                <p className="text-slate-400 p-4 text-center">কোনো কাস্টমার বকেয়া নেই।</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800">শীর্ষ পরিশোধযোগ্য মহাজন</h4>
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs">
              {suppliers?.filter((s) => s.dueAmount > 0).slice(0, 3).map((supp) => (
                <div key={supp.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">{supp.name}</p>
                    <p className="text-[10px] text-slate-400">{supp.companyName}</p>
                  </div>
                  <span className="font-extrabold">{formatTaka(supp.dueAmount)}</span>
                </div>
              ))}
              {(!suppliers || suppliers.filter((s) => s.dueAmount > 0).length === 0) && (
                <p className="text-slate-400 p-4 text-center">কোনো মহাজন দেনা নেই।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
