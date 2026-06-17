'use client';

import React, { useState } from 'react';
import { PosCatalog } from '@/features/pos/components/pos-catalog';
import { PosCart } from '@/features/pos/components/pos-cart';
import { PosCheckout } from '@/features/pos/components/pos-checkout';
import { PosReceipt } from '@/features/pos/components/pos-receipt';
import { CheckoutResult } from '@/features/pos/api/pos-api';
import { PosReturns } from '@/features/pos/components/pos-returns';
import { PosMobileCart } from '@/features/pos/components/pos-mobile-cart';

export default function PosPage() {
  const [activeReceipt, setActiveReceipt] = useState<CheckoutResult | null>(null);
  const [activeTab, setActiveTab] = useState<'checkout' | 'returns'>('checkout');

  if (activeReceipt) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <PosReceipt 
          receipt={activeReceipt} 
          onReset={() => setActiveReceipt(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Tabs switcher header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
            পয়েন্ট অব সেলস (POS)
          </h1>
          <p className="text-xs font-semibold text-slate-500 leading-none">
            {activeTab === 'checkout' 
              ? 'দ্রুত কাউন্টার বিক্রয় ও ক্যাশ মেমো চালান সম্পন্ন করুন' 
              : 'বিক্রয় চালান অনুসন্ধান করুন এবং ফেরত বা বাতিল প্রসেস করুন'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-center shrink-0">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            নতুন বিক্রি (New Sale)
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'returns'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            বিক্রয় ফেরত ও ভয়েড (Returns)
          </button>
        </div>
      </div>

      {activeTab === 'checkout' ? (
        /* Grid split checkout layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Product catalogue (full width on mobile) */}
          <div className="lg:col-span-7 xl:col-span-8 h-full">
            <PosCatalog />
          </div>

          {/* Right Side: cart & checkout — desktop/tablet only */}
          <div className="hidden lg:col-span-5 xl:col-span-4 lg:flex flex-col gap-6 h-full">
            <PosCart />
            <PosCheckout onCheckoutSuccess={(receipt) => setActiveReceipt(receipt)} />
          </div>

          {/* Mobile: floating cart bar + checkout sheet */}
          <PosMobileCart onCheckoutSuccess={(receipt) => setActiveReceipt(receipt)} />
        </div>
      ) : (
        <PosReturns />
      )}
    </div>
  );
}
