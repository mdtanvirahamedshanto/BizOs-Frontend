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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">গ্রাহক বকেয়া (Receivables)</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans">{formatTaka(totalCustomerDues)}</h4>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {customers?.filter((c) => c.dueAmount > 0).length || 0} জন গ্রাহকের বাকি
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মহাজন পাওনা (Payables)</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans">{formatTaka(totalSupplierDues)}</h4>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {suppliers?.filter((s) => s.dueAmount > 0).length || 0} জন সরবরাহকারীর পাওনা
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নীট হিসাব (Net Khata Balance)</span>
            <h4 className={`text-2xl font-black font-sans ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatTaka(Math.abs(netBalance))}
            </h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              netBalance >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {netBalance >= 0 ? 'উদ্বৃত্ত পাওনা' : 'উদ্বৃত্ত দেনা'}
            </span>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            <Scale className="h-6 w-6" />
          </div>
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
