'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePOSProductsQuery } from '../api/pos-api';
import { usePosCartStore } from '../stores/use-pos-cart';
import { useBarcode } from '@/hooks/use-barcode';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Product } from '@/features/inventory/api/inventory-api';
import { Search, ScanLine, Loader2, FileMinus, CheckCircle2, AlertCircle } from 'lucide-react';

type ScanFeedback = { type: 'success' | 'error'; text: string } | null;

export function PosCatalog() {
  const [search, setSearch] = useState('');
  const { data: products, isLoading } = usePOSProductsQuery(search);
  const addToCart = usePosCartStore((state) => state.addToCart);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedback>(null);

  // Auto-dismiss scan feedback
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2200);
    return () => clearTimeout(t);
  }, [feedback]);

  const addOrWarn = useCallback(
    (product: Product) => {
      if (product.stockCount <= 0) {
        setFeedback({ type: 'error', text: `স্টকে নেই: ${product.name}` });
        return;
      }
      addToCart(product);
      setFeedback({ type: 'success', text: `যোগ হয়েছে: ${product.name}` });
    },
    [addToCart],
  );

  // Unified barcode resolver — used by both the camera and hardware scanner.
  const resolveBarcode = useCallback(
    async (barcode: string) => {
      const local = products?.find((p) => p.barcode === barcode);
      if (local) {
        addOrWarn(local);
        return;
      }

      try {
        const [{ products: productsApi }, { toProductView }] = await Promise.all([
          import('@/lib/api'),
          import('@/lib/crm/product-mappers'),
        ]);
        const res = await productsApi.listProducts({ search: barcode, limit: 5, isActive: true });
        const match = res.data.map(toProductView).find((p) => p.barcode === barcode);
        if (match) {
          addOrWarn(match);
        } else {
          setFeedback({ type: 'error', text: `পণ্য খুঁজে পাওয়া যায়নি: ${barcode}` });
        }
      } catch {
        setFeedback({ type: 'error', text: `পণ্য খুঁজে পাওয়া যায়নি: ${barcode}` });
      }
    },
    [products, addOrWarn],
  );

  // Hardware (USB/Bluetooth keyboard-wedge) scanner
  useBarcode({ onScan: resolveBarcode });

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
      {/* Scan feedback toast */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{feedback.text}</span>
        </div>
      )}

      {/* Search Bar header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="প্রোডাক্ট নাম, বারকোড বা SKU দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Camera scan button */}
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-primary/95 active:scale-[0.97]"
          title="ক্যামেরা দিয়ে বারকোড স্ক্যান করুন"
        >
          <ScanLine className="h-4 w-4" />
          <span className="hidden sm:inline">স্ক্যান</span>
        </button>
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
            <p className="text-xs text-slate-400 font-bold">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
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

      {/* Camera barcode scanner (continuous for rapid add) */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={resolveBarcode}
        continuous
        title="POS — বারকোড স্ক্যান"
      />
    </div>
  );
}
