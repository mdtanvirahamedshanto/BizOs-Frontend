'use client';

import React, { useState, useEffect } from 'react';
import { useSalesQuery, useSaleQuery, useReturnSaleMutation } from '@/hooks/queries/use-sales-query';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, RotateCcw, Ban, ShoppingBag, Plus, Minus, CheckCircle, Loader2 } from 'lucide-react';

export function PosReturns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  // Local state for return quantities map (productId -> qtyToReturn)
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch sales list matching search from backend
  const { data: salesResult, isLoading: loadingSales } = useSalesQuery({
    search: searchQuery || undefined,
  });
  const sales = salesResult?.data ?? [];

  // Fetch detailed sale item information when an invoice is selected
  const { data: selectedSale, isLoading: loadingDetails } = useSaleQuery(selectedInvoice || '');

  // Initialize return quantities
  useEffect(() => {
    if (selectedSale) {
      const initialQty: Record<string, number> = {};
      selectedSale.items.forEach((item: any) => {
        initialQty[item.productId] = 0;
      });
      setReturnQuantities(initialQty);
    }
    setSuccessMessage(null);
  }, [selectedSale]);

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoice(id);
  };

  const handleQtyChange = (productId: string, change: number, maxQty: number) => {
    setReturnQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + change));
      return { ...prev, [productId]: next };
    });
  };

  const returnMutation = useReturnSaleMutation(selectedInvoice || '');

  const handleReturnSubmit = () => {
    if (!selectedSale) return;

    const itemsToReturn = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({
        productId,
        quantity: qty,
      }));

    if (itemsToReturn.length > 0) {
      returnMutation.mutate({
        items: itemsToReturn,
        refundAmountCents: Math.round(refundPreview * 100),
        notes: 'POS return',
      }, {
        onSuccess: () => {
          setSuccessMessage('পণ্য ফেরত সফলভাবে সম্পন্ন হয়েছে ও স্টক আপডেট করা হয়েছে।');
          setReturnQuantities({});
        },
        onError: (err: any) => {
          alert(err.message || 'ফেরত সম্পন্ন করতে সমস্যা হয়েছে।');
        }
      });
    } else {
      alert('অনুগ্রহ করে ফেরত দেওয়ার জন্য কমপক্ষে ১টি পণ্যের পরিমাণ নির্বাচন করুন।');
    }
  };

  const handleVoidSubmit = () => {
    if (!selectedSale) return;
    if (confirm('আপনি কি নিশ্চিত যে এই সম্পূর্ণ চালানটি বাতিল (Void) করতে চান? এটি ক্যাশ এবং ডিউ ব্যালেন্স রিভার্স করবে।')) {
      returnMutation.mutate({
        items: [], // Empty items array triggers full return (void) in backend
        refundAmountCents: selectedSale.paidCents,
        notes: 'POS Void',
      }, {
        onSuccess: () => {
          setSuccessMessage('চালানটি সফলভাবে বাতিল (Void) করা হয়েছে।');
        },
        onError: (err: any) => {
          alert(err.message || 'চালান বাতিল করতে সমস্যা হয়েছে।');
        }
      });
    }
  };

  // Calculate proportional refund preview
  const calculateRefundPreview = () => {
    if (!selectedSale) return 0;
    let totalReturnedPrice = 0;
    Object.entries(returnQuantities).forEach(([productId, qty]) => {
      const item = selectedSale.items.find((i: any) => i.productId === productId);
      if (item) {
        totalReturnedPrice += (item.unitPriceCents / 100) * qty;
      }
    });

    const totalAmount = selectedSale.totalCents / 100;
    const discountAmount = selectedSale.discountAmountCents / 100;
    const taxAmount = selectedSale.taxAmountCents / 100;

    const discountRatio = totalAmount > 0 ? (discountAmount / totalAmount) : 0;
    const proportionalDiscount = totalReturnedPrice * discountRatio;
    const proportionalTax = (totalReturnedPrice - proportionalDiscount) * (taxAmount / (totalAmount - discountAmount || 1));
    
    return Math.round(totalReturnedPrice - proportionalDiscount + proportionalTax);
  };

  const refundPreview = calculateRefundPreview();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full text-xs">
      {/* Left Column: Invoice Lookup List */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 h-full">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800">বিক্রয় চালান অনুসন্ধান</h3>
          <p className="text-[10px] text-slate-400 font-medium">Search & Select Past Invoice Transactions</p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="চালান নম্বর বা কাস্টমার ফোন দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Invoice list */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
          {loadingSales ? (
            <div className="text-center py-10">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
              <p className="text-slate-400 mt-2">লোড হচ্ছে...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              কোনো বিক্রয় চালান পাওয়া যায়নি।
            </div>
          ) : (
            sales.map((sale) => {
              const isSelected = selectedInvoice === sale.id;
              return (
                <button
                  key={sale.id}
                  onClick={() => handleSelectInvoice(sale.id)}
                  className={`w-full p-3 border rounded-xl text-left transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-slate-800">{sale.invoiceNumber}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(sale.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-655">
                    <span>কাস্টমার: {sale.customerName || 'Walk-in'}</span>
                    <span className="font-sans font-extrabold text-slate-800">{formatTaka(sale.totalCents / 100)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      sale.status === 'VOID'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : sale.status === 'RETURNED'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {sale.status === 'VOID' ? 'বাতিলকৃত (Void)' : sale.status === 'RETURNED' ? 'ফেরতকৃত (Returned)' : 'পরিশোধিত (Success)'}
                    </span>
                    
                    {sale.dueCents > 0 && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        বাকি: {formatTaka(sale.dueCents / 100)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Invoice Details & Action Panel */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 min-h-[400px]">
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-slate-400 font-bold">চালানের বিবরণ লোড হচ্ছে...</p>
          </div>
        ) : !selectedSale ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-450 font-bold">
            <RotateCcw className="h-10 w-10 text-slate-200 mb-2" />
            <p>কোনো চালান নির্বাচন করা হয়নি</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">অনুসন্ধান করে বামদিকের তালিকা থেকে একটি চালান নির্বাচন করুন</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black text-slate-800 font-mono">{selectedSale.invoiceNumber} এর বিবরণ</h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {new Date(selectedSale.createdAt).toLocaleString('en-US')} • {selectedSale.id}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleVoidSubmit}
                  disabled={selectedSale.status === 'VOID' || selectedSale.status === 'RETURNED' || returnMutation.isPending}
                  className="h-8 px-2.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-650 text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>চালান বাতিল করুন</span>
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-3 text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Receipt Summary info */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] font-semibold text-slate-650">
              <div>
                <p className="text-slate-400 text-[9px] uppercase">মোট মূল্য</p>
                <p className="font-sans font-extrabold text-slate-700">{formatTaka(selectedSale.subtotalCents / 100)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] uppercase">প্রদেয় টাকা</p>
                <p className="font-sans font-extrabold text-slate-700">{formatTaka(selectedSale.totalCents / 100)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] uppercase">পরিশোধের ধরণ</p>
                <p className="text-primary font-bold">{selectedSale.dueCents > 0 ? 'আংশিক/বাকি' : 'নগদ ক্যাশ'}</p>
              </div>
            </div>

            {/* Items Table / Return selectors */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-700">আইটেম ফেরত তালিকা</h5>
              
              {selectedSale.status === 'VOID' || selectedSale.status === 'RETURNED' ? (
                <div className="text-center py-6 border border-dashed border-red-100 rounded-xl bg-red-50/10 text-red-600 text-[11px] font-semibold">
                  চালানটি বাতিল বা ফেরত সম্পন্ন করা হয়েছে। এতে আর কোনো ফেরত প্রযোজ্য নয়।
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedSale.items.map((item: any, idx: number) => {
                    const remainingQty = item.quantity;
                    const toReturn = returnQuantities[item.productId] || 0;

                    return (
                      <div key={idx} className="p-3 bg-white hover:bg-slate-50/20 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate leading-none mb-1">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold leading-none">
                            ক্রয়কৃত পরিমাণ: {item.quantity} {item.unit || 'pcs'}
                          </p>
                        </div>

                        {/* Return Qty Control */}
                        {remainingQty > 0 ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleQtyChange(item.productId, -1, remainingQty)}
                              disabled={toReturn === 0 || returnMutation.isPending}
                              className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95 disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-extrabold text-slate-800 font-sans">
                              {toReturn}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.productId, 1, remainingQty)}
                              disabled={toReturn >= remainingQty || returnMutation.isPending}
                              className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">সম্পূর্ণ ফেরত</span>
                        )}

                        <div className="text-right shrink-0 min-w-[60px] font-sans font-extrabold text-slate-700">
                          {formatTaka(item.unitPriceCents / 100)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calculations & Submit */}
            {selectedSale.status !== 'VOID' && selectedSale.status !== 'RETURNED' && selectedSale.items.some((i: any) => i.quantity > 0) && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-650">
                  <span>ফেরতযোগ্য প্রদেয় অর্থ (Refund Amount):</span>
                  <span className="text-base font-black text-emerald-700 font-sans">{formatTaka(refundPreview)}</span>
                </div>

                <button
                  onClick={handleReturnSubmit}
                  disabled={refundPreview === 0 || returnMutation.isPending}
                  className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100 shadow-sm cursor-pointer"
                >
                  {returnMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>পণ্য ফেরত সম্পন্ন করুন</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
