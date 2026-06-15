'use client';

import React, { useState } from 'react';
import { SummaryKhata } from '@/features/ledger/components/summary-khata';
import { CustomerKhata } from '@/features/ledger/components/customer-khata';
import { SupplierKhata } from '@/features/ledger/components/supplier-khata';

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'customer' | 'supplier'>('summary');

  const getSubTitle = () => {
    switch (activeTab) {
      case 'customer':
        return 'গ্রাহকদের বকেয়া খাতা ও পেমেন্ট আদায়ের তথ্য';
      case 'supplier':
        return 'মহাজন / সরবরাহকারীদের পাওনা ও পরিশোধের হিসাব খাতা';
      default:
        return 'বকেয়া পাওনা ও পরিশোধযোগ্য মহাজন দেনা খাতার সার্বিক বিশ্লেষণ';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs switcher header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
            ডিজিটাল লেনদেন খাতা (Khata)
          </h1>
          <p className="text-xs font-semibold text-slate-500 leading-none">
            {getSubTitle()}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-center shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            সারসংক্ষেপ (Summary)
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            গ্রাহক খাতা (Customer)
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'supplier'
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            মহাজন খাতা (Supplier)
          </button>
        </div>
      </div>

      {/* Render Component based on Tab selection */}
      <div className="h-full">
        {activeTab === 'summary' && <SummaryKhata />}
        {activeTab === 'customer' && <CustomerKhata />}
        {activeTab === 'supplier' && <SupplierKhata />}
      </div>
    </div>
  );
}
