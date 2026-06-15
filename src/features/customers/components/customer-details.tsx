'use client';

import React, { useState } from 'react';
import { 
  useCustomerDetailsQuery, 
  useCustomerLedgerQuery, 
  useDeleteCustomerMutation 
} from '../api/customers-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { LedgerEntryForm } from './ledger-entry-form';
import { CustomerForm } from './customer-form';
import { 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard, 
  Edit, 
  Trash2, 
  ArrowDownLeft, 
  Plus, 
  Loader2,
  Calendar
} from 'lucide-react';

interface CustomerDetailsProps {
  customerId: string;
  onClose: () => void;
  onEditSuccess?: () => void;
}

export function CustomerDetails({ customerId, onClose, onEditSuccess }: CustomerDetailsProps) {
  const { data: customer, isLoading: isDetailsLoading, error: detailsError } = useCustomerDetailsQuery(customerId);
  const { data: ledger, isLoading: isLedgerLoading } = useCustomerLedgerQuery(customerId);
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomerMutation();

  const [activeTab, setActiveTab] = useState<'ledger' | 'notes'>('ledger');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = () => {
    if (confirm('আপনি কি নিশ্চিত যে এই গ্রাহকের অ্যাকাউন্টটি ডিলিট করতে চান?')) {
      deleteCustomer(customerId, {
        onSuccess: () => {
          alert('গ্রাহকের অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।');
          onClose();
        },
      });
    }
  };

  if (isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl h-96 shadow-sm">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-medium">গ্রাহকের প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (detailsError || !customer) {
    return (
      <div className="bg-red-50 border-l-4 border-destructive p-4 rounded-xl text-xs font-semibold text-destructive">
        গ্রাহকের তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Edit Form Modal View overlay */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <CustomerForm
              customer={customer}
              onSuccess={() => {
                setShowEditForm(false);
                if (onEditSuccess) onEditSuccess();
              }}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* Payment Entry Form Modal overlay */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <LedgerEntryForm
              customerId={customer.id}
              onSuccess={() => {
                setShowPaymentForm(false);
              }}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 leading-tight mb-1">{customer.name}</h2>
          <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
            <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer.phone}</span>
            </a>
            {customer.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{customer.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowEditForm(true)}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Edit details"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 border border-red-200 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete customer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Due Amount Highlight Card */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 leading-none mb-1">বকেয়া পরিমাণ</p>
          <p className="text-xs text-slate-400 font-medium leading-none">Total Unpaid Due</p>
          <h3 className="text-xl font-black text-red-600 mt-2 font-sans tracking-tight">
            {formatTaka(customer.dueAmount)}
          </h3>
        </div>

        {/* Ledger quick adjustment button */}
        <button
          onClick={() => setShowPaymentForm(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>টাকা আদায়</span>
        </button>
      </div>

      {/* Tabs Menu navigation */}
      <div>
        <div className="flex border-b border-slate-100 p-0.5 bg-slate-50 rounded-lg mb-3">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'ledger'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            লেনদেন বিবরণী (Ledger)
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            কাস্টমার নোট
          </button>
        </div>

        {/* Tabs Content */}
        {activeTab === 'ledger' ? (
          <div className="space-y-3">
            {isLedgerLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : !ledger || ledger.length === 0 ? (
              <p className="text-xs text-center text-slate-400 font-semibold py-6">
                এখনো কোনো লেনদেন রেকর্ড করা হয়নি।
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5">
                {ledger.map((item) => {
                  const isCollect = item.type === 'collect';
                  const isSale = item.type === 'sale';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border flex items-start justify-between text-xs ${
                        isCollect 
                          ? 'bg-emerald-50/20 border-emerald-100' 
                          : isSale 
                          ? 'bg-red-50/20 border-red-100'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            isCollect 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isSale 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isCollect ? 'টাকা আদায়' : isSale ? 'বাকি' : 'সমন্বয়'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold leading-none flex items-center gap-0.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {item.timestamp.substring(0, 16)}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-700 leading-tight">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`font-extrabold ${isCollect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isCollect ? '-' : '+'}{formatTaka(item.amount)}
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold">
                          ব্যালেন্স: {formatTaka(item.balanceAfter)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
            <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>নোটের ইতিহাস</span>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {customer.notes || 'এই গ্রাহকের কোনো বিবরণ বা অতিরিক্ত নোট সংরক্ষণ করা হয়নি।'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Close Actions */}
      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          onClick={onClose}
          className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
}
