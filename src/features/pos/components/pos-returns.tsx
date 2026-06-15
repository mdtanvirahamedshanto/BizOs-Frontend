'use client';

import React, { useState } from 'react';
import { usePOSHistoryStore } from '../stores/use-pos-history';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { Search, RotateCcw, Ban, Trash2, Calendar, User, ShoppingBag, ArrowLeft, Plus, Minus, CheckCircle } from 'lucide-react';

export function PosReturns() {
  const { sales, returnSaleItem, voidSale } = usePOSHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  // Local state for return quantities map (itemName -> qtyToReturn)
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter sales based on search query
  const filteredSales = sales.filter((s) => 
    s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSale = sales.find((s) => s.invoiceNo === selectedInvoice);

  const handleSelectInvoice = (invoiceNo: string) => {
    setSelectedInvoice(invoiceNo);
    const sale = sales.find((s) => s.invoiceNo === invoiceNo);
    if (sale) {
      // Initialize return quantities to 0
      const initialQty: Record<string, number> = {};
      sale.items.forEach((item) => {
        initialQty[item.name] = 0;
      });
      setReturnQuantities(initialQty);
    }
    setSuccessMessage(null);
  };

  const handleQtyChange = (itemName: string, change: number, maxQty: number) => {
    setReturnQuantities((prev) => {
      const current = prev[itemName] || 0;
      const next = Math.max(0, Math.min(maxQty, current + change));
      return { ...prev, [itemName]: next };
    });
  };

  const handleReturnSubmit = () => {
    if (!selectedSale) return;

    let itemsReturnedCount = 0;
    Object.entries(returnQuantities).forEach(([itemName, qty]) => {
      if (qty > 0) {
        returnSaleItem(selectedSale.invoiceNo, itemName, qty);
        itemsReturnedCount += qty;
      }
    });

    if (itemsReturnedCount > 0) {
      setSuccessMessage('পণ্য ফেরত সফলভাবে সম্পন্ন হয়েছে ও স্টক আপডেট করা হয়েছে।');
      // Reset return quantities to 0
      const updatedSale = sales.find((s) => s.invoiceNo === selectedInvoice);
      if (updatedSale) {
        const initialQty: Record<string, number> = {};
        updatedSale.items.forEach((item) => {
          initialQty[item.name] = 0;
        });
        setReturnQuantities(initialQty);
      }
    } else {
      alert('অনুগ্রহ করে ফেরত দেওয়ার জন্য কমপক্ষে ১টি পণ্যের পরিমাণ নির্বাচন করুন।');
    }
  };

  const handleVoidSubmit = () => {
    if (!selectedSale) return;
    if (confirm('আপনি কি নিশ্চিত যে এই সম্পূর্ণ চালানটি বাতিল (Void) করতে চান? এটি ক্যাশ এবং ডিউ ব্যালেন্স রিভার্স করবে।')) {
      voidSale(selectedSale.invoiceNo);
      setSuccessMessage('চালানটি সফলভাবে বাতিল (Void) করা হয়েছে।');
    }
  };

  // Calculate proportional refund preview
  const calculateRefundPreview = () => {
    if (!selectedSale) return 0;
    let totalReturnedPrice = 0;
    Object.entries(returnQuantities).forEach(([itemName, qty]) => {
      const item = selectedSale.items.find((i) => i.name === itemName);
      if (item) {
        totalReturnedPrice += item.price * qty;
      }
    });

    const discountRatio = selectedSale.totalAmount > 0 ? (selectedSale.discountAmount / selectedSale.totalAmount) : 0;
    const proportionalDiscount = totalReturnedPrice * discountRatio;
    const proportionalTax = (totalReturnedPrice - proportionalDiscount) * (selectedSale.taxAmount / (selectedSale.totalAmount - selectedSale.discountAmount || 1));
    
    return Math.round(totalReturnedPrice - proportionalDiscount + proportionalTax);
  };

  const refundPreview = calculateRefundPreview();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
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
            placeholder="চালান নম্বর দিয়ে খুঁজুন (যেমন: BOS-)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Invoice list */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
          {filteredSales.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              কোনো বিক্রয় চালান পাওয়া যায়নি।
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isSelected = selectedInvoice === sale.invoiceNo;
              return (
                <button
                  key={sale.invoiceNo}
                  onClick={() => handleSelectInvoice(sale.invoiceNo)}
                  className={`w-full p-3 border rounded-xl text-left transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-slate-800">{sale.invoiceNo}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{sale.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-slate-400" />
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} টি পণ্য
                    </span>
                    <span className="font-sans font-extrabold text-slate-800">{formatTaka(sale.netPayable)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      sale.isVoided
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : sale.isReturned
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {sale.isVoided ? 'বাতিলকৃত (Voided)' : sale.isReturned ? 'ফেরতকৃত (Returned)' : 'পরিশোধিত (Success)'}
                    </span>
                    
                    {sale.dueAmount > 0 && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        বাকি: {formatTaka(sale.dueAmount)}
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
        {!selectedSale ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <RotateCcw className="h-10 w-10 text-slate-200 mb-2" />
            <p className="text-xs font-bold">কোনো চালান নির্বাচন করা হয়নি</p>
            <p className="text-[10px] text-slate-400 mt-1">অনুসন্ধান করে বামদিকের তালিকা থেকে একটি চালান নির্বাচন করুন</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black text-slate-800 font-mono">{selectedSale.invoiceNo} এর বিবরণ</h4>
                <p className="text-[10px] text-slate-400 font-medium">{selectedSale.timestamp} • {selectedSale.transactionId}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleVoidSubmit}
                  disabled={selectedSale.isVoided}
                  className="h-8 px-2.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:hover:bg-transparent"
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
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] font-semibold text-slate-600">
              <div>
                <p className="text-slate-400 text-[9px] uppercase">মোট মূল্য</p>
                <p className="font-sans font-extrabold text-slate-700">{formatTaka(selectedSale.totalAmount)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] uppercase">প্রদেয় টাকা</p>
                <p className="font-sans font-extrabold text-slate-700">{formatTaka(selectedSale.netPayable)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] uppercase">পরিশোধের ধরণ</p>
                <p className="text-primary font-bold">{selectedSale.dueAmount > 0 ? 'আংশিক/বাকি' : 'নগদ ক্যাশ'}</p>
              </div>
            </div>

            {/* Items Table / Return selectors */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-700">আইটেম ফেরত তালিকা</h5>
              
              {selectedSale.isVoided ? (
                <div className="text-center py-6 border border-dashed border-red-100 rounded-xl bg-red-50/10 text-red-600 text-[11px] font-semibold">
                  চালানটি বাতিল করা হয়েছে। এতে কোনো ফেরত প্রযোজ্য নয়।
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedSale.items.map((item, idx) => {
                    const remainingQty = item.quantity;
                    const returnedQty = item.returnedQuantity || 0;
                    const toReturn = returnQuantities[item.name] || 0;

                    return (
                      <div key={idx} className="p-3 bg-white hover:bg-slate-50/20 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate leading-none mb-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold leading-none">
                            ক্রয়: {item.quantity} {item.unit} • ফেরত: {returnedQty} {item.unit}
                          </p>
                        </div>

                        {/* Return Qty Control */}
                        {remainingQty > 0 ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleQtyChange(item.name, -1, remainingQty)}
                              disabled={toReturn === 0}
                              className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95 disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-extrabold text-slate-800 font-sans">
                              {toReturn}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.name, 1, remainingQty)}
                              disabled={toReturn >= remainingQty}
                              className="h-7 w-7 border border-slate-200 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 font-extrabold active:scale-95 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 italic">সম্পূর্ণ ফেরত</span>
                        )}

                        <div className="text-right shrink-0 min-w-[60px] font-sans font-extrabold text-slate-700">
                          {formatTaka(item.price)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calculations & Submit */}
            {!selectedSale.isVoided && selectedSale.items.some(i => i.quantity > 0) && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
                  <span>ফেরতযোগ্য প্রদেয় অর্থ (Refund Amount):</span>
                  <span className="text-base font-black text-emerald-700 font-sans">{formatTaka(refundPreview)}</span>
                </div>

                <button
                  onClick={handleReturnSubmit}
                  disabled={refundPreview === 0}
                  className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>পণ্য ফেরত সম্পন্ন করুন</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
