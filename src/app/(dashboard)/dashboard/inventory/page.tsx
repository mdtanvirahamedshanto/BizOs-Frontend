'use client';

import React, { useState } from 'react';
import { ProductList } from '@/features/inventory/components/product-list';
import { InventoryLedger } from '@/features/inventory/components/inventory-ledger';
import { PermissionGuard } from '@/components/auth/auth-provider';
import { History } from 'lucide-react';

export default function InventoryPage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <PermissionGuard permission="inventory:read">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
            প্রোডাক্ট ও ইনভেন্টরি
          </h1>
          <p className="text-xs font-semibold text-slate-500 leading-none">
            ব্যবসা প্রতিষ্ঠানের সামগ্রিক প্রোডাক্ট ক্যাটালগ ও স্টক সমন্বয় পরিচালনা করুন
          </p>
        </div>

        {/* Grid split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Product catalogue */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ProductList
              onSelectProduct={(id) => setSelectedProductId(id)}
              selectedProductId={selectedProductId}
            />
          </div>

          {/* Right Side: details and ledger history */}
          <div className="lg:col-span-5 xl:col-span-4">
            {selectedProductId ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <InventoryLedger productId={selectedProductId} />
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedProductId(null)}
                    className="h-8 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-center text-xs flex flex-col items-center justify-center min-h-[300px]">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200/20">
                  <History className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-600 mb-1">স্টক এন্ট্রি ইতিহাস দেখুন</p>
                <p className="text-slate-400 leading-relaxed max-w-[220px] mx-auto font-medium">
                  বাম পাশের তালিকা থেকে যেকোনো প্রোডাক্টের ডানের "স্টক হিস্ট্রি" আইকনে চাপ দিলে তার বিগত স্টক কেনাবেচা ও নষ্ট মালের খতিয়ান দেখা যাবে।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
