'use client';

import React, { useState } from 'react';
import { useReportsQuery } from '@/features/reports/api/reports-api';
import { ReportsChart } from '@/features/reports/components/reports-chart';
import { ReportsTables } from '@/features/reports/components/reports-tables';
import { ReportsExport } from '@/features/reports/components/reports-export';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { RefreshCw } from 'lucide-react';
import { ReportTimeframe } from '@/features/reports/types';
import { PermissionGuard } from '@/components/auth/auth-provider';

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('weekly');
  const [activeSection, setActiveSection] = useState<'profit' | 'expense' | 'inventory' | 'dues'>('profit');

  const { data, isLoading, error, refetch, isFetching } = useReportsQuery(timeframe);

  const getSlogan = () => {
    switch (timeframe) {
      case 'today':
        return 'আজকের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
      case 'weekly':
        return 'গত ৭ দিনের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
      default:
        return 'চলতি মাসের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
    }
  };

  const getActiveDataArray = () => {
    if (!data) return [];
    switch (activeSection) {
      case 'profit':
        return data.profitRows;
      case 'expense':
        return data.expenseRows;
      case 'inventory':
        return data.inventoryRows;
      case 'dues':
        return data.dueRows;
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded-md" />
          <div className="h-10 w-36 bg-slate-200 rounded-md" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border-l-4 border-destructive bg-red-50 p-6 flex flex-col items-center gap-3">
        <h2 className="text-sm font-bold text-destructive">রিপোর্ট লোড করতে ব্যর্থ হয়েছে।</h2>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white font-bold text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      </div>
    );
  }

  const { metrics } = data;

  return (
    <PermissionGuard permission="reports:read">
      <div className="space-y-6">
        {/* Title & Timeframe filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 print:border-none print:pb-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              ব্যবসায়িক রিপোর্ট ও বিশ্লেষণ (Reports)
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-none print:hidden">
              {getSlogan()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center print:hidden">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setTimeframe('today')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  timeframe === 'today' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                আজ (Today)
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  timeframe === 'weekly' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ৭ দিন (7 Days)
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  timeframe === 'monthly' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                চলতি মাস (Month)
              </button>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sales metrics grids */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          {/* Total Sales */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট বিক্রি (Gross Sales)</span>
            <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
              {formatTaka(metrics.totalSales)}
            </h4>
          </div>

          {/* Cost of Goods Sold */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">পণ্য ক্রয়মূল্য (COGS)</span>
            <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
              {formatTaka(metrics.costPrice)}
            </h4>
          </div>

          {/* Expenses */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট খরচ (Expenses)</span>
            <h4 className="text-xl font-black text-rose-600 font-sans tracking-tight mt-1">
              {formatTaka(metrics.totalExpense)}
            </h4>
          </div>

          {/* Net Profit */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নীট লাভ (Net Profit)</span>
            <h4 className={`text-xl font-black font-sans tracking-tight mt-1 ${
              metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {formatTaka(metrics.netProfit)}
            </h4>
          </div>
        </div>

        {/* SVG Charts display */}
        <div className="print:hidden">
          <ReportsChart data={data.chartData} />
        </div>

        {/* Table Section switcher tabs header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 pt-4 print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Profit Section */}
            <button
              onClick={() => setActiveSection('profit')}
              className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeSection === 'profit'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              লাভ-ক্ষতি (Profit)
            </button>
            
            {/* Expenses Section */}
            <button
              onClick={() => setActiveSection('expense')}
              className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeSection === 'expense'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              খরচ রিপোর্ট (Expenses)
            </button>

            {/* Inventory Section */}
            <button
              onClick={() => setActiveSection('inventory')}
              className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeSection === 'inventory'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              স্টক মূল্য (Inventory Valuation)
            </button>

            {/* Dues Section */}
            <button
              onClick={() => setActiveSection('dues')}
              className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeSection === 'dues'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              বকেয়া খাতা (Dues Ledger)
            </button>
          </div>

          {/* Exports & Print button actions */}
          <ReportsExport activeSection={activeSection} data={getActiveDataArray()} />
        </div>

        {/* Reports Tables Component */}
        <div className="print:pt-4">
          <ReportsTables
            activeSection={activeSection}
            profitRows={data.profitRows}
            expenseRows={data.expenseRows}
            inventoryRows={data.inventoryRows}
            dueRows={data.dueRows}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
