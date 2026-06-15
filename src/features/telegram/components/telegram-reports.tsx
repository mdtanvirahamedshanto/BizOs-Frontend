'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Terminal } from 'lucide-react';
import { useTelegramMetricsQuery } from '../api/telegram-api';

export function TelegramReports() {
  const { data: metrics, isLoading } = useTelegramMetricsQuery();

  // SVG Chart Config
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 30;

  const chartData = metrics?.trafficChart || [];
  const maxVal = chartData.length > 0 
    ? Math.max(...chartData.map((d) => Math.max(d.sent, d.received)), 20) 
    : 20;

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / Math.max(chartData.length - 1, 1);
  const getY = (val: number) => chartHeight - padding - (val * (chartHeight - 2 * padding)) / maxVal;

  const sentPoints = chartData.map((d, i) => `${getX(i)},${getY(d.sent)}`).join(' ');
  const receivedPoints = chartData.map((d, i) => `${getX(i)},${getY(d.received)}`).join(' ');

  const sentArea = chartData.length > 0
    ? `${padding},${chartHeight - padding} ${sentPoints} ${getX(chartData.length - 1)},${chartHeight - padding}`
    : '';
  const receivedArea = chartData.length > 0
    ? `${padding},${chartHeight - padding} ${receivedPoints} ${getX(chartData.length - 1)},${chartHeight - padding}`
    : '';

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      {isLoading ? (
        <div className="flex h-36 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Commands Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">মোট প্রসেসড কম্যান্ড</span>
              <h3 className="text-xl font-bold text-slate-800 font-mono">{metrics?.totalCommandsProcessed} বার</h3>
              <p className="text-[9px] text-slate-400 font-medium">Accumulated triggers count</p>
            </div>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Terminal className="h-5 w-5" />
            </div>
          </div>

          {/* Active Subscribers Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">সক্রিয় চ্যাট সাবস্ক্রাইবার</span>
              <h3 className="text-xl font-bold text-slate-800 font-mono">{metrics?.activeUsersCount} জন</h3>
              <p className="text-[9px] text-slate-400 font-medium">Distinct Telegram user chats</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Messages Ratio Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">মোট এক্সচেঞ্জড ট্রাফিক</span>
              <h3 className="text-xl font-bold text-slate-800 font-mono">
                {chartData.reduce((acc, d) => acc + d.sent + d.received, 0)} টি
              </h3>
              <p className="text-[9px] text-slate-400 font-medium">Inbound + Outbound messages</p>
            </div>
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Charts and Commands Usage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Usage Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-800">বট মেসেজ আদান-প্রদান চিত্র (Traffic Volume History)</h4>
              <p className="text-[9px] text-slate-400">Daily sent vs received traffic</p>
            </div>
            <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">গত ৭ দিন</span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <div className="relative w-full overflow-visible">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {Array.from({ length: 4 }).map((_, idx) => {
                  const yVal = getY((maxVal / 3) * idx);
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
                        {Math.round((maxVal / 3) * idx)}
                      </text>
                    </g>
                  );
                })}

                {/* Area fills */}
                {chartData.length > 0 && (
                  <>
                    <polygon points={sentArea} fill="url(#sentGrad)" />
                    <polygon points={receivedArea} fill="url(#recvGrad)" />
                  </>
                )}

                {/* Lines */}
                {chartData.length > 0 && (
                  <>
                    <polyline points={sentPoints} fill="none" stroke="#4f46e5" strokeWidth="2" />
                    <polyline points={receivedPoints} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
                  </>
                )}

                {/* Label Points */}
                {chartData.map((d, i) => (
                  <g key={i}>
                    <circle cx={getX(i)} cy={getY(d.sent)} r="3" className="fill-white stroke-indigo-600 stroke-[1.5]" />
                    <circle cx={getX(i)} cy={getY(d.received)} r="3" className="fill-white stroke-rose-500 stroke-[1.5]" />
                    <text
                      x={getX(i)}
                      y={chartHeight - padding + 15}
                      textAnchor="middle"
                      className="fill-slate-400 font-bold text-[8px]"
                    >
                      {d.date}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Legend indicators */}
              <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 justify-center mt-4 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                  <span>প্রেরিত বার্তা (Sent)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  <span>গৃহীত বার্তা (Received)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Most Used Commands Ranking */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800">জনপ্রিয় কম্যান্ড র‍্যাঙ্কিং (Top Triggers)</h4>
            <p className="text-[9px] text-slate-400">Most requested command metrics</p>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3 flex-1 py-1">
              {metrics?.commandsUsage.map((item, idx) => (
                <div key={item.command} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{item.command}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {item.count} বার কল
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] text-slate-400 font-semibold leading-relaxed flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>গত ২৪ ঘণ্টায় বট ট্রাফিক ৫% প্রবৃদ্ধি অর্জন করেছে।</span>
          </div>
        </div>
      </div>
    </div>
  );
}
