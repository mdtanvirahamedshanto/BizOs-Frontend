'use client';

import React from 'react';
import { useInventoryLedgerQuery } from '../api/inventory-api';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldAlert, 
  ShoppingBag, 
  Calendar, 
  User, 
  Loader2 
} from 'lucide-react';

interface InventoryLedgerProps {
  productId: string;
}

export function InventoryLedger({ productId }: InventoryLedgerProps) {
  const { data: ledger, isLoading } = useInventoryLedgerQuery(productId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!ledger || ledger.length === 0) {
    return (
      <p className="text-xs text-center text-slate-400 font-semibold py-8 bg-slate-50 rounded-xl border border-dashed border-slate-100">
        এই প্রোডাক্টের কোনো স্টক মুভমেন্ট রেকর্ড পাওয়া যায়নি।
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-b border-slate-100 pb-2 mb-3">
        <h4 className="text-xs font-bold text-slate-700">স্টক খাতা ও বিবরণী (Ledger)</h4>
        <p className="text-[9px] text-slate-400 font-medium">Audit History of Stock Variations</p>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
        {ledger.map((item) => {
          const isAdd = item.type === 'stock_in';
          const isSale = item.type === 'sale';
          const isDamage = item.type === 'damage';
          
          return (
            <div 
              key={item.id} 
              className={`p-3 rounded-xl border flex items-start justify-between text-xs transition-all hover:bg-slate-50/50 ${
                isAdd 
                  ? 'bg-emerald-50/20 border-emerald-100' 
                  : isDamage 
                  ? 'bg-amber-50/20 border-amber-100' 
                  : 'bg-slate-50/50 border-slate-100'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    isAdd 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isSale 
                      ? 'bg-primary/10 text-primary'
                      : isDamage 
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isAdd ? 'স্টক ইন' : isSale ? 'বিক্রি (POS)' : isDamage ? 'নষ্ট/ক্ষতিগ্রস্ত' : 'সমন্বয়'}
                  </span>
                  
                  <span className="text-[10px] text-slate-400 font-bold leading-none flex items-center gap-0.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {item.timestamp}
                  </span>
                </div>

                <p className="font-bold text-slate-700 leading-tight mb-1">
                  {item.reason}
                </p>

                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                  <User className="h-2.5 w-2.5" />
                  <span>এন্ট্রি করেছেন: {item.operator}</span>
                </div>
              </div>

              {/* Delta change Qty */}
              <div className="text-right shrink-0">
                <p className={`font-black text-sm ${isAdd ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {item.quantityDelta > 0 ? '+' : ''}{item.quantityDelta}
                </p>
                <span className="text-[9px] text-slate-400 font-bold">
                  অবশিষ্ট স্টক: {item.balanceAfter}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
