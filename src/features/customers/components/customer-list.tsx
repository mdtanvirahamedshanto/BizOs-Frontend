'use client';

import React, { useState, useEffect } from 'react';
import { useCustomersQuery } from '../api/customers-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { CustomerForm } from './customer-form';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import {
  Search,
  UserPlus,
  ArrowRight,
  Users,
  FolderMinus,
  Loader2,
  Phone,
} from 'lucide-react';

interface CustomerListProps {
  onSelectCustomer: (customerId: string) => void;
  selectedCustomerId?: string | null;
}

export function CustomerList({ onSelectCustomer, selectedCustomerId }: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'dues' | 'paid'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, filterTab, reset]);

  const { data: customers, meta, isLoading, refetch, isError, error } = useCustomersQuery(
    debouncedSearch,
    filterTab,
    cursor,
    20,
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full space-y-4">
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CustomerForm
              onSuccess={() => {
                setShowAddModal(false);
                refetch();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="h-5 w-5 text-primary" />
            <span>গ্রাহক ও বাকির খাতা</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Customer List & Dues Directory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>নতুন গ্রাহক যোগ</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 border border-slate-200/80 bg-slate-50/50 rounded-lg self-start">
          {(['all', 'dues', 'paid'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                filterTab === tab
                  ? tab === 'dues'
                    ? 'bg-red-50 text-red-800 shadow-xs border border-red-100'
                    : tab === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-100'
                      : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'all' ? 'সবাই' : tab === 'dues' ? 'বাকি আছে' : 'পরিশোধিত'}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {(error as Error)?.message || 'গ্রাহক তালিকা লোড করতে সমস্যা হয়েছে।'}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-xs text-slate-400 font-semibold">গ্রাহক তালিকা লোড হচ্ছে...</p>
        </div>
      ) : !customers || customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
          <FolderMinus className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 font-bold">কোনো গ্রাহকের হিসাব খুঁজে পাওয়া যায়নি।</p>
        </div>
      ) : (
        <>
        {/* Mobile card list */}
        <div className="md:hidden space-y-2.5">
          {customers.map((c) => {
            const isSelected = c.id === selectedCustomerId;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className={`rounded-xl border p-3 transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{c.name}</p>
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      {c.phone || '—'}
                    </span>
                    {c.address && (
                      <p className="mt-0.5 text-[10px] text-slate-400 font-medium truncate">
                        {c.address}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">বকেয়া</p>
                    <p
                      className={`mt-1 font-extrabold font-mono text-sm leading-none ${
                        c.dueAmount > 0 ? 'text-red-600' : 'text-slate-500'
                      }`}
                    >
                      {formatTaka(c.dueAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex justify-end border-t border-slate-50 pt-2.5">
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-primary">
                    হিসাব দেখুন
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">নাম</th>
                <th className="py-2.5 px-3">মোবাইল নম্বর</th>
                <th className="py-2.5 px-3">ঠিকানা</th>
                <th className="py-2.5 px-3 text-right">বকেয়া পরিমাণ</th>
                <th className="py-2.5 px-3 text-center">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {customers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/5' : ''
                    }`}
                    onClick={() => onSelectCustomer(c.id)}
                  >
                    <td className="py-3 px-3 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                        <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                        {c.phone || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-medium truncate max-w-[150px]">
                      {c.address || 'ঠিকানা নেই'}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold font-mono text-[13px]">
                      <span className={c.dueAmount > 0 ? 'text-red-600' : 'text-slate-500'}>
                        {formatTaka(c.dueAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectCustomer(c.id)}
                        className={`h-7 px-2.5 rounded-lg border text-[10px] font-extrabold flex items-center justify-center gap-1 mx-auto transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>হিসাব দেখুন</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      <CursorPagination
        meta={meta}
        hasPrev={hasPrev}
        onPrev={prev}
        onNext={() => next(meta?.nextCursor)}
        itemLabel="গ্রাহক"
        currentCount={customers?.length ?? 0}
      />
    </div>
  );
}
