'use client';

import React, { useState } from 'react';
import { PurchaseList, PurchaseDetail } from '@/features/purchases/components/purchase-list';
import { Truck } from 'lucide-react';

export default function PurchasesPage() {
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
          ক্রয় ব্যবস্থাপনা
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          সরবরাহকারী থেকে পণ্য ক্রয়, স্টক গ্রহণ ও পেমেন্ট ট্র্যাকিং
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <PurchaseList
            onSelectPurchase={setSelectedPurchaseId}
            selectedPurchaseId={selectedPurchaseId}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          {selectedPurchaseId ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <PurchaseDetail
                purchaseId={selectedPurchaseId}
                onClose={() => setSelectedPurchaseId(null)}
              />
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Truck className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-600 mb-1 text-xs">ক্রয় অর্ডার বিস্তারিত</p>
              <p className="text-slate-400 text-[10px] max-w-[220px] font-medium">
                বাম পাশের তালিকা থেকে একটি ক্রয় অর্ডার নির্বাচন করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
