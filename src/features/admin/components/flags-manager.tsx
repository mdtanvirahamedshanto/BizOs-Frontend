'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { useAdminFlagsQuery, useToggleFlagMutation } from '../api/admin-api';

export function FlagsManager() {
  const { data: flags, isLoading } = useAdminFlagsQuery();
  const toggleFlagMutation = useToggleFlagMutation();

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    try {
      await toggleFlagMutation.mutateAsync({ key, enabled: !currentEnabled });
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">প্লাটফর্ম ফিচার ফ্ল্যাগ কন্ট্রোল (Feature Flags)</h2>
        <p className="text-xs text-slate-500 mt-1">মার্চেন্ট প্যানেলে নির্দিষ্ট ফিচারের প্রদর্শন, বিটা টেস্টিং মডিউল এবং কার্যকারিতা সক্রিয় বা নিষ্ক্রিয়করণ</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags?.map((flag) => {
            const isPending = toggleFlagMutation.isPending && toggleFlagMutation.variables?.key === flag.key;
            
            return (
              <div 
                key={flag.key}
                className={`bg-white border rounded-2xl p-5 flex justify-between items-start gap-4 transition-all ${
                  flag.enabled 
                    ? 'border-indigo-100 hover:border-indigo-200' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-[13px]">{flag.label}</span>
                    <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                      {flag.key}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {flag.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${flag.enabled ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                    <span className={`text-[10px] font-bold uppercase ${flag.enabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {flag.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
                    </span>
                  </div>
                </div>

                {/* Styled Toggle Button */}
                <button
                  onClick={() => handleToggle(flag.key, flag.enabled)}
                  disabled={isPending}
                  className="focus:outline-none shrink-0"
                  aria-label={`Toggle feature flag ${flag.label}`}
                >
                  {isPending ? (
                    <Loader2 className="h-9 w-9 text-indigo-500 animate-spin" />
                  ) : flag.enabled ? (
                    <ToggleRight className="h-9 w-9 text-indigo-600 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-300 hover:text-slate-400 cursor-pointer" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Policy Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
        <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-950">ফিচার ফ্ল্যাগ নীতি এলার্ট (Security & Cache Note)</h4>
          <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
            ফিচার ফ্ল্যাগ পরিবর্তন করার পর মার্চেন্ট প্যানেলে পরিবর্তনগুলো সাথে সাথে দৃশ্যমান হবে। রিলিজ করার পূর্বে ফিচারগুলো ডেভেলপমেন্ট বা স্টেজিং মোডে ভালোভাবে পরীক্ষা করা বাঞ্ছনীয়।
          </p>
        </div>
      </div>
    </div>
  );
}
