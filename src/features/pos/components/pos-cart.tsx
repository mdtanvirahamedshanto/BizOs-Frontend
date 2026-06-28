'use client';

import React from 'react';
import { usePosCartStore } from '../stores/use-pos-cart';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export function PosCart() {
  const { cartItems, updateQuantity, updatePrice, removeFromCart, clearCart } = usePosCartStore();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span>কার্ট ({cartItems.length})</span>
        </h3>
        
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] font-bold text-red-600 hover:underline"
          >
            সব মুছুন
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <ShoppingCart className="h-8 w-8 text-slate-200 mb-2" />
            <p className="text-xs font-semibold leading-none">কার্ট সম্পূর্ণ খালি!</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-none">প্রোডাক্টে ট্যাপ করে যুক্ত করুন</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div 
              key={item.product.id} 
              className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-xs truncate leading-none mb-2">
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold">মূল্য: ৳</span>
                    <input
                      type="number"
                      value={item.product.price === 0 ? '' : item.product.price}
                      onChange={(e) => updatePrice(item.product.id, Number(e.target.value) || 0)}
                      className="w-16 h-6 px-1 text-[11px] font-bold border border-slate-200 rounded text-slate-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Price total & Remove */}
                <div className="text-right shrink-0 flex items-start gap-2">
                  <div className="min-w-[60px] pt-0.5">
                    <p className="font-black text-slate-800 text-[13px] font-sans">
                      {formatTaka(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mt-0.5"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="number"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => updateQuantity(item.product.id, Number(e.target.value) || 0)}
                  className="w-12 h-7 text-center font-extrabold text-slate-800 font-sans border border-slate-200 rounded outline-none focus:border-primary"
                />
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stockCount}
                  className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95 disabled:opacity-40 disabled:scale-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 font-bold ml-2">/ {item.product.stockCount} {item.product.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subtotal Footer */}
      {cartItems.length > 0 && (
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>মোট আইটেম মূল্য (Subtotal):</span>
          <span className="text-base font-black text-slate-800 font-sans">
            {formatTaka(totalAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
