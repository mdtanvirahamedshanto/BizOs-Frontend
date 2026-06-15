'use client';

import React from 'react';
import { Activity, Server, Network, Layers, RefreshCw } from 'lucide-react';
import { useAdminMonitoringQuery } from '../api/admin-api';

export function MonitoringManager() {
  const { data: status, isLoading, refetch } = useAdminMonitoringQuery();

  const renderGauge = (value: number, label: string, colorClass: string, trackColor: string) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 shadow-lg hover:shadow-indigo-500/5 transition-all">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        
        <div className="relative h-28 w-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`stroke-current ${trackColor}`}
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`stroke-current ${colorClass} transition-all duration-1000`}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Centered Value */}
          <div className="absolute font-mono text-xl font-black text-white">
            {value}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">সার্ভার ও সিস্টেম মনিটরিং (System Status)</h2>
          <p className="text-xs text-slate-500 mt-1">রিয়েল-টাইম এপিআই রেসপন্স লেটেন্সি, মেমোরি এলোকেশন এবং সকেট চ্যানেল ট্র্যাকিং</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> তথ্য রিফ্রেশ করুন
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* CPU Gauge */}
            {renderGauge(
              status?.cpuUsage || 0,
              'সিপিইউ ব্যবহার (CPU Usage)',
              (status?.cpuUsage || 0) > 80 ? 'text-rose-500' : (status?.cpuUsage || 0) > 50 ? 'text-amber-500' : 'text-indigo-500',
              'text-slate-800'
            )}

            {/* Memory Gauge */}
            {renderGauge(
              status?.memoryUsage || 0,
              'মেমোরি এলোকেশন (RAM Allocation)',
              (status?.memoryUsage || 0) > 85 ? 'text-rose-500' : 'text-emerald-500',
              'text-slate-800'
            )}

            {/* API Response Latency Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/5 transition-all text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">এপিআই লেটেন্সি (API Response)</span>
                <Server className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <div className="space-y-1 py-4">
                <h3 className="text-2xl font-black text-white font-mono">{status?.apiLatency} ms</h3>
                <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  সার্ভার রেসপন্স স্বাভাবিক (Healthy)
                </p>
              </div>
            </div>

            {/* Active Sockets Connections Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/5 transition-all text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">সকেট চ্যানেল (Websockets)</span>
                <Network className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <div className="space-y-1 py-4">
                <h3 className="text-2xl font-black text-white font-mono">{status?.websocketConnections}</h3>
                <p className="text-[9px] text-slate-400 font-bold">Active Live Channels</p>
              </div>
            </div>
          </div>

          {/* Job Queues Alert Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">ব্যাকগ্রাউন্ড টাস্ক কিউ (Background Worker Queue)</h4>
                <p className="text-[10px] text-slate-400">পেমেন্ট রিভাইন্ড, নোটিফিকেশন ডেলিভারি এবং ব্যাকআপ প্রসেসিং কিউ</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-mono">
              <span className="text-xs text-slate-400 font-bold">অবশিষ্ট টাস্ক:</span>
              <span className="text-base font-black text-indigo-600">{(status?.backgroundJobsCount || 0)} টি</span>
            </div>
          </div>

          {/* Real-time Indicator Footer */}
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 font-semibold animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>প্রতি ৩ সেকেন্ড পর পর সার্ভার হতে রিয়েল-টাইম তথ্য আপডেট হচ্ছে</span>
          </div>
        </div>
      )}
    </div>
  );
}
