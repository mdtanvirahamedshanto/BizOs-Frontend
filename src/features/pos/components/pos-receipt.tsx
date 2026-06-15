'use client';

import React from 'react';
import { CheckoutResult } from '../api/pos-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Printer, RefreshCcw, Landmark } from 'lucide-react';

interface PosReceiptProps {
  receipt: CheckoutResult;
  onReset: () => void;
}

export function PosReceipt({ receipt, onReset }: PosReceiptProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Thermal Receipt Visual container */}
      <div 
        id="thermal-receipt-print-area"
        className="border border-slate-100 p-4 bg-slate-50/20 rounded-xl font-mono text-xs text-slate-800 space-y-3 leading-tight print:p-0 print:bg-white print:border-none print:text-black"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-slate-300 pb-2.5">
          <h2 className="text-sm font-bold uppercase">শরীফ জেনারেল স্টোর</h2>
          <p className="text-[10px] text-slate-500 font-bold">মিরপুর ১০, ঢাকা, বাংলাদেশ</p>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">মোবাইল: ০১৭১২৩৪৫৬৭৮</p>
        </div>

        {/* Invoice Meta */}
        <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2.5">
          <div className="flex justify-between">
            <span className="font-bold">চালান নং (Invoice):</span>
            <span className="font-extrabold">{receipt.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span>লেনদেন আইডি (ID):</span>
            <span className="font-semibold text-slate-500 font-mono text-[9px]">{receipt.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span>তারিখ ও সময়:</span>
            <span>{receipt.timestamp}</span>
          </div>
        </div>

        {/* Purchase Items List */}
        <div className="border-b border-dashed border-slate-300 pb-2.5 space-y-1.5">
          <div className="flex justify-between font-bold text-[9px] text-slate-400 uppercase">
            <span>বিবরণ (Item)</span>
            <span className="w-12 text-center">পরিমাণ</span>
            <span className="text-right">টাকা</span>
          </div>
          
          {/* Items rows */}
          <div className="space-y-1">
            {receipt.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between font-semibold">
                <span className="truncate max-w-[120px]">{item.name}</span>
                <span className="w-12 text-center">{item.quantity} {item.unit}</span>
                <span className="text-right font-sans">{formatTaka(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Math totals */}
        <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2.5">
          <div className="flex justify-between">
            <span>মোট মূল্য (Subtotal):</span>
            <span className="font-sans font-semibold">{formatTaka(receipt.totalAmount)}</span>
          </div>
          {receipt.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>ডিসকাউন্ট ছাড় (-):</span>
              <span className="font-sans">- {formatTaka(receipt.discountAmount)}</span>
            </div>
          )}
          {receipt.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>ভ্যাট ট্যাক্স (+):</span>
              <span className="font-sans">+ {formatTaka(receipt.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-200/50 mt-1 pt-1">
            <span>মোট পরিশোধ (Net Total):</span>
            <span className="font-sans text-primary">{formatTaka(receipt.netPayable)}</span>
          </div>
        </div>

        {/* Cash balances */}
        <div className="space-y-1 text-[10px] pb-1">
          <div className="flex justify-between font-semibold text-slate-600">
            <span>নগদ গ্রহণ (Paid):</span>
            <span className="font-sans font-bold">{formatTaka(receipt.cashReceived)}</span>
          </div>
          {receipt.changeDue > 0 && (
            <div className="flex justify-between font-semibold text-slate-600">
              <span>ফেরত দেয়া হল (Change):</span>
              <span className="font-sans font-bold text-emerald-700">{formatTaka(receipt.changeDue)}</span>
            </div>
          )}
          {receipt.dueAmount > 0 && (
            <div className="flex justify-between font-semibold text-slate-600">
              <span>মোট বাকি (Due remaining):</span>
              <span className="font-sans font-bold text-red-600">{formatTaka(receipt.dueAmount)}</span>
            </div>
          )}
        </div>

        {/* Footer slogans */}
        <div className="text-center border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400 font-bold space-y-0.5">
          <p>ধন্যবাদ, আবার আসবেন!</p>
          <p>Powered by BizOS SaaS Platform</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onReset}
          className="h-10 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>নতুন বিক্রয়</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="h-10 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>রশিদ প্রিন্ট</span>
        </button>
      </div>
    </div>
  );
}
