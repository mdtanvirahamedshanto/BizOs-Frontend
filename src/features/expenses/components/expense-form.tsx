'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { expenseSchema, ExpenseFormInput } from '../types';
import { 
  useCreateExpenseMutation, 
  useExpenseCategoriesQuery, 
  useCreateExpenseCategoryMutation 
} from '../api/expenses-api';

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (id: string) => void;
}) {
  const [name, setName] = React.useState('');
  const { mutate: createCategory, isPending } = useCreateExpenseCategoryMutation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">নতুন খরচের ক্যাটাগরি</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ক্যাটাগরির নাম <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: যাতায়াত ভাড়া"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={!name.trim() || isPending}
              onClick={() => {
                createCategory({ name }, {
                  onSuccess: (cat) => {
                    setName('');
                    onSuccess(cat.id);
                  }
                });
              }}
              className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 disabled:bg-primary/50 flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              সংরক্ষণ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const { mutate: createExpense, isPending } = useCreateExpenseMutation();
  const { data: categories } = useExpenseCategoriesQuery();

  const {
    register,
    handleSubmit,
    setValue,
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
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold">ক্যাটাগরি</label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              + নতুন ক্যাটাগরি
            </button>
          </div>
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
      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)}
        onSuccess={(newCatId) => {
          setValue('categoryId', newCatId, { shouldValidate: true });
          setShowCategoryModal(false);
        }}
      />
    </form>
  );
}
