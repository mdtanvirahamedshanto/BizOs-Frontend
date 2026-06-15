'use client';

import React, { useState } from 'react';
import { usePosCartStore } from '../stores/use-pos-cart';
import { usePOSCustomersQuery, usePOSCheckoutMutation, CheckoutResult } from '../api/pos-api';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { CreditCard, DollarSign, Loader2, ArrowRight, User } from 'lucide-react';

interface PosCheckoutProps {
  onCheckoutSuccess: (result: CheckoutResult) => void;
}

export function PosCheckout({ onCheckoutSuccess }: PosCheckoutProps) {
  const { 
    cartItems, 
    discount, 
    taxRate, 
    customerId, 
    paymentType, 
    cashReceived,
    setDiscount,
    setTaxRate,
    setCustomerId,
    setPaymentType,
    setCashReceived
  } = usePosCartStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const { data: customers } = usePOSCustomersQuery(customerSearch);
  const { mutate: checkout, isPending } = usePOSCheckoutMutation();

  const [validationError, setValidationError] = useState<string | null>(null);

  // Math totals calculation
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const taxAmount = Math.round((subtotal - discountAmount) * (taxRate / 100));
  const netPayable = subtotal - discountAmount + taxAmount;

  // Change due or debt balances
  let changeDue = 0;
  let remainingDue = 0;
  
  if (paymentType === 'cash' || paymentType === 'mobile_banking') {
    const received = cashReceived || netPayable;
    changeDue = Math.max(0, received - netPayable);
  } else if (paymentType === 'due') {
    remainingDue = netPayable;
  } else if (paymentType === 'partial') {
    remainingDue = Math.max(0, netPayable - cashReceived);
  }

  const handleCheckout = () => {
    setValidationError(null);

    if (cartItems.length === 0) {
      setValidationError('চেকআউট করতে কার্টে কমপক্ষে ১টি প্রোডাক্ট যোগ করুন।');
      return;
    }

    // Validation: if due/partial payment, customer is mandatory
    if ((paymentType === 'due' || paymentType === 'partial') && !customerId) {
      setValidationError('বাকি বা আংশিক লেনদেনের ক্ষেত্রে কাস্টমার নির্বাচন করা আবশ্যক।');
      return;
    }

    const payload = {
      customerId,
      paymentType,
      discount,
      taxRate,
      cashReceived: paymentType === 'cash' ? Math.max(cashReceived, netPayable) : cashReceived,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    checkout(payload, {
      onSuccess: (result) => {
        onCheckoutSuccess(result);
      },
      onError: (err: any) => {
        setValidationError(err.message || 'চেকআউট সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-800">পেমেন্ট ও হিসাব বিবরণী</h3>
        <p className="text-[10px] text-slate-400 font-medium">Checkout Calculations & Payments</p>
      </div>

      {validationError && (
        <div className="rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-[11px] font-semibold text-destructive">
          {validationError}
        </div>
      )}

      {/* Pricing summary list */}
      <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex justify-between">
          <span>আইটেম মূল্য (Subtotal):</span>
          <span className="font-sans font-extrabold text-slate-700">{formatTaka(subtotal)}</span>
        </div>
        
        {/* Discount input */}
        <div className="flex items-center justify-between gap-4">
          <span>ছাড় / ডিসকাউন্ট (%):</span>
          <input
            type="number"
            inputMode="numeric"
            value={discount || ''}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="0"
            className="w-16 h-7 rounded border border-slate-200 text-right px-1.5 text-xs font-bold font-sans outline-none focus:border-primary"
          />
        </div>

        {/* VAT input */}
        <div className="flex items-center justify-between gap-4">
          <span>ভ্যাট / ভ্যাট ট্যাক্স (%):</span>
          <input
            type="number"
            inputMode="numeric"
            value={taxRate || ''}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            placeholder="0"
            className="w-16 h-7 rounded border border-slate-200 text-right px-1.5 text-xs font-bold font-sans outline-none focus:border-primary"
          />
        </div>

        <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between text-sm font-black text-slate-800">
          <span>মোট প্রদেয় (Net Payable):</span>
          <span className="text-primary font-sans">{formatTaka(netPayable)}</span>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="space-y-1.5">
        <label htmlFor="checkout-customer" className="block text-xs font-bold text-slate-700">
          কাস্টমার সিলেক্ট করুন
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <select
            id="checkout-customer"
            value={customerId || ''}
            onChange={(e) => setCustomerId(e.target.value || null)}
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs bg-white border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          >
            <option value="">ওয়াক-ইন কাস্টমার (Walk-in Customer)</option>
            {customers?.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">পেমেন্ট মেথড</label>
        <div className="grid grid-cols-2 gap-2">
          {['cash', 'mobile_banking', 'due', 'partial'].map((type) => {
            const label = 
              type === 'cash' 
                ? 'নগদ ক্যাশ (Cash)' 
                : type === 'mobile_banking' 
                ? 'মোবাইল ক্যাশ (MFS)'
                : type === 'due'
                ? 'পুরো বাকি (Full Due)'
                : 'আংশিক বাকি (Partial)';
                
            return (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentType(type as any)}
                className={`h-9 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center ${
                  paymentType === type
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cash Received Input (for Cash, Partial payments) */}
      {(paymentType === 'cash' || paymentType === 'partial') && (
        <div className="space-y-1.5">
          <label htmlFor="cash-received-input" className="block text-xs font-bold text-slate-700">
            নগদ জমা / ক্যাশ রিসিভড (৳)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="cash-received-input"
              type="number"
              inputMode="decimal"
              value={cashReceived || ''}
              onChange={(e) => setCashReceived(Number(e.target.value))}
              placeholder={netPayable.toString()}
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans font-extrabold text-slate-700"
            />
          </div>
        </div>
      )}

      {/* Change Due / Dues remaining calculation display */}
      <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold">
        {paymentType === 'cash' && (
          <div className="flex justify-between text-slate-600">
            <span>ফেরত পাবেন (Change Due):</span>
            <span className="text-emerald-700 font-sans">{formatTaka(changeDue)}</span>
          </div>
        )}
        {(paymentType === 'due' || paymentType === 'partial') && (
          <div className="flex justify-between text-slate-600">
            <span>বকেয়া খাতায় যুক্ত হবে (New Due):</span>
            <span className="text-red-600 font-sans">{formatTaka(remainingDue)}</span>
          </div>
        )}
      </div>

      {/* Checkout Submit Button */}
      <button
        onClick={handleCheckout}
        disabled={isPending || cartItems.length === 0}
        className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100 shadow-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>অর্ডার প্লেস হচ্ছে...</span>
          </>
        ) : (
          <>
            <span>বিক্রি সম্পন্ন করুন</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
