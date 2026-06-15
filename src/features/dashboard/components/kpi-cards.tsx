import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  BookOpen, 
  CreditCard, 
  PiggyBank, 
  Boxes 
} from 'lucide-react';
import { DashboardMetrics } from '../api/dashboard-api';

interface KpiCardsProps {
  metrics: DashboardMetrics;
}

/**
 * Helper to format numbers into Bangladeshi Taka (৳) formatting.
 * Using Bengali digits.
 */
export function formatTaka(amount: number): string {
  // Simple check to render Taka symbol with commas
  const formattedEn = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return `৳${formattedEn}`;
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      title: 'আজকের বিক্রি',
      sub: 'Today\'s Sales',
      value: formatTaka(metrics.todaySales),
      growth: metrics.salesGrowthPercentage,
      icon: ShoppingBag,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'মোট বাকি (বকেয়া)',
      sub: 'Total Due',
      value: formatTaka(metrics.totalDue),
      growth: metrics.dueGrowthPercentage,
      icon: CreditCard,
      color: 'text-red-600 bg-red-50 border-red-100',
    },
    {
      title: 'আজকের খরচ',
      sub: 'Today\'s Expenses',
      value: formatTaka(metrics.totalExpenses),
      growth: metrics.expensesGrowthPercentage,
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'নিট লাভ',
      sub: 'Net Profit',
      value: formatTaka(metrics.netProfit),
      growth: metrics.profitGrowthPercentage,
      icon: PiggyBank,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'স্টক প্রোডাক্টের মূল্য',
      sub: 'Inventory Value',
      value: formatTaka(metrics.inventoryValue),
      growth: metrics.inventoryGrowthPercentage,
      icon: Boxes,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        
        return (
          <div 
            key={idx} 
            className={`bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 ${
              // Let last card span full width on small screens to balance 5 columns
              idx === 4 ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 leading-none mb-1">
                  {card.title}
                </p>
                <p className="text-[9px] text-slate-400 font-medium leading-none mb-3">
                  {card.sub}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1.5 font-sans">
                {card.value}
              </h3>
              
              {/* Growth badge */}
              <div className="flex items-center gap-1">
                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isPositive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 text-red-500" />
                  )}
                  {Math.abs(card.growth)}%
                </span>
                <span className="text-[9px] text-slate-400 font-medium">গতদিন তুলনায়</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
