'use client';

import React, { useState } from 'react';
import { useDashboardQuery } from '@/features/dashboard/api/dashboard-api';
import { KpiCards } from '@/features/dashboard/components/kpi-cards';
import { SalesChart } from '@/features/dashboard/components/sales-chart';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import { TopProducts } from '@/features/dashboard/components/top-products';
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions';
import { InsightsFeed } from '@/features/dashboard/components/insights-feed';
import { SalesHistoryTable } from '@/features/reports/components/sales-history';
import { Loader2, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<'today' | 'seven_days' | 'month'>('today');
  const { data, isLoading, error, refetch, isFetching } = useDashboardQuery(timeframe);

  const getSlogans = () => {
    switch (timeframe) {
      case 'seven_days':
        return 'গত ৭ দিনের ব্যবসার হিসাব-নিকাশ';
      case 'month':
        return 'চলতি মাসের ব্যবসার হিসাব-নিকাশ';
      default:
        return 'আজকের দিনের ব্যবসার সামগ্রিক হিসাব';
    }
  };

  // Full-page skeletal loading wrapper
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded-md" />
          <div className="h-10 w-36 bg-slate-200 rounded-md" />
        </div>
        
        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl border border-transparent" />
          ))}
        </div>

        {/* Dashboard split grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-60 bg-slate-200 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-44 bg-slate-200 rounded-2xl" />
            <div className="h-52 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border-l-4 border-destructive bg-red-50 p-6 shadow-sm flex flex-col items-center gap-3">
        <h2 className="text-sm font-bold text-destructive">ড্যাশবোর্ড ডাটা লোড করতে ত্রুটি হয়েছে।</h2>
        <p className="text-xs text-slate-500">অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় রিফ্রেশ করুন।</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white font-bold text-xs hover:bg-destructive/90"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with page title & timeframe filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
            ব্যবসা ড্যাশবোর্ড
          </h1>
          <p className="text-xs font-semibold text-slate-500 leading-none">
            {getSlogans()}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeframe === 'today'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              আজ (Today)
            </button>
            <button
              onClick={() => setTimeframe('seven_days')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeframe === 'seven_days'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ৭ দিন (7 Days)
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeframe === 'month'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              চলতি মাস (Month)
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:bg-slate-50 shrink-0"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Widget */}
      <KpiCards metrics={data.metrics} timeframe={timeframe} />

      {/* Dashboard split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side elements: Charts & Ledger activity */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SalesChart data={data.chartData} />
          
          <RecentTransactions transactions={data.recentTransactions} />

          {/* Sales History — filtered by selected timeframe */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800">বিক্রয় ইতিহাস (Sales History)</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">কোন বিক্রয়তে কে কে পণ্য কিনেছে তার বিস্তারিত</p>
            </div>
            <SalesHistoryTable
              timeframe={
                timeframe === 'today' ? 'today' :
                timeframe === 'seven_days' ? 'weekly' :
                'monthly'
              }
            />
          </div>
        </div>

        {/* Right Side elements: Shortcuts, Top Products, Tips */}
        <div className="flex flex-col gap-6">
          <QuickActions />

          <InsightsFeed insights={data.insights} />

          <TopProducts products={data.topProducts} />
        </div>
      </div>
    </div>
  );
}
