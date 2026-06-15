'use client';

import React from 'react';
import {
  usePurchaseDetailsQuery,
  useUpdatePurchaseStatusMutation,
} from '../api/purchases-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Loader2, CheckCircle, Package } from 'lucide-react';
import type { PurchaseStatus } from '@/lib/api';

interface PurchaseDetailProps {
  purchaseId: string;
  onClose?: () => void;
}

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  DRAFT: 'খসড়া',
  ORDERED: 'অর্ডারকৃত',
  RECEIVED: 'গ্রহণকৃত',
  CANCELLED: 'বাতিল',
};

export function PurchaseDetail({ purchaseId, onClose }: PurchaseDetailProps) {
  const { data: purchase, isLoading, refetch } = usePurchaseDetailsQuery(purchaseId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdatePurchaseStatusMutation(purchaseId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!purchase) {
    return <p className="text-xs text-center text-slate-400 py-8">ক্রয় অর্ডার পাওয়া যায়নি।</p>;
  }

  const canReceive = purchase.status === 'ORDERED' || purchase.status === 'DRAFT';
  const canCancel = purchase.status !== 'CANCELLED';

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">{purchase.referenceNumber}</h3>
        <p className="text-[10px] text-slate-400">
          {STATUS_LABELS[purchase.status]} · {purchase.supplierName || 'সরবরাহকারী নেই'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="text-[10px] text-slate-400 font-semibold">মোট</p>
          <p className="font-extrabold text-slate-800">{formatTaka(purchase.total)}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="text-[10px] text-slate-400 font-semibold">বাকি</p>
          <p className="font-extrabold text-amber-700">{formatTaka(purchase.due)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <Package className="h-4 w-4" /> আইটেম ({purchase.items.length})
        </p>
        {purchase.items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs p-2 rounded-lg border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">{item.productName}</p>
              <p className="text-[10px] text-slate-400">{item.sku} · {item.quantity} × {formatTaka(item.unitCost)}</p>
            </div>
            <p className="font-extrabold">{formatTaka(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      {(canReceive || canCancel) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {canReceive && (
            <button
              disabled={isUpdating}
              onClick={() =>
                updateStatus(
                  { status: 'RECEIVED', receivedDate: new Date().toISOString() },
                  { onSuccess: () => refetch() },
                )
              }
              className="h-9 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              স্টক গ্রহণ (Receive)
            </button>
          )}
          {canCancel && (
            <button
              disabled={isUpdating}
              onClick={() =>
                updateStatus({ status: 'CANCELLED' }, { onSuccess: () => refetch() })
              }
              className="h-9 px-3 border border-red-200 text-red-700 rounded-lg text-xs font-bold disabled:opacity-50"
            >
              বাতিল করুন
            </button>
          )}
        </div>
      )}

      {onClose && (
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="h-8 px-3 border rounded-lg text-xs font-semibold text-slate-500">
            বন্ধ করুন
          </button>
        </div>
      )}
    </div>
  );
}
