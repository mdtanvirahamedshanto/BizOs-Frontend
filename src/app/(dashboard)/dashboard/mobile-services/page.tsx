'use client';

import React, { useState } from 'react';
import { ServicesSummary } from '@/features/mobile-services/components/services-summary';
import { MfsLedger } from '@/features/mobile-services/components/mfs-ledger';
import { FlexiloadLedger } from '@/features/mobile-services/components/flexiload-ledger';
import { PermissionGuard } from '@/components/auth/auth-provider';

export default function MobileServicesPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'mfs' | 'flexiload'>('summary');

  const getSubTitle = () => {
    switch (activeTab) {
      case 'mfs':
        return 'বিকাশ, নগদ, রকেট এবং ইউপে এজেন্ট ক্যাশ ইন-আউট রেজিস্টার';
      case 'flexiload':
        return 'মোবাইল রিচার্জ (ফ্লেক্সিলোড / ইজিলোড) ও এজেন্ট লাভ কমিশন';
      default:
        return 'বিকাশ, নগদ এজেন্ট ওয়ালেট ব্যালেন্স ও অপারেটর রিচার্জ কমিশন সারসংক্ষেপ';
    }
  };

  return (
    <PermissionGuard permission="mfs:read">
      <div className="space-y-6">
        {/* Title & Tabs switcher header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              মোবাইল সার্ভিস (MFS & Recharge)
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-none font-sans">
              {getSubTitle()}
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-primary text-white'
                  : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              সারসংক্ষেপ (Summary)
            </button>
            <button
              onClick={() => setActiveTab('mfs')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mfs'
                  ? 'bg-primary text-white'
                  : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              মোবাইল ব্যাংকিং (MFS)
            </button>
            <button
              onClick={() => setActiveTab('flexiload')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'flexiload'
                  ? 'bg-primary text-white'
                  : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              ফ্লেক্সিলোড (Flexiload)
            </button>
          </div>
        </div>

        {/* Render selected tabs views */}
        <div className="h-full">
          {activeTab === 'summary' && <ServicesSummary />}
          {activeTab === 'mfs' && <MfsLedger />}
          {activeTab === 'flexiload' && <FlexiloadLedger />}
        </div>
      </div>
    </PermissionGuard>
  );
}
