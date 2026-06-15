'use client';

import React, { useState } from 'react';
import { CustomerList } from '@/features/customers/components/customer-list';
import { CustomerDetails } from '@/features/customers/components/customer-details';
import { Landmark, ArrowRight, UserCheck } from 'lucide-react';

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
          গ্রাহক ও বাকির খাতা
        </h1>
        <p className="text-xs font-semibold text-slate-500 leading-none">
          গ্রাহকদের ব্যক্তিগত বিবরণী ও বকেয়া হিসেব পরিচালনা করুন
        </p>
      </div>

      {/* Grid split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Search list */}
        <div className={`lg:col-span-7 xl:col-span-8`}>
          <CustomerList
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            selectedCustomerId={selectedCustomerId}
          />
        </div>

        {/* Right Side: details and ledger adjustments */}
        <div className="lg:col-span-5 xl:col-span-4">
          {selectedCustomerId ? (
            <CustomerDetails
              customerId={selectedCustomerId}
              onClose={() => setSelectedCustomerId(null)}
            />
          ) : (
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-center text-xs flex flex-col items-center justify-center min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200/20">
                <UserCheck className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-600 mb-1">গ্রাহক হিসাব নির্বাচন করুন</p>
              <p className="text-slate-400 leading-relaxed max-w-[220px] mx-auto font-medium">
                বাম পাশের তালিকা থেকে যেকোনো কাস্টমারের নামের পাশে চাপ দিলে তাদের লেনদেন ইতিহাস ও বকেয়া এন্ট্রি করা যাবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
