'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { expenseSchema, ExpenseFormInput } from '../types';
import { useCreateExpenseMutation, useExpenseCategoriesQuery } from '../api/expenses-api';

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
  const { mutate: createExpense, isPending } = useCreateExpenseMutation();
  const { data: categories } = useExpenseCategoriesQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      paymentMethod: 'CASH',
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ExpenseFormInput) => {
    createExpense(data, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-800">নতুন খরচ এন্ট্রি</h3>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">শিরোনাম *</label>
        <input {...register('title')} className="h-10 w-full rounded-lg border px-3 text-xs" />
        {errors.title && <p className="text-[10px] text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">পরিমাণ (৳) *</label>
          <input type="number" {...register('amount', { valueAsNumber: true })} className="h-10 w-full rounded-lg border px-3 text-xs" />
          {errors.amount && <p className="text-[10px] text-destructive mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">তারিখ</label>
          <input type="date" {...register('expenseDate')} className="h-10 w-full rounded-lg border px-3 text-xs" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
          <select {...register('categoryId')} className="h-10 w-full rounded-lg border px-3 text-xs">
            <option value="">নির্বাচন করুন</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">পেমেন্ট মাধ্যম</label>
          <select {...register('paymentMethod')} className="h-10 w-full rounded-lg border px-3 text-xs">
            <option value="CASH">নগদ</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="BANK">ব্যাংক</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">বিবরণ</label>
        <textarea {...register('description')} rows={2} className="w-full rounded-lg border px-3 py-2 text-xs" />
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="h-9 px-4 border rounded-lg text-xs font-semibold">বাতিল</button>
        <button type="submit" disabled={isPending} className="h-9 px-5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          সংরক্ষণ
        </button>
      </div>
    </form>
  );
}
