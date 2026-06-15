'use client';

import React, { useState, useEffect } from 'react';
import { usePurchasesQuery } from '../api/purchases-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { PurchaseForm } from './purchase-form';
import { PurchaseDetail } from './purchase-detail';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import {
  Search,
  Plus,
  Truck,
  Loader2,
  FileText,
  ChevronRight,
} from 'lucide-react';
import type { PurchaseStatus } from '@/lib/api';

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  DRAFT: 'খসড়া',
  ORDERED: 'অর্ডারকৃত',
  RECEIVED: 'গ্রহণকৃত',
  CANCELLED: 'বাতিল',
};

const STATUS_COLORS: Record<PurchaseStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  ORDERED: 'bg-blue-100 text-blue-800',
  RECEIVED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

interface PurchaseListProps {
  onSelectPurchase: (id: string) => void;
  selectedPurchaseId?: string | null;
}

export function PurchaseList({ onSelectPurchase, selectedPurchaseId }: PurchaseListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, statusFilter, reset]);

  const { data: purchases, meta, isLoading, refetch } = usePurchasesQuery(
    debouncedSearch,
    statusFilter || undefined,
    cursor,
    20,
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full space-y-4">
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <PurchaseForm
              onSuccess={() => {
                setShowCreateModal(false);
                refetch();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Truck className="h-5 w-5 text-primary" />
            <span>ক্রয় অর্ডার (Purchase Orders)</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Supplier procurement & stock receiving</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ক্রয় অর্ডার</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="PO নম্বর বা সরবরাহকারী খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | '')}
          className="h-10 w-full md:w-48 rounded-lg border border-slate-200 px-3 text-xs bg-white"
        >
          <option value="">সব স্ট্যাটাস</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-xs text-slate-400">ক্রয় তালিকা লোড হচ্ছে...</p>
        </div>
      ) : !purchases?.length ? (
        <div className="flex flex-col items-center py-12 border border-dashed border-slate-100 rounded-xl">
          <FileText className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 font-bold">কোনো ক্রয় অর্ডার পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-2">
          {purchases.map((po) => {
            const isSelected = po.id === selectedPurchaseId;
            return (
              <button
                key={po.id}
                onClick={() => onSelectPurchase(po.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs">{po.referenceNumber}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[po.status]}`}>
                      {STATUS_LABELS[po.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {po.supplierName || 'সরবরাহকারী নেই'} · {po.items.length} আইটেম
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-extrabold text-sm text-slate-800">{formatTaka(po.total)}</p>
                    {po.due > 0 && (
                      <p className="text-[9px] text-amber-700 font-bold">বাকি: {formatTaka(po.due)}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CursorPagination
        meta={meta}
        hasPrev={hasPrev}
        onPrev={prev}
        onNext={() => next(meta?.nextCursor)}
        currentCount={purchases?.length ?? 0}
        itemLabel="ক্রয় অর্ডার"
      />
    </div>
  );
}

export { PurchaseDetail };
