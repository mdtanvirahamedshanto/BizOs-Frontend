'use client';

import React, { useState } from 'react';
import { useCustomersQuery, useCustomerLedgerQuery, useAddLedgerEntryMutation } from '@/features/customers/api/customers-api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentRecordSchema, PaymentRecordInput } from '../types';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, User, CreditCard, Loader2, ArrowDownLeft, Calendar, FileText, Smartphone } from 'lucide-react';

export function CustomerKhata() {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'dues' | 'all'>('dues');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: customers, isLoading: isCustomersLoading } = useCustomersQuery(search, filterTab === 'dues' ? 'dues' : 'all');
  const { data: ledger, isLoading: isLedgerLoading } = useCustomerLedgerQuery(selectedCustomerId ?? '');
  
  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);

  // RHF setup for recording payments
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentRecordInput>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      amount: undefined,
      paymentMode: 'cash',
      notes: '',
      transactionId: '',
      sendSMS: false,
    },
  });

  const { mutate: addPayment, isPending: isAddingPayment } = useAddLedgerEntryMutation();

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setShowPaymentForm(false);
    reset();
  };

  const onSubmitPayment = (data: PaymentRecordInput) => {
    if (!selectedCustomerId) return;
    
    addPayment(
      {
        customerId: selectedCustomerId,
        input: {
          amount: data.amount,
          type: 'collect', // collect represents payments received
          description: `বকেয়া আদায় (${
            data.paymentMode === 'cash' 
              ? 'নগদ ক্যাশ' 
              : data.paymentMode === 'bkash' 
              ? 'বিকাশ' 
              : data.paymentMode === 'nagad' 
              ? 'নগদ' 
              : 'ব্যাংক'
          })${data.transactionId ? ` - আইডি: ${data.transactionId}` : ''}. ${data.notes || ''}`,
        },
      },
      {
        onSuccess: () => {
          setShowPaymentForm(false);
          reset();
          if (data.sendSMS) {
            alert(`[SMS API] বকেয়া আদায়ের এসএমএস সফলভাবে পাঠানো হয়েছে: \n"প্রিয় গ্রাহক, আপনার পরিশোধিত পরিমাণ ৳${data.amount}। নতুন বকেয়া পরিমাণ: ৳${Math.max(0, (selectedCustomer?.dueAmount || 0) - data.amount)}"`);
          }
        },
        onError: (err) => {
          alert(err.message || 'পেমেন্ট জমা করতে সমস্যা হয়েছে।');
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      {/* Left Column: Customer Accounts List */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 h-full">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800">গ্রাহক তালিকা (বকেয়া খাতা)</h3>
          <p className="text-[10px] text-slate-400 font-medium">Search & Track Customer Accounts Receivable</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setFilterTab('dues')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'dues'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            বকেয়া সহ (Dues Only)
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            সব গ্রাহক (All)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="গ্রাহকের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Accounts List scrollable */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
          {isCustomersLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">গ্রাহক তালিকা লোড হচ্ছে...</p>
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              কোনো গ্রাহক পাওয়া যায়নি।
            </div>
          ) : (
            customers.map((cust) => {
              const isSelected = selectedCustomerId === cust.id;
              return (
                <button
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust.id)}
                  className={`w-full p-3 border rounded-xl text-left transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{cust.name}</span>
                    <span className="text-xs font-sans font-extrabold text-slate-800">{formatTaka(cust.dueAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>{cust.phone}</span>
                    {cust.dueAmount > 0 && (
                      <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">বকেয়া আছে</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Customer Details Ledger Timeline & Collection Forms */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 min-h-[400px]">
        {!selectedCustomer ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <User className="h-10 w-10 text-slate-200 mb-2" />
            <p className="text-xs font-bold">কোনো গ্রাহক নির্বাচন করা হয়নি</p>
            <p className="text-[10px] text-slate-400 mt-1">বামদিকের তালিকা থেকে বকেয়া হিসেব দেখতে গ্রাহক নির্বাচন করুন</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header info card */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{selectedCustomer.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{selectedCustomer.phone} • {selectedCustomer.address || 'ঠিকানা নেই'}</p>
              </div>

              <div className="text-right flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">সর্বমোট বকেয়া</span>
                  <span className="text-sm font-black text-rose-600 font-sans">{formatTaka(selectedCustomer.dueAmount)}</span>
                </div>

                {selectedCustomer.dueAmount > 0 && !showPaymentForm && (
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="h-9 px-3.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>টাকা আদায়</span>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Recording Form Overlay */}
            {showPaymentForm && (
              <form onSubmit={handleSubmit(onSubmitPayment)} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>টাকা জমা রেকর্ড করুন</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div className="space-y-1">
                    <label htmlFor="received-amount" className="block text-[10px] font-bold text-slate-700">জমার পরিমাণ (৳)</label>
                    <input
                      id="received-amount"
                      type="number"
                      placeholder="0.00"
                      {...register('amount', { valueAsNumber: true })}
                      className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary font-sans font-extrabold text-slate-700"
                    />
                    {errors.amount && (
                      <p className="text-[9px] text-destructive font-semibold">{errors.amount.message}</p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <label htmlFor="payment-mode" className="block text-[10px] font-bold text-slate-700">পেমেন্ট মোড</label>
                    <select
                      id="payment-mode"
                      {...register('paymentMode')}
                      className="h-9 w-full rounded-lg border bg-white border-slate-200 px-2 text-xs outline-none focus:border-primary font-bold text-slate-600"
                    >
                      <option value="cash">নগদ ক্যাশ (Cash)</option>
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="bank">ব্যাংক (Bank)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Transaction ID */}
                  <div className="space-y-1">
                    <label htmlFor="txn-id" className="block text-[10px] font-bold text-slate-700">লেনদেন আইডি / রেফারেন্স (ঐচ্ছিক)</label>
                    <input
                      id="txn-id"
                      type="text"
                      placeholder="TrxID..."
                      {...register('transactionId')}
                      className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary font-mono text-slate-650"
                    />
                  </div>

                  {/* SMS Checkbox */}
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      id="sms-check"
                      type="checkbox"
                      {...register('sendSMS')}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="sms-check" className="text-[10px] font-bold text-slate-600 flex items-center gap-1 cursor-pointer">
                      <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                      <span>গ্রাহককে এসএমএস পাঠান</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label htmlFor="payment-notes" className="block text-[10px] font-bold text-slate-700">মন্তব্য / নোট (ঐচ্ছিক)</label>
                  <input
                    id="payment-notes"
                    type="text"
                    placeholder="নোট বা বিবরণ লিখুন..."
                    {...register('notes')}
                    className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingPayment}
                  className="h-10 w-full bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  {isAddingPayment ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>জমা করুন (Record Collection)</span>
                  )}
                </button>
              </form>
            )}

            {/* Ledger transaction history list */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>লেনদেন ইতিহাস (Ledger History)</span>
              </h5>

              {isLedgerLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">লোডিং...</p>
                </div>
              ) : !ledger || ledger.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-[10px] italic">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</p>
              ) : (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                  {ledger.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50/20 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                            item.type === 'collect'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {item.type === 'collect' ? 'জমা আদায়' : 'বকেয়া বিক্রি'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" />
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-700 truncate">{item.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`font-sans font-black text-[13px] ${
                          item.type === 'collect' ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {item.type === 'collect' ? '-' : '+'} {formatTaka(item.amount)}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold font-sans">ব্যালেন্স: {formatTaka(item.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
