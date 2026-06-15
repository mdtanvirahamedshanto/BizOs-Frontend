'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log administrative exception
    console.error('[Admin Panel Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
        <div className="h-12 w-12 bg-indigo-950 text-indigo-400 border border-indigo-800/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="space-y-2 text-left sm:text-center">
          <h3 className="text-base font-bold text-white">অ্যাডমিন প্যানেলে ত্রুটি ঘটেছে (Admin Exception)</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            সার্ভার মডিউল বা রিলেশনাল ক্যাশ ডেটাবেস সিঙ্ক করতে ব্যর্থ হয়েছে।
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 font-mono break-all max-h-[80px] overflow-y-auto">
            {error.message || 'Administrative render error'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40"
          >
            <RotateCcw className="h-4 w-4" /> পুনরায় চেষ্টা করুন (Try Again)
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> মার্চেন্ট প্যানেল
          </Link>
        </div>
      </div>
    </div>
  );
}
