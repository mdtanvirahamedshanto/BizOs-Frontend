'use client';

import React, { useState, useEffect } from 'react';
import {
  useExpensesQuery,
  useExpenseCategoriesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from '../api/expenses-api';
import { ExpenseForm } from './expense-form';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import { Search, Plus, Receipt, Loader2, Trash2 } from 'lucide-react';

export function ExpenseList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, categoryId, reset]);

  const { data: expenses, meta, isLoading, refetch } = useExpensesQuery(
    debouncedSearch,
    categoryId,
    cursor,
    20,
  );
  const { data: categories } = useExpenseCategoriesQuery();
  const { mutate: deleteExpense } = useDeleteExpenseMutation();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-2xl">
            <ExpenseForm
              onSuccess={() => {
                setShowForm(false);
                refetch();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Receipt className="h-5 w-5 text-primary" />
            <span>দৈনিক খরচ (Expenses)</span>
          </h2>
          <p className="text-[10px] text-slate-400">Track operational costs & cash outflows</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন খরচ যোগ</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="খরচের নাম বা বিবরণ খুঁজুন..."
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 w-full md:w-48 rounded-lg border px-3 text-xs"
        >
          <option value="">সব ক্যাটাগরি</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : !expenses?.length ? (
        <p className="text-center text-xs text-slate-400 py-12">কোনো খরচের রেকর্ড নেই।</p>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
              <div>
                <p className="text-xs font-bold text-slate-800">{exp.title}</p>
                <p className="text-[10px] text-slate-400">
                  {exp.categoryName ?? 'অন্যান্য'} · {new Date(exp.expenseDate).toLocaleDateString('bn-BD')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-rose-700">{formatTaka(exp.amount)}</span>
                <button
                  onClick={() => deleteExpense(exp.id, { onSuccess: () => refetch() })}
                  className="h-8 w-8 rounded-lg border text-slate-400 hover:text-red-600 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CursorPagination
        meta={meta}
        hasPrev={hasPrev}
        onPrev={prev}
        onNext={() => next(meta?.nextCursor)}
        currentCount={expenses?.length ?? 0}
        itemLabel="খরচ"
      />
    </div>
  );
}
