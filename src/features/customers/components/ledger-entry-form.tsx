'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark, ArrowDownLeft, FileText, Loader2 } from 'lucide-react';
import { ledgerEntrySchema, LedgerEntryInput } from '../types';
import { useAddLedgerEntryMutation } from '../api/customers-api';

interface LedgerEntryFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LedgerEntryForm({ customerId, onSuccess, onCancel }: LedgerEntryFormProps) {
  const { mutate: addLedgerEntry, isPending } = useAddLedgerEntryMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LedgerEntryInput>({
    resolver: zodResolver(ledgerEntrySchema),
    defaultValues: {
      amount: undefined,
      type: 'collect',
      description: 'বকেয়া আদায় (Due Collection)',
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: LedgerEntryInput) => {
    addLedgerEntry(
      { customerId, input: data },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="border-b border-slate-100 pb-2 mb-3">
        <h3 className="text-sm font-bold text-slate-800">লেনদেন এন্ট্রি করুন (বাকির খাতা)</h3>
        <p className="text-[10px] text-slate-400 font-medium">Record Due Collection & Cash Adjustments</p>
      </div>

      {/* Transaction Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">লেনদেনের ধরন</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'collect');
              setValue('description', 'বকেয়া আদায় (Due Collection)');
            }}
            className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              selectedType === 'collect'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>টাকা আদায় (Collection)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'give');
              setValue('description', 'বকেয়া প্রদান/বাকি (New Credit/Due)');
            }}
            className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              selectedType === 'give'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 rotate-180" />
            <span>বকেয়া প্রদান (Add Due)</span>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="ledger-amount" className="block text-xs font-semibold text-slate-700 mb-1">
          টাকার পরিমাণ (৳) <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Landmark className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="ledger-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
            className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
              errors.amount
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.amount && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.amount.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="ledger-desc" className="block text-xs font-semibold text-slate-700 mb-1">
          বিবরণ / কারণ <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="ledger-desc"
            type="text"
            placeholder="যেমন: বকেয়া আদায়, নগদ ক্রয় ইত্যাদি"
            {...register('description')}
            className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
              errors.description
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.description && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          বাতিল করুন
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 disabled:bg-primary/50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>লোডিং...</span>
            </>
          ) : (
            <span>লেনদেন সংরক্ষণ করুন</span>
          )}
        </button>
      </div>
    </form>
  );
}
