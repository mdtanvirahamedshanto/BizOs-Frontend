'use client';

import React, { useState, useMemo } from 'react';
import { useSalesQuery } from '@/hooks/queries/use-sales-query';
import { ReportTimeframe } from '@/features/reports/types';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Package,
  User,
  Receipt,
  Loader2,
} from 'lucide-react';

interface SalesHistoryTableProps {
  timeframe: ReportTimeframe;
}

function getDateRange(timeframe: ReportTimeframe): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  if (timeframe === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'weekly') {
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'monthly') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // fallback to last 30 days for 'custom'
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
  }
  return { startDate, endDate };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTaka(amount: number) {
  return `৳${(amount / 100).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config = {
    PAID: { label: 'পরিশোধিত', className: 'bg-emerald-100 text-emerald-700' },
    PARTIAL: { label: 'আংশিক', className: 'bg-amber-100 text-amber-700' },
    UNPAID: { label: 'বাকি', className: 'bg-rose-100 text-rose-700' },
    OVERPAID: { label: 'অতিরিক্ত', className: 'bg-blue-100 text-blue-700' },
  };
  const c = config[status as keyof typeof config] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${c.className}`}>
      {c.label}
    </span>
  );
}

function SaleRow({ sale }: { sale: any }) {
  const [expanded, setExpanded] = useState(false);

  const items: any[] = sale.items ?? [];
  const hasItems = items.length > 0;

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer"
        onClick={() => hasItems && setExpanded((v) => !v)}
      >
        {/* Date */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
              {formatDate(sale.saleDate || sale.createdAt)}
            </span>
          </div>
        </td>

        {/* Invoice */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-primary">{sale.invoiceNumber}</span>
          </div>
        </td>

        {/* Customer */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600">
              {sale.customer?.name ?? '—'}
            </span>
          </div>
        </td>

        {/* Items count */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">
              {items.length} টি পণ্য
            </span>
          </div>
        </td>

        {/* Total */}
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-black text-slate-800">
            {formatTaka(sale.totalCents)}
          </span>
        </td>

        {/* Payment status */}
        <td className="px-4 py-3 text-center">
          <PaymentStatusBadge status={sale.paymentStatus} />
        </td>

        {/* Expand icon */}
        <td className="px-4 py-3 text-center">
          {hasItems ? (
            <button
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-slate-200 text-slate-500 transition-colors mx-auto"
              aria-label="বিস্তারিত দেখুন"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>
      </tr>

      {/* Expanded Items Row */}
      {expanded && hasItems && (
        <tr className="bg-slate-50/90">
          <td colSpan={7} className="px-6 py-3">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2 font-bold text-slate-600">পণ্যের নাম</th>
                    <th className="text-right px-4 py-2 font-bold text-slate-600">পরিমাণ</th>
                    <th className="text-right px-4 py-2 font-bold text-slate-600">একক মূল্য</th>
                    <th className="text-right px-4 py-2 font-bold text-slate-600">মোট</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-700">{item.productName}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{formatTaka(item.unitPriceCents)}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-800">{formatTaka(item.totalCents)}</td>
                    </tr>
                  ))}
                  {/* Subtotal row */}
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-2 font-bold text-slate-600 text-right">মোট:</td>
                    <td className="px-4 py-2 font-black text-slate-900 text-right">{formatTaka(sale.totalCents)}</td>
                  </tr>
                  {sale.dueCents > 0 && (
                    <tr className="bg-rose-50">
                      <td colSpan={3} className="px-4 py-2 font-bold text-rose-600 text-right">বাকি:</td>
                      <td className="px-4 py-2 font-black text-rose-700 text-right">{formatTaka(sale.dueCents)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function SalesHistoryTable({ timeframe }: SalesHistoryTableProps) {
  const [search, setSearch] = useState('');
  const { startDate, endDate } = useMemo(() => getDateRange(timeframe), [timeframe]);

  const { data, isLoading, error } = useSalesQuery({
    startDate,
    endDate,
    limit: 100,
    sortBy: 'saleDate',
    sortOrder: 'desc',
  });

  const filteredSales = useMemo(() => {
    const rows = data?.data ?? [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (s) =>
        s.invoiceNumber.toLowerCase().includes(q) ||
        (s as any).customer?.name?.toLowerCase().includes(q) ||
        (s as any).items?.some((i: any) => i.productName?.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const totalRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.totalCents, 0),
    [filteredSales],
  );

  const timeframeLabel =
    timeframe === 'today'
      ? 'আজকের'
      : timeframe === 'weekly'
      ? 'গত ৭ দিনের'
      : 'চলতি মাসের';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500">বিক্রয় লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center">
        <p className="text-sm font-bold text-rose-600">বিক্রয় ইতিহাস লোড করতে সমস্যা হয়েছে।</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-800">
            {timeframeLabel} বিক্রয় ইতিহাস
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filteredSales.length} টি বিক্রয় • মোট{' '}
            <span className="font-bold text-emerald-700">{formatTaka(totalRevenue)}</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ইনভয়েস, কাস্টমার বা পণ্য খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-slate-50 border border-slate-200 border-dashed">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-400">
            {search ? 'কোনো বিক্রয় পাওয়া যায়নি' : `${timeframeLabel} কোনো বিক্রয় নেই`}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    তারিখ ও সময়
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    ইনভয়েস নং
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    কাস্টমার
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    আইটেম
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    মোট টাকা
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    পেমেন্ট
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    বিস্তারিত
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} />
                ))}
              </tbody>

              {/* Footer summary */}
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold text-slate-600">
                    মোট {filteredSales.length} টি বিক্রয়
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-emerald-700">
                    {formatTaka(totalRevenue)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
