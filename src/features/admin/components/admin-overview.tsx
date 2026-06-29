'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  ArrowRight, 
  MessageSquare, 
  Settings, 
  CreditCard 
} from 'lucide-react';
import { useAdminOverviewQuery, useAdminTicketsQuery } from '../api/admin-api';
import { AdminView } from './admin-sidebar';

interface AdminOverviewProps {
  onNavigate: (view: AdminView) => void;
}

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const { data: overview, isLoading: isOverviewLoading } = useAdminOverviewQuery();
  const { data: tickets, isLoading: isTicketsLoading } = useAdminTicketsQuery('all');

  const activeTicketsCount = tickets?.filter((t) => t.status !== 'resolved').length || 0;
  const recentTickets = tickets?.slice(0, 3) || [];

  // SVG Area Chart Calculations
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 30;

  const chartData = overview?.revenueChartData || [];
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map((d) => d.revenue), 1000) : 1000;

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / Math.max(chartData.length - 1, 1);
  const getY = (val: number) => chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxRevenue;

  const pointsData = React.useMemo(() => {
    if (chartData.length === 0) return { points: '', areaPoints: '' };
    const pts = chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');
    const aPts = `${padding},${chartHeight - padding} ${pts} ${getX(chartData.length - 1)},${chartHeight - padding}`;
    return { points: pts, areaPoints: aPts };
  }, [chartData, maxRevenue, chartWidth, chartHeight]);

  const { points, areaPoints } = pointsData;

  if (isOverviewLoading || isTicketsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">লোডিং হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">সুপার এডমিন ওভারভিউ (Super Admin Dashboard)</h2>
        <p className="text-xs text-slate-500 mt-1">BizOS SaaS প্ল্যাটফর্মের সার্বিক পারফরম্যান্স, সাবস্ক্রিপশন এবং ইউজার ট্র্যাকিং</p>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm space-y-2 border border-indigo-700/50 hover:shadow-indigo-500/10 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-indigo-100">মাসিক সাবস্ক্রিপশন আয় (MRR)</span>
            <DollarSign className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black">${(overview?.mrr || 0).toLocaleString()}</h3>
            <p className="text-[10px] font-bold text-indigo-200">Monthly Recurring Revenue</p>
          </div>
        </div>

        {/* ARR Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600">বাৎসরিক সাবস্ক্রিপশন আয় (ARR)</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800">${(overview?.arr || 0).toLocaleString()}</h3>
            <p className="text-[10px] font-bold text-slate-500">Annual Recurring Revenue</p>
          </div>
        </div>

        {/* Paid Subscriptions Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600">পেইড সাবস্ক্রিপশন মার্চেন্ট</span>
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800">{overview?.activePaidSubscriptions}</h3>
            <p className="text-[10px] font-bold text-slate-500">Active Paid Subscriptions</p>
          </div>
        </div>

        {/* Growth Rate Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600">মার্চেন্ট প্রবৃদ্ধি হার</span>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800">+{(overview?.merchantGrowthRate || 0).toFixed(1)}%</h3>
            <p className="text-[10px] font-bold text-slate-500">Monthly Registration Growth</p>
          </div>
        </div>
      </div>

      {/* Charts & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-800">সাবস্ক্রিপশন রেভিনিউ প্রবৃদ্ধি (Monthly Revenue Trend)</h4>
              <p className="text-[10px] text-slate-400">Trend of MRR over current calendar year</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">2026</span>
          </div>

          <div className="relative w-full overflow-visible">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible"
              role="img"
              aria-label="সাবস্ক্রিপশন রেভিনিউ প্রবৃদ্ধি (Monthly Revenue Trend Chart)"
            >
              <title>সাবস্ক্রিপশন রেভিনিউ প্রবৃদ্ধি (Monthly Revenue Trend)</title>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, idx) => {
                const yVal = getY((maxRevenue / 3) * idx);
                return (
                  <g key={idx}>
                    <line
                      x1={padding}
                      y1={yVal}
                      x2={chartWidth - padding}
                      y2={yVal}
                      stroke="#f1f5f9"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 6}
                      y={yVal + 3}
                      textAnchor="end"
                      className="fill-slate-400 font-sans font-semibold text-[8px]"
                    >
                      ${Math.round((maxRevenue / 3) * idx)}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              {chartData.length > 0 && (
                <>
                  <polygon points={areaPoints} fill="url(#mrrGrad)" />
                  <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                </>
              )}

              {/* Data Dots & Labels */}
              {chartData.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getY(d.revenue)}
                    r="4"
                    className="fill-white stroke-indigo-600 stroke-[2] hover:r-5 cursor-pointer transition-all"
                  />
                  <text
                    x={getX(i)}
                    y={getY(d.revenue) - 8}
                    textAnchor="middle"
                    className="fill-slate-700 font-bold text-[8px]"
                  >
                    ${d.revenue}
                  </text>
                  <text
                    x={getX(i)}
                    y={chartHeight - padding + 15}
                    textAnchor="middle"
                    className="fill-slate-400 font-bold text-[8px]"
                  >
                    {d.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">প্যানেল কুইক অ্যাকশন (Quick Actions)</h4>
            <p className="text-[10px] text-slate-400">সিস্টেম ম্যানেজমেন্টের প্রয়োজনীয় সেকশনে দ্রুত নেভিগেশন</p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <button
              onClick={() => onNavigate('tenants')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50 hover:bg-indigo-50/30 text-center transition-all group"
            >
              <Users className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">মার্চেন্ট তালিকা</span>
              <span className="text-[8px] text-slate-400">Tenants</span>
            </button>

            <button
              onClick={() => onNavigate('tickets')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50 hover:bg-indigo-50/30 text-center transition-all group"
            >
              <div className="relative">
                <MessageSquare className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
                {activeTicketsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-700">সাপোর্ট ডেস্ক</span>
              <span className="text-[8px] text-slate-400">Tickets ({activeTicketsCount})</span>
            </button>

            <button
              onClick={() => onNavigate('system')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50 hover:bg-indigo-50/30 text-center transition-all group"
            >
              <Activity className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">সিস্টেম স্ট্যাটাস</span>
              <span className="text-[8px] text-slate-400">System Status</span>
            </button>

            <button
              onClick={() => onNavigate('flags')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-100 bg-slate-50 hover:bg-indigo-50/30 text-center transition-all group"
            >
              <Settings className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">ফিচার ফ্ল্যাগ</span>
              <span className="text-[8px] text-slate-400">Feature Flags</span>
            </button>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold text-indigo-950">সব প্ল্যান সেটিংস</p>
              <p className="text-[9px] text-indigo-500">Adjust subscriptions prices</p>
            </div>
            <button 
              onClick={() => onNavigate('subscriptions')}
              className="p-1.5 rounded-full bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Logs & Summaries */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">চলতি সাপোর্ট টিকিট (Active Support Desk Queue)</h4>
            <p className="text-[10px] text-slate-400">মার্চেন্টদের সমাধান না হওয়া সাম্প্রতিক জিজ্ঞাসাসমূহ</p>
          </div>
          <button
            onClick={() => onNavigate('tickets')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            টিকিট ডেস্কে যান <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">কোনো ওপেন টিকিট পাওয়া যায়নি।</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTickets.map((t) => (
              <div 
                key={t.id} 
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 group cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                onClick={() => onNavigate('tickets')}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{t.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      t.priority === 'high' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : t.priority === 'medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {t.priority === 'high' ? 'উচ্চ' : t.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">{t.tenantName}</span>
                    <span>•</span>
                    <span>{t.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    t.status === 'open' 
                      ? 'bg-rose-50 text-rose-600' 
                      : t.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {t.status === 'open' ? 'নতুন টিকিট' : t.status === 'in_progress' ? 'চলমান' : 'সমাধানকৃত'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 group-hover:text-indigo-600">
                    উত্তর দিন <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
