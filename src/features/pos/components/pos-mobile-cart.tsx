'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, ChevronUp } from 'lucide-react';
import { usePosCartStore } from '../stores/use-pos-cart';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { PosCart } from './pos-cart';
import { PosCheckout } from './pos-checkout';
import { CheckoutResult } from '../api/pos-api';

interface PosMobileCartProps {
  onCheckoutSuccess: (result: CheckoutResult) => void;
}

/**
 * Mobile-only POS cart experience.
 * Shows a floating summary bar above the bottom nav and opens a full
 * checkout sheet on tap — so cashiers never have to scroll past the catalog.
 */
export function PosMobileCart({ onCheckoutSuccess }: PosMobileCartProps) {
  const [open, setOpen] = useState(false);
  const cartItems = usePosCartStore((s) => s.cartItems);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Close the sheet automatically if the cart becomes empty
  useEffect(() => {
    if (itemCount === 0) setOpen(false);
  }, [itemCount]);

  return (
    <div className="lg:hidden">
      {/* Floating summary bar (only when cart has items) */}
      {itemCount > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-mobile-nav left-3 right-3 z-40 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-white shadow-lg shadow-primary/30 active:scale-[0.99] transition-transform animate-in slide-in-from-bottom-4 duration-200"
        >
          <span className="flex items-center gap-2">
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-primary">
                {itemCount}
              </span>
            </span>
            <span className="text-sm font-bold">কার্ট দেখুন</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base font-black font-sans">{formatTaka(total)}</span>
            <ChevronUp className="h-4 w-4" />
          </span>
        </button>
      )}

      {/* Full checkout sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <div className="relative flex max-h-[92vh] flex-col rounded-t-2xl bg-slate-50 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Grabber + header */}
            <div className="shrink-0 rounded-t-2xl bg-white px-4 pb-3 pt-2.5 border-b border-slate-100">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  কার্ট ও চেকআউট
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                  aria-label="বন্ধ করুন"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-safe">
              <PosCart />
              <PosCheckout
                onCheckoutSuccess={(result) => {
                  setOpen(false);
                  onCheckoutSuccess(result);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
