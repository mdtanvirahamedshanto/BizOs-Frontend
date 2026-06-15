'use client';

import React, { useState, useEffect } from 'react';
import { useMFSTransactionsQuery, useRecordMFSTransactionMutation } from '../api/mobile-services-api';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mfsTransactionSchema, MfsTransactionInput } from '../types';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, Plus, Loader2, ArrowUpRight, ArrowDownLeft, Send, PhoneCall, Wallet, Smartphone, MessageSquare } from 'lucide-react';

export function MfsLedger() {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'bkash' | 'nagad' | 'rocket' | 'upay'>('all');

  const { data: transactions, isLoading } = useMFSTransactionsQuery();
  const { mutate: recordTx, isPending } = useRecordMFSTransactionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<MfsTransactionInput>({
    resolver: zodResolver(mfsTransactionSchema),
    defaultValues: {
      provider: 'bkash',
      type: 'cash_in',
      mobileNumber: '',
      amount: undefined,
      fee: 0,
      commission: 0,
      transactionId: '',
      notes: '',
    },
  });

  // Watch fields to pre-calculate commissions/fees in real-time
  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedType = useWatch({ control, name: 'type' });
  const watchedProvider = useWatch({ control, name: 'provider' });

  useEffect(() => {
    if (!watchedAmount || watchedAmount <= 0) {
      setValue('fee', 0);
      setValue('commission', 0);
      return;
    }

    // Auto-calculates fees and agent commission profit based on Bangladesh standards
    if (watchedType === 'cash_out') {
      // Typically agent charges customer 1.5% to 2% cashout fee manually
      const customerFee = Math.round(watchedAmount * 0.015);
      setValue('fee', customerFee);

      // Typically agent earns 4.28৳ per 1000৳ cash out from operator
      const agentCommission = Math.round(watchedAmount * 0.00428 * 100) / 100;
      setValue('commission', agentCommission);
    } else if (watchedType === 'cash_in') {
      // Cash in is free for customers, agent gets no default commission, but may charge minor handling fee
      setValue('fee', 0);
      setValue('commission', 0);
    } else if (watchedType === 'send_money') {
      // Send money fee is typically 5৳ flat for rocket/upay, bKash has minor fees
      setValue('fee', 5);
      setValue('commission', 0);
    }
  }, [watchedAmount, watchedType, watchedProvider, setValue]);

  const onSubmitTransaction = (data: MfsTransactionInput) => {
    recordTx(data, {
      onSuccess: () => {
        reset();
        alert('মোবাইল ব্যাংকিং লেনদেনটি সফলভাবে রেকর্ড করা হয়েছে।');
      },
      onError: (err) => {
        alert(err.message || 'লেনদেন জমা করতে সমস্যা হয়েছে।');
      },
    });
  };

  // Filter logs
  const filteredTxs = transactions?.filter((tx) => {
    const s = search.toLowerCase();
    const matchesSearch = 
      tx.mobileNumber.includes(s) || 
      tx.transactionId?.toLowerCase().includes(s) || 
      tx.notes?.toLowerCase().includes(s);
    const matchesProvider = providerFilter === 'all' || tx.provider === providerFilter;
    return matchesSearch && matchesProvider;
  }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      {/* Left Column: MFS Ledger Book list */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 h-full">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800">এমএফএস ক্যাশ বুক (MFS Cash Book)</h3>
          <p className="text-[10px] text-slate-400 font-medium">Chronological Ledger logs of Agent Actions</p>
        </div>

        {/* Filters and search */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'bkash', 'nagad', 'rocket', 'upay'].map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov as any)}
              className={`h-7 px-3.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                providerFilter === prov
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {prov === 'all' ? 'সব (All)' : prov}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="মোবাইল নম্বর বা ট্রানজেকশন আইডি দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Transaction Rows */}
        <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 text-xs">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-slate-400">লেনদেন লোড হচ্ছে...</p>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              কোনো মোবাইল ব্যাংকিং লেনদেন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="p-3.5 bg-slate-50/20 hover:bg-slate-50/50 flex items-center justify-between gap-3 font-medium transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        tx.provider === 'bkash' 
                          ? 'bg-pink-50 text-pink-700 border border-pink-100'
                          : tx.provider === 'nagad'
                          ? 'bg-orange-50 text-orange-700 border border-orange-100'
                          : tx.provider === 'rocket'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {tx.provider}
                      </span>
                      
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        tx.type === 'cash_out' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : tx.type === 'cash_in'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tx.type === 'cash_out' ? 'ক্যাশ আউট' : tx.type === 'cash_in' ? 'ক্যাশ ইন' : 'সেন্ড মানি'}
                      </span>
                      
                      <span className="text-[9px] text-slate-400 font-bold">{tx.timestamp}</span>
                    </div>

                    <p className="font-bold text-slate-700">{tx.mobileNumber}</p>
                    {tx.transactionId && (
                      <p className="text-[9px] font-mono text-slate-400">TrxID: {tx.transactionId}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-sans font-black text-sm text-slate-800">{formatTaka(tx.amount)}</p>
                    {tx.commission > 0 && (
                      <p className="text-[9px] text-emerald-600 font-bold">কমিশন: +{formatTaka(tx.commission)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Add Transaction Record Form */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-primary" />
            <span>নতুন এমএফএস লেনদেন রেকর্ড</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Record Cash Out, In, or Send Money</p>
        </div>

        <form onSubmit={handleSubmit(onSubmitTransaction)} className="space-y-3 text-xs">
          {/* Provider Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-700">মোবাইল ব্যাংকিং সেবা (MFS)</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['bkash', 'nagad', 'rocket', 'upay'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setValue('provider', prov as any)}
                  className={`h-9 rounded-lg border text-[10px] font-bold transition-all uppercase flex items-center justify-center cursor-pointer ${
                    watchedProvider === prov
                      ? prov === 'bkash'
                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                        : prov === 'nagad'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : prov === 'rocket'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-700">লেনদেনের ধরণ</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { type: 'cash_in', label: 'ক্যাশ ইন (In)' },
                { type: 'cash_out', label: 'ক্যাশ আউট (Out)' },
                { type: 'send_money', label: 'সেন্ড মানি (Send)' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setValue('type', opt.type as any)}
                  className={`h-9 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                    watchedType === opt.type
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label htmlFor="customer-mfs-phone" className="block text-[10px] font-bold text-slate-700">গ্রাহক মোবাইল নম্বর *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Smartphone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="customer-mfs-phone"
                type="text"
                placeholder="যেমন: 017XXXXXXXX"
                {...register('mobileNumber')}
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 outline-none focus:border-primary"
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-[9px] text-destructive font-semibold">{errors.mobileNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <label htmlFor="mfs-tx-amount" className="block text-[10px] font-bold text-slate-700">পরিমাণ (৳) *</label>
              <input
                id="mfs-tx-amount"
                type="number"
                placeholder="0"
                {...register('amount', { valueAsNumber: true })}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary font-sans font-extrabold text-slate-700"
              />
              {errors.amount && (
                <p className="text-[9px] text-destructive font-semibold">{errors.amount.message}</p>
              )}
            </div>

            {/* Reference TrxID */}
            <div className="space-y-1">
              <label htmlFor="mfs-tx-id" className="block text-[10px] font-bold text-slate-700">লেনদেন আইডি / TrxID (ঐচ্ছিক)</label>
              <input
                id="mfs-tx-id"
                type="text"
                placeholder="TrxID..."
                {...register('transactionId')}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Profit Details Indicators */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-[10px]">
            {/* Customer handling fee */}
            <div className="space-y-1">
              <label htmlFor="mfs-tx-fee" className="block text-[9px] font-bold text-slate-400 uppercase">গ্রাহক সার্ভিস ফি (৳)</label>
              <input
                id="mfs-tx-fee"
                type="number"
                {...register('fee', { valueAsNumber: true })}
                className="h-7 w-full bg-white border border-slate-200 rounded px-2 outline-none focus:border-primary font-sans"
              />
              {errors.fee && (
                <p className="text-[9px] text-destructive font-semibold">{errors.fee.message}</p>
              )}
            </div>

            {/* Agent commission profit */}
            <div className="space-y-1">
              <label htmlFor="mfs-tx-commission" className="block text-[9px] font-bold text-slate-400 uppercase">এজেন্ট কমিশন লাভ (৳)</label>
              <input
                id="mfs-tx-commission"
                type="number"
                step="0.01"
                {...register('commission', { valueAsNumber: true })}
                className="h-7 w-full bg-white border border-slate-200 rounded px-2 outline-none focus:border-primary font-sans text-emerald-700 font-extrabold"
              />
              {errors.commission && (
                <p className="text-[9px] text-destructive font-semibold">{errors.commission.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="mfs-tx-notes" className="block text-[10px] font-bold text-slate-700">মন্তব্য / বিবরণ (ঐচ্ছিক)</label>
            <input
              id="mfs-tx-notes"
              type="text"
              placeholder="অতিরিক্ত তথ্য..."
              {...register('notes')}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 w-full bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>জমা হচ্ছে...</span>
              </>
            ) : (
              <span>লেনদেন রেকর্ড করুন</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
