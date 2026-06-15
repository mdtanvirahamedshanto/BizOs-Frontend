'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error telemetry
    console.error('[Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-5 shadow-lg">
        <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <div className="space-y-2 text-left sm:text-center">
          <h3 className="text-base font-bold text-slate-800">অপ্রত্যাশিত ত্রুটি ঘটেছে (Unexpected Error)</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            মডিউলটি লোড করতে সাময়িক সমস্যা হচ্ছে। ব্রাউজারের লোকাল স্টোরেজ বা ইন্টারনেট সংযোগ চেক করুন।
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-400 font-mono break-all max-h-[80px] overflow-y-auto">
            {error.message || 'Unknown render exception'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="h-4 w-4" /> পুনরায় চেষ্টা করুন (Try Again)
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="h-4 w-4" /> ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
