'use client';

import React from 'react';
import { useCustomersQuery } from '@/features/customers/api/customers-api';
import { useSuppliersQuery } from '../api/ledger-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Scale, Users, Truck, Wallet } from 'lucide-react';

export function SummaryKhata() {
  const { data: customers, isLoading: isCustLoading } = useCustomersQuery('', 'all');
  const { data: suppliers, isLoading: isSuppLoading } = useSuppliersQuery('', 'all');

  const totalCustomerDues = customers?.reduce((sum, c) => sum + c.dueAmount, 0) || 0;
  const totalSupplierDues = suppliers?.reduce((sum, s) => sum + s.dueAmount, 0) || 0;
  const netBalance = totalCustomerDues - totalSupplierDues;

  const totalAccounts = (customers?.length || 0) + (suppliers?.length || 0);

  if (isCustLoading || isSuppLoading) {
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
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Dues (Receivables) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">গ্রাহক বকেয়া (Receivables)</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
              {formatTaka(totalCustomerDues)}
            </h4>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {customers?.filter(c => c.dueAmount > 0).length || 0} জন গ্রাহকের বাকি
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Supplier Dues (Payables) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মহাজন পাওনা (Payables)</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
              {formatTaka(totalSupplierDues)}
            </h4>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {suppliers?.filter(s => s.dueAmount > 0).length || 0} জন সরবরাহকারীর পাওনা
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নীট হিসাব (Net Khata Balance)</span>
            <h4 className={`text-2xl font-black font-sans tracking-tight ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {formatTaka(Math.abs(netBalance))}
            </h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              netBalance >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {netBalance >= 0 ? 'উদ্বৃত্ত পাওনা (Net Surplus)' : 'উদ্বৃত্ত দেনা (Net Deficit)'}
            </span>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
            netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            <Scale className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Visual Proportion & Summary Details */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">লেনদেন খাতার অনুপাত বিশ্লেষণ</h3>
          <p className="text-[10px] text-slate-400 font-medium">Visual Debt & Credit Breakdown</p>
        </div>

        {/* Proportion Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-500">
            <span>গ্রাহক বকেয়া ({totalCustomerDues > 0 ? Math.round((totalCustomerDues / (totalCustomerDues + totalSupplierDues || 1)) * 100) : 0}%)</span>
            <span>মহাজন দেনা ({totalSupplierDues > 0 ? Math.round((totalSupplierDues / (totalCustomerDues + totalSupplierDues || 1)) * 100) : 0}%)</span>
          </div>
          
          <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
            {totalCustomerDues === 0 && totalSupplierDues === 0 ? (
              <div className="h-full w-full bg-slate-200" />
            ) : (
              <>
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${(totalCustomerDues / (totalCustomerDues + totalSupplierDues || 1)) * 100}%` }}
                />
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${(totalSupplierDues / (totalCustomerDues + totalSupplierDues || 1)) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Details list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Customer list summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-primary rounded-full" />
              <span>শীর্ষ বকেয়াধারী গ্রাহক (Top Customer Receivables)</span>
            </h4>
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {customers?.filter(c => c.dueAmount > 0).slice(0, 3).map((cust) => (
                <div key={cust.id} className="p-3 bg-slate-50/20 hover:bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">{cust.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{cust.phone}</p>
                  </div>
                  <span className="font-sans font-extrabold text-slate-800">{formatTaka(cust.dueAmount)}</span>
                </div>
              ))}
              {(!customers || customers.filter(c => c.dueAmount > 0).length === 0) && (
                <p className="text-slate-400 p-4 text-center">কোনো কাস্টমার বকেয়া নেই।</p>
              )}
            </div>
          </div>

          {/* Supplier list summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
              <span>শীর্ষ পরিশোধযোগ্য মহাজন (Top Supplier Payables)</span>
            </h4>
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {suppliers?.filter(s => s.dueAmount > 0).slice(0, 3).map((supp) => (
                <div key={supp.id} className="p-3 bg-slate-50/20 hover:bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">{supp.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{supp.companyName}</p>
                  </div>
                  <span className="font-sans font-extrabold text-slate-800">{formatTaka(supp.dueAmount)}</span>
                </div>
              ))}
              {(!suppliers || suppliers.filter(s => s.dueAmount > 0).length === 0) && (
                <p className="text-slate-400 p-4 text-center">কোনো মহাজন দেনা নেই।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
