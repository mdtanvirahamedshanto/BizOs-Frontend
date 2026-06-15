'use client';

import React from 'react';
import { useMobileServicesSummaryQuery } from '../api/mobile-services-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Smartphone, Wallet, DollarSign, HelpCircle, PhoneCall, Copy, CheckCircle } from 'lucide-react';

export function ServicesSummary() {
  const { data: summary, isLoading } = useMobileServicesSummaryQuery();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`ইউএসএসডি কোডটি কপি করা হয়েছে: ${code}`);
  };

  if (isLoading || !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Bangladesh USSD shortcuts data list
  const USSD_SHORTCUTS = [
    { provider: 'বিকাশ এজেন্ট (bKash Agent)', code: '*247#' },
    { provider: 'নগদ এজেন্ট (Nagad Agent)', code: '*167#' },
    { provider: 'রকেট এজেন্ট (Rocket Agent)', code: '*322#' },
    { provider: 'উপায় এজেন্ট (Upay Agent)', code: '*268#' },
    { provider: 'জিপি ফ্লেক্সিলোড (GP Recharge)', code: '*222*' },
    { provider: 'রবি ফ্লেক্সিলোড (Robi Recharge)', code: '*999#' },
    { provider: 'বাংলালিংক রিচার্জ (BL Recharge)', code: '*121#' },
    { provider: 'টেলিটক রিচার্জ (Teletalk)', code: '*121#' },
  ];

  return (
    <div className="space-y-6">
      {/* Balances Display Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* bKash Wallet Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
          <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider block">বিকাশ এজেন্ট ব্যালেন্স</span>
          <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
            {formatTaka(summary.bkashBalance)}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">bKash Float Wallet</span>
        </div>

        {/* Nagad Wallet Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-orange-300 transition-all">
          <span className="text-[10px] text-orange-650 font-bold uppercase tracking-wider block">নগদ এজেন্ট ব্যালেন্স</span>
          <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
            {formatTaka(summary.nagadBalance)}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">Nagad Float Wallet</span>
        </div>

        {/* Rocket Wallet Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">রকেট এজেন্ট ব্যালেন্স</span>
          <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
            {formatTaka(summary.rocketBalance)}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">Rocket Float Wallet</span>
        </div>

        {/* Upay Wallet Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">ইউপে এজেন্ট ব্যালেন্স</span>
          <h4 className="text-xl font-black text-slate-800 font-sans tracking-tight mt-1">
            {formatTaka(summary.upayBalance)}
          </h4>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">Upay Float Wallet</span>
        </div>
      </div>

      {/* Aggregate Commission Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total commissions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">সর্বমোট কমিশন আয়</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-1">
              {formatTaka(summary.totalCommissions)}
            </h4>
            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
              Net Service Commission Profit
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total MFS Counter transactions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট এমএফএস লেনদেন</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-1">
              {summary.totalMFSTransactionsCount} টি
            </h4>
            <span className="text-[9px] text-slate-450 font-semibold mt-1 block">Cash In / Cash Out Bookings</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Total Flexiload recharges */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মোট মোবাইল রিচার্জ</span>
            <h4 className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-1">
              {summary.totalFlexiloadRechargesCount} বার
            </h4>
            <span className="text-[9px] text-slate-450 font-semibold mt-1 block">Flexiload / Easyload logs</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Smartphone className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* USSD Codes Reference Guidelines */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-slate-450" />
            <span>ইউএসএসডি কোড রেফারেন্স গাইড (USSD Codes Reference)</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Quick code shortcuts for fast agent dialings</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {USSD_SHORTCUTS.map((item, idx) => (
            <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between gap-2 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-slate-400 font-bold block mb-1">{item.provider}</p>
                <p className="font-mono font-black text-slate-800 text-sm tracking-wide">{item.code}</p>
              </div>
              
              <button
                onClick={() => handleCopyCode(item.code)}
                className="h-7 border border-slate-200 hover:border-slate-350 bg-white rounded text-[9px] font-bold text-slate-600 flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>কোড কপি</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
