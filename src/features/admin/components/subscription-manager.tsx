'use client';

import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAdminPlansQuery } from '../api/admin-api';

export function SubscriptionManager() {
  const { data: plans, isLoading } = useAdminPlansQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">সাবস্ক্রিপশন প্ল্যান ও বিলিং সেটিংস (Subscription Plans)</h2>
        <p className="text-xs text-slate-500 mt-1">মার্চেন্ট গ্রাহকদের জন্য সাবস্ক্রিপশন প্ল্যানের মূল্য তালিকা, ফিচার লিমিট এবং গ্রাহক বণ্টন</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isPremium = plan.id === 'premium';
            const isBasic = plan.id === 'basic';

            return (
              <div 
                key={plan.id}
                className={`relative bg-white border rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg ${
                  isPremium 
                    ? 'border-indigo-500/80 ring-2 ring-indigo-500/10' 
                    : isBasic
                    ? 'border-emerald-500/40'
                    : 'border-slate-200'
                }`}
              >
                {/* Premium Badge Accent */}
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white font-extrabold text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> রিকমেন্ডেড (Featured)
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Plan Identifier */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className={`h-4.5 w-4.5 ${isPremium ? 'text-indigo-600' : isBasic ? 'text-emerald-500' : 'text-slate-400'}`} />
                      {plan.name}
                    </h3>
                    <p className="text-[10px] text-slate-400">সাবস্ক্রাইবার কাউন্ট: <span className="font-bold text-slate-700">{plan.activeSubscriptionsCount} টি দোকান</span></p>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-500 font-bold">মাসিক পেমেন্ট:</span>
                      <span className="text-sm font-black text-slate-800">৳{plan.priceMonthly.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">/ মাস</span></span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-slate-200/50 pt-2">
                      <span className="text-[10px] text-slate-500 font-bold">বাৎসরিক ছাড় পেমেন্ট:</span>
                      <span className="text-sm font-black text-slate-800">৳{plan.priceYearly.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">/ বছর</span></span>
                    </div>
                  </div>

                  {/* Limits and Restrictions */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[10px] text-slate-500 font-bold">প্ল্যান ক্যাপাসিটি লিমিট (Limits):</p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>সর্বোচ্চ পণ্য সংখ্যা: <span className="font-bold text-slate-800">{plan.maxProductsLimit === 'unlimited' ? 'সীমাহীন' : `${plan.maxProductsLimit} টি`}</span></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>সর্বোচ্চ ট্রানজেকশন লিমিট: <span className="font-bold text-slate-800">{plan.maxTransactionsLimit === 'unlimited' ? 'সীমাহীন' : `${plan.maxTransactionsLimit} টি/মাস`}</span></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>বকেয়া খাতা ও এসএমএস এলার্ট</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>বাংলাদেশি এমএফএস ও মোবাইল সার্ভিস</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Alert for Admins */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>প্ল্যান প্রাইস পরিবর্তন করতে ডেভেলপার ডেটাবেস স্কিমা কনফিগার করুন।</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
