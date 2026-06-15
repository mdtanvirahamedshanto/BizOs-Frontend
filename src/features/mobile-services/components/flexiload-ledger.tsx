'use client';

import React, { useState, useEffect } from 'react';
import { useFlexiloadTransactionsQuery, useRecordFlexiloadTransactionMutation } from '../api/mobile-services-api';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { flexiloadTransactionSchema, FlexiloadTransactionInput } from '../types';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, Plus, Loader2, Smartphone, HelpCircle, CheckCircle } from 'lucide-react';

export function FlexiloadLedger() {
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState<'all' | 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk'>('all');

  const { data: transactions, isLoading } = useFlexiloadTransactionsQuery();
  const { mutate: recordRecharge, isPending } = useRecordFlexiloadTransactionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FlexiloadTransactionInput>({
    resolver: zodResolver(flexiloadTransactionSchema),
    defaultValues: {
      operator: 'gp',
      connectionType: 'prepaid',
      mobileNumber: '',
      amount: undefined,
      notes: '',
    },
  });

  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedOperator = useWatch({ control, name: 'operator' });

  // Standard commission in Bangladesh: typically 2.8% (28 Taka per 1000 Taka)
  const commissionRate = 0.028;
  const calculatedCommission = watchedAmount && watchedAmount > 0 
    ? Math.round(watchedAmount * commissionRate * 100) / 100 
    : 0;

  const onSubmitRecharge = (data: FlexiloadTransactionInput) => {
    recordRecharge(data, {
      onSuccess: () => {
        reset();
        alert('মোবাইল রিচার্জটি সফলভাবে রেকর্ড করা হয়েছে।');
      },
      onError: (err) => {
        alert(err.message || 'রিচার্জ রেকর্ড করতে সমস্যা হয়েছে।');
      },
    });
  };

  // Filter logs
  const filteredTxs = transactions?.filter((tx) => {
    const s = search.toLowerCase();
    const matchesSearch = tx.mobileNumber.includes(s) || tx.notes?.toLowerCase().includes(s);
    const matchesOperator = operatorFilter === 'all' || tx.operator === operatorFilter;
    return matchesSearch && matchesOperator;
  }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full text-xs">
      {/* Left Column: Flexiload history list */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 h-full">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800">রিচার্জ বুক (Flexiload Ledger)</h3>
          <p className="text-[10px] text-slate-400 font-medium">Recharge Actions & Commissions Timeline</p>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'gp', 'robi', 'banglalink', 'airtel', 'teletalk'].map((op) => (
            <button
              key={op}
              onClick={() => setOperatorFilter(op as any)}
              className={`h-7 px-3.5 rounded-full text-[10px] font-bold border transition-all uppercase cursor-pointer ${
                operatorFilter === op
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              {op === 'all' ? 'সব (All)' : op}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="মোবাইল নম্বর বা বিবরণ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* History Table */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-slate-400">রিচার্জ ইতিহাস লোড হচ্ছে...</p>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="text-center py-12 text-slate-450 font-bold">
              কোনো মোবাইল রিচার্জ লেনদেন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden font-medium">
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="p-3 bg-slate-50/20 hover:bg-slate-50/50 flex items-center justify-between gap-3 transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        tx.operator === 'gp' 
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : tx.operator === 'robi'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : tx.operator === 'banglalink'
                          ? 'bg-orange-50 text-orange-700 border border-orange-100'
                          : tx.operator === 'airtel'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {tx.operator === 'gp' ? 'GP' : tx.operator}
                      </span>

                      <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                        {tx.connectionType === 'prepaid' ? 'প্রিপেইড' : 'পোস্টপেইড'}
                      </span>

                      <span className="text-[9px] text-slate-450 font-bold">{tx.timestamp}</span>
                    </div>

                    <p className="font-bold text-slate-700">{tx.mobileNumber}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-sans font-black text-sm text-slate-800">{formatTaka(tx.amount)}</p>
                    <p className="text-[9px] text-emerald-600 font-bold">কমিশন লাভ: +{formatTaka(tx.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Record Recharge Form */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-primary" />
            <span>নতুন মোবাইল রিচার্জ রেকর্ড</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Record Flexiload or Operator Recharges</p>
        </div>

        <form onSubmit={handleSubmit(onSubmitRecharge)} className="space-y-3 font-semibold">
          {/* Operator Selector */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-700">মোবাইল অপারেটর (Operator)</label>
            <div className="grid grid-cols-5 gap-1">
              {['gp', 'robi', 'banglalink', 'airtel', 'teletalk'].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setValue('operator', op as any)}
                  className={`h-9 rounded-lg border text-[9px] font-bold transition-all uppercase flex items-center justify-center cursor-pointer ${
                    watchedOperator === op
                      ? op === 'gp'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : op === 'robi'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : op === 'banglalink'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : op === 'airtel'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {op === 'gp' ? 'GP' : op}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Type */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-700">কানেকশন টাইপ</label>
            <div className="grid grid-cols-2 gap-2">
              {['prepaid', 'postpaid'].map((conn) => (
                <button
                  key={conn}
                  type="button"
                  onClick={() => setValue('connectionType', conn as any)}
                  className={`h-8 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                    useWatch({ control, name: 'connectionType' }) === conn
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {conn === 'prepaid' ? 'প্রিপেইড (Prepaid)' : 'পোস্টপেইড (Postpaid)'}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label htmlFor="flexiload-phone-input" className="block text-[10px] font-bold text-slate-700">মোবাইল নম্বর *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Smartphone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="flexiload-phone-input"
                type="text"
                placeholder="যেমন: 017XXXXXXXX"
                {...register('mobileNumber')}
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 outline-none focus:border-primary text-xs"
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-[9px] text-destructive font-semibold">{errors.mobileNumber.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label htmlFor="flexiload-amount-input" className="block text-[10px] font-bold text-slate-700">রিচার্জের পরিমাণ (৳) *</label>
            <input
              id="flexiload-amount-input"
              type="number"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs font-sans font-extrabold text-slate-800"
            />
            {errors.amount && (
              <p className="text-[9px] text-destructive font-semibold">{errors.amount.message}</p>
            )}
          </div>

          {/* Commission Earnings indicator preview */}
          {watchedAmount && watchedAmount > 0 && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-800 text-[10px] font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>রিচার্জ লাভ কমিশন (2.8%): + {formatTaka(calculatedCommission)}</span>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="flexiload-notes-input" className="block text-[10px] font-bold text-slate-700">মন্তব্য (ঐচ্ছিক)</label>
            <input
              id="flexiload-notes-input"
              type="text"
              placeholder="প্যাকেজ নাম বা অতিরিক্ত তথ্য..."
              {...register('notes')}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
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
                <span>রিচার্জ হচ্ছে...</span>
              </>
            ) : (
              <span>মোবাইল রিচার্জ করুন</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
