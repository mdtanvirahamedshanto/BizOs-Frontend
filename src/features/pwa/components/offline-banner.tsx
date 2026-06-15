'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { usePwaStore } from '../stores/use-pwa-store';

export function OfflineBanner() {
  const { online, outboxCount } = usePwaStore();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [prevOutboxCount, setPrevOutboxCount] = useState(0);

  // Monitor when outbox clears to display successful sync chimes
  useEffect(() => {
    if (online) {
      if (prevOutboxCount > 0 && outboxCount === 0) {
        setShowSyncSuccess(true);
        const timer = setTimeout(() => setShowSyncSuccess(false), 4000);
        return () => clearTimeout(timer);
      }
    }
    setPrevOutboxCount(outboxCount);
  }, [outboxCount, online, prevOutboxCount]);

  if (!online) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-rose-600 border border-rose-500 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-bounce">
        <WifiOff className="h-6 w-6 text-rose-100 shrink-0" />
        <div className="text-left leading-tight">
          <h4 className="text-xs font-black">অফলাইন মোড (Offline Mode)</h4>
          <p className="text-[10px] text-rose-100 font-semibold mt-0.5">ইন্টারনেট কানেকশন নেই। কেনাবেচা লোকাল ডাটাবেজে সেভ হচ্ছে।</p>
        </div>
      </div>
    );
  }

  if (outboxCount > 0) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-indigo-600 border border-indigo-500 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-pulse">
        <RefreshCw className="h-6 w-6 text-indigo-100 shrink-0 animate-spin" />
        <div className="text-left leading-tight">
          <h4 className="text-xs font-black">ক্লাউড ডাটা সিঙ্ক (Auto Syncing)</h4>
          <p className="text-[10px] text-indigo-100 font-semibold mt-0.5">
            {outboxCount} টি অফলাইন লেনদেন সার্ভারে আপলোড করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (showSyncSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-emerald-600 border border-emerald-500 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-fade-in">
        <CheckCircle2 className="h-6 w-6 text-emerald-100 shrink-0" />
        <div className="text-left leading-tight">
          <h4 className="text-xs font-black">সিঙ্ক সম্পন্ন হয়েছে (Sync Success)</h4>
          <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">অফলাইনের সকল হিসেব সার্ভারে সেভ করা হয়েছে।</p>
        </div>
      </div>
    );
  }

  return null;
}
