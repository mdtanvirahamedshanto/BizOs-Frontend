import React from 'react';
import { TopProductItem } from '../api/dashboard-api';
import { formatTaka } from './kpi-cards';

interface TopProductsProps {
  products: TopProductItem[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs h-full">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">সর্বোচ্চ বিক্রিত প্রোডাক্ট</h3>
        <p className="text-[10px] text-slate-400 font-medium">Top Selling Stock Items</p>
      </div>

      <div className="space-y-4">
        {products.map((prod, idx) => {
          // Determine stock level status
          const isLowStock = prod.stockRemaining <= 5;
          
          return (
            <div key={prod.id} className="flex flex-col gap-1.5 pb-3 last:pb-0 last:border-b-0 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate leading-none mb-1 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    {prod.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium ml-7 leading-none">
                    বিক্রি: {prod.salesCount} {prod.unit}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-700 leading-none mb-1">
                    {formatTaka(prod.revenue)}
                  </p>
                  <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    isLowStock 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    স্টক: {prod.stockRemaining} {prod.unit} {isLowStock ? 'বাকি' : ''}
                  </span>
                </div>
              </div>
              
              {/* stock remaining progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden ml-7 max-w-[calc(100%-28px)]">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLowStock ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((prod.stockRemaining / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
