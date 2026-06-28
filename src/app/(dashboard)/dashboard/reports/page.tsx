'use client';

import React, { useState } from 'react';
import { useReportsQuery } from '@/features/reports/api/reports-api';
import { ReportsChart } from '@/features/reports/components/reports-chart';
import { ReportsTables } from '@/features/reports/components/reports-tables';
import { ReportsExport } from '@/features/reports/components/reports-export';
import { SalesHistoryTable } from '@/features/reports/components/sales-history';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { RefreshCw, Loader2 } from 'lucide-react';
import { ReportTimeframe } from '@/features/reports/types';
import { PermissionGuard } from '@/components/auth/auth-provider';

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('weekly');
  const [activeSection, setActiveSection] = useState<'profit' | 'expense' | 'inventory' | 'dues' | 'sales'>('profit');

  const { data, isLoading, error, refetch, isFetching } = useReportsQuery(timeframe);

  const getSlogan = () => {
    switch (timeframe) {
      case 'today': return 'আজকের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
      case 'weekly': return 'গত ৭ দিনের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
      default: return 'চলতি মাসের ব্যবসার লেনদেন ও লভ্যাংশ বিশ্লেষণ';
    }
  };

  const getActiveDataArray = () => {
    if (!data) return [];
    switch (activeSection) {
      case 'profit': return data.profitRows;
      case 'expense': return data.expenseRows;
      case 'inventory': return data.inventoryRows;
      case 'dues': return data.dueRows;
      default: return [];
    }
  };

  // Tab nav buttons config
  const tabs = [
    { key: 'profit',    label: 'লাভ-ক্ষতি (Profit)' },
    { key: 'expense',   label: 'খরচ রিপোর্ট (Expenses)' },
    { key: 'inventory', label: 'স্টক মূল্য (Inventory)' },
    { key: 'dues',      label: 'বকেয়া খাতা (Dues)' },
    { key: 'sales',     label: 'বিক্রয় ইতিহাস (Sales History)' },
  ] as const;

  return (
    <PermissionGuard permission="reports:read">
      <div className="space-y-6">
        {/* Title & Timeframe filter — always visible */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4 print:border-none print:pb-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              ব্যবসায়িক রিপোর্ট ও বিশ্লেষণ (Reports)
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-none print:hidden">
              {getSlogan()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center print:hidden">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              {(['today', 'weekly', 'monthly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tf ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tf === 'today' ? 'আজ' : tf === 'weekly' ? '৭ দিন' : 'চলতি মাস'}
                </button>
              ))}
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

        {/* Tab Switcher — always visible */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  activeSection === tab.key
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeSection !== 'sales' && (
            <ReportsExport
              activeSection={activeSection as 'profit' | 'expense' | 'inventory' | 'dues'}
              data={getActiveDataArray()}
            />
          )}
        </div>

        {/* Sales History — independent of reports API */}
        {activeSection === 'sales' ? (
          <SalesHistoryTable timeframe={timeframe} />
        ) : (
          <>
            {/* Reports metrics & chart — show loading/error only for these */}
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
                  ))}
                </div>
                <div className="h-64 bg-slate-200 rounded-2xl" />
              </div>
            ) : error || !data ? (
              <div className="rounded-2xl border-l-4 border-destructive bg-red-50 p-6 flex flex-col items-center gap-3">
                <h2 className="text-sm font-bold text-destructive">রিপোর্ট লোড করতে ব্যর্থ হয়েছে।</h2>
                <p className="text-xs text-slate-500">বিক্রয় ইতিহাস দেখতে উপরের "বিক্রয় ইতিহাস" ট্যাবে ক্লিক করুন।</p>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white font-bold text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
              </div>
            ) : (
              <>
                {/* Sales metrics grids */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট বিক্রি (Gross Sales)</span>
                    <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">{formatTaka(data.metrics.totalSales)}</h4>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">পণ্য ক্রয়মূল্য (COGS)</span>
                    <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">{formatTaka(data.metrics.costPrice)}</h4>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট খরচ (Expenses)</span>
                    <h4 className="text-xl font-black text-rose-600 font-sans tracking-tight mt-1">{formatTaka(data.metrics.totalExpense)}</h4>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">নীট লাভ (Net Profit)</span>
                    <h4 className={`text-xl font-black font-sans tracking-tight mt-1 ${data.metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatTaka(data.metrics.netProfit)}
                    </h4>
                  </div>
                </div>

                {/* Chart */}
                <div className="print:hidden">
                  <ReportsChart data={data.chartData} />
                </div>

                {/* Table */}
                <div className="print:pt-4">
                  <ReportsTables
                    activeSection={activeSection as 'profit' | 'expense' | 'inventory' | 'dues'}
                    profitRows={data.profitRows}
                    expenseRows={data.expenseRows}
                    inventoryRows={data.inventoryRows}
                    dueRows={data.dueRows}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
