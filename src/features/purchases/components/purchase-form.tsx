'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2, Package } from 'lucide-react';
import { useCreatePurchaseMutation } from '../api/purchases-api';
import { useSuppliersQuery } from '@/features/ledger/api/suppliers-api';
import { useProductsQuery } from '@/features/inventory/api/inventory-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';

const lineSchema = z.object({
  productId: z.string().min(1, 'প্রোডাক্ট নির্বাচন করুন'),
  quantity: z.number().positive('পরিমাণ ০ এর বেশি হতে হবে'),
  unitCost: z.number().nonnegative('ক্রয় মূল্য অবশ্যই ০ বা তার বেশি'),
});

const purchaseFormSchema = z.object({
  supplierId: z.string().optional(),
  status: z.enum(['DRAFT', 'ORDERED', 'RECEIVED']),
  notes: z.string().optional(),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  paymentAmount: z.number().nonnegative().optional(),
  paymentMethod: z.enum(['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'CARD', 'CHECK', 'OTHER']).optional(),
  items: z.array(lineSchema).min(1, 'কমপক্ষে একটি আইটেম যোগ করুন'),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PurchaseForm({ onSuccess, onCancel }: PurchaseFormProps) {
  const { mutate: createPurchase, isPending } = useCreatePurchaseMutation();
  const { data: suppliers } = useSuppliersQuery('', 'all', undefined, 100);
  const { data: products } = useProductsQuery('', '', false, '', '', undefined, 100);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      status: 'RECEIVED',
      paymentMethod: 'CASH',
      items: [{ productId: '', quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const tax = watch('tax') ?? 0;
  const discount = watch('discount') ?? 0;

  const subtotal = watchedItems.reduce(
    (sum, line) => sum + (line.quantity || 0) * (line.unitCost || 0),
    0,
  );
  const total = Math.max(0, subtotal + tax - discount);

  const onSubmit = (data: PurchaseFormValues) => {
    createPurchase(data, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-800">নতুন ক্রয় অর্ডার তৈরি</h3>
        <p className="text-[10px] text-slate-400">Create purchase order & receive stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">সরবরাহকারী</label>
          <select {...register('supplierId')} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs">
            <option value="">নির্বাচন করুন (ঐচ্ছিক)</option>
            {suppliers?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">স্ট্যাটাস *</label>
          <select {...register('status')} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs">
            <option value="RECEIVED">গ্রহণকৃত (স্টক যোগ হবে)</option>
            <option value="ORDERED">অর্ডারকৃত</option>
            <option value="DRAFT">খসড়া</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Package className="h-4 w-4" /> আইটেম সমূহ *
          </label>
          <button
            type="button"
            onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}
            className="text-[10px] font-bold text-primary flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" /> আইটেম যোগ
          </button>
        </div>

        {/* Item Headers */}
        <div className="grid grid-cols-12 gap-2 px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:grid">
          <div className="col-span-5">প্রোডাক্ট *</div>
          <div className="col-span-2">পরিমাণ *</div>
          <div className="col-span-3">ক্রয় মূল্য *</div>
          <div className="col-span-2"></div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="col-span-12 md:col-span-5">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 md:hidden">প্রোডাক্ট *</label>
              <select
                {...register(`items.${index}.productId`)}
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
              >
                <option value="">প্রোডাক্ট নির্বাচন</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 md:hidden">পরিমাণ *</label>
              <input
                type="number"
                placeholder="পরিমাণ"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 md:hidden">ক্রয় মূল্য *</label>
              <input
                type="number"
                placeholder="ক্রয় মূল্য"
                {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
              />
            </div>
            <div className="col-span-2 flex justify-end items-end h-full">
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              )}
            </div>
          </div>
        ))}
        {errors.items?.message && (
          <p className="text-[10px] text-destructive font-semibold">{errors.items.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">ট্যাক্স</label>
          <input type="number" {...register('tax', { valueAsNumber: true })} className="h-9 w-full rounded-lg border px-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">ছাড়</label>
          <input type="number" {...register('discount', { valueAsNumber: true })} className="h-9 w-full rounded-lg border px-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">পেমেন্ট</label>
          <input type="number" {...register('paymentAmount', { valueAsNumber: true })} className="h-9 w-full rounded-lg border px-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">পেমেন্ট মাধ্যম</label>
          <select {...register('paymentMethod')} className="h-9 w-full rounded-lg border px-2 text-xs">
            <option value="CASH">নগদ</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="BANK">ব্যাংক</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-xs font-bold text-slate-600">মোট ক্রয় মূল্য</span>
        <span className="text-lg font-black text-slate-800">{formatTaka(total)}</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">নোট</label>
        <textarea {...register('notes')} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="h-9 px-4 border rounded-lg text-xs font-semibold text-slate-600">
          বাতিল
        </button>
        <button type="submit" disabled={isPending} className="h-9 px-5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          <span>ক্রয় অর্ডার সংরক্ষণ</span>
        </button>
      </div>
    </form>
  );
}
