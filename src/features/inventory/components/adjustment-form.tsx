'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownLeft, ArrowUpRight, ShieldAlert, FileText, Loader2 } from 'lucide-react';
import { adjustmentSchema, AdjustmentInput } from '../types';
import { useAdjustStockMutation } from '../api/inventory-api';

interface AdjustmentFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdjustmentForm({ productId, onSuccess, onCancel }: AdjustmentFormProps) {
  const { mutate: adjustStock, isPending } = useAdjustStockMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdjustmentInput>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: 'stock_in',
      quantity: undefined,
      reason: 'নতুন স্টক যুক্ত করা হল (Restock)',
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: AdjustmentInput) => {
    adjustStock(
      { productId, input: data },
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
        <h3 className="text-sm font-bold text-slate-800">স্টক এন্ট্রি ও সমন্বয়</h3>
        <p className="text-[10px] text-slate-400 font-medium">Record Inventory Levels & Adjustments</p>
      </div>

      {/* Adjustment Type Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">পরিবর্তনের ধরন</label>
        <div className="grid grid-cols-2 gap-2">
          {/* Stock In */}
          <button
            type="button"
            onClick={() => {
              setValue('type', 'stock_in');
              setValue('reason', 'নতুন স্টক যুক্ত করা হল (Restock)');
            }}
            className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              selectedType === 'stock_in'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            <span>স্টক ইন (Stock In)</span>
          </button>

          {/* Stock Out */}
          <button
            type="button"
            onClick={() => {
              setValue('type', 'stock_out');
              setValue('reason', 'স্টক কমানো হল (Stock Out)');
            }}
            className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              selectedType === 'stock_out'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span>স্টক আউট (Stock Out)</span>
          </button>

          {/* Damaged */}
          <button
            type="button"
            onClick={() => {
              setValue('type', 'damage');
              setValue('reason', 'পণ্য নষ্ট/ক্ষতিগ্রস্ত (Damaged Goods)');
            }}
            className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 col-span-2 ${
              selectedType === 'damage'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>ক্ষতিগ্রস্ত পণ্য (Damaged / Waste)</span>
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="adjust-qty" className="block text-xs font-semibold text-slate-700 mb-1">
          পরিমাণ (Quantity) <span className="text-destructive">*</span>
        </label>
        <input
          id="adjust-qty"
          type="number"
          inputMode="numeric"
          placeholder="0"
          {...register('quantity', { valueAsNumber: true })}
          className={`h-10 w-full rounded-lg border px-3 text-xs outline-none transition-all ${
            errors.quantity
              ? 'border-destructive focus:ring-1 focus:ring-destructive'
              : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
          }`}
        />
        {errors.quantity && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.quantity.message}</p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label htmlFor="adjust-reason" className="block text-xs font-semibold text-slate-700 mb-1">
          পরিবর্তনের কারণ <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="adjust-reason"
            type="text"
            placeholder="যেমন: নতুন স্টক ক্রয়, ত্রুটিপূর্ণ পণ্য বদল"
            {...register('reason')}
            className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
              errors.reason
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.reason && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.reason.message}</p>
        )}
      </div>

      {/* Buttons */}
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
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <span>স্টক পরিবর্তন সংরক্ষণ</span>
          )}
        </button>
      </div>
    </form>
  );
}
