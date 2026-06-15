'use client';

import React, { useState } from 'react';
import { usePOSProductsQuery } from '../api/pos-api';
import { usePosCartStore } from '../stores/use-pos-cart';
import { useBarcode } from '@/hooks/use-barcode';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, Barcode, Boxes, Loader2, FileMinus } from 'lucide-react';

export function PosCatalog() {
  const [search, setSearch] = useState('');
  const { data: products, isLoading } = usePOSProductsQuery(search);
  const addToCart = usePosCartStore((state) => state.addToCart);

  // Bind hardware barcode scanner key events wedge
  useBarcode({
    onScan: (barcode) => {
      const match = products?.find((p) => p.barcode === barcode);
      if (match) {
        addToCart(match);
        // Provide audio/visual feedback in POS screen
        console.log(`[POS Scanner] Scanned and added: ${match.name}`);
      } else {
        alert(`এই বারকোডের পণ্য খুজে পাওয়া যায়নি: ${barcode}`);
      }
    },
  });

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Search Bar header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="প্রোডাক্ট নাম, বারকোড বা SKU দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-10 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-3 flex items-center text-slate-400" title="Barcode scanner connected">
            <Barcode className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Grid catalogue */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-semibold">ক্যাটালগ লোড হচ্ছে...</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
            <FileMinus className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-bold">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((p) => {
              const isOut = p.stockCount === 0;
              const isLow = p.stockCount > 0 && p.stockCount <= 5;
              
              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => addToCart(p)}
                  className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.97] hover:shadow-md cursor-pointer ${
                    isOut 
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed hover:shadow-none' 
                      : isLow
                      ? 'bg-white border-amber-200 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-primary'
                  }`}
                >
                  <div className="mb-2">
                    <p className="text-[11px] font-extrabold text-slate-800 line-clamp-2 leading-tight">
                      {p.name}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold">
                      {p.sku || 'SKU N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-slate-800 font-sans">
                      {formatTaka(p.price)}
                    </span>
                    
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      isOut 
                        ? 'bg-red-100 text-red-800' 
                        : isLow 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isOut ? 'স্টক নেই' : `${p.stockCount} ${p.unit}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
