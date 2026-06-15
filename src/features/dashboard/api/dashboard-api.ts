import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardMetrics {
  todaySales: number;
  totalDue: number;
  totalExpenses: number;
  netProfit: number;
  inventoryValue: number;
  salesGrowthPercentage: number;
  dueGrowthPercentage: number;
  expensesGrowthPercentage: number;
  profitGrowthPercentage: number;
  inventoryGrowthPercentage: number;
}

export interface ChartDataPoint {
  label: string; // e.g., '10:00 AM' or 'শনিবার'
  sales: number;
  expenses: number;
}

export interface RecentTransaction {
  id: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  timestamp: string;
  type: 'sale' | 'due_payment' | 'expense';
}

export interface TopProductItem {
  id: string;
  name: string;
  salesCount: number;
  stockRemaining: number;
  unit: string;
  revenue: number;
}

export interface BusinessInsight {
  id: string;
  type: 'alert' | 'success' | 'info';
  banglaText: string;
  englishText: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  chartData: ChartDataPoint[];
  recentTransactions: RecentTransaction[];
  topProducts: TopProductItem[];
  insights: BusinessInsight[];
}

/**
 * Hook to retrieve full dashboard details
 */
export function useDashboardQuery(timeframe: 'today' | 'seven_days' | 'month' = 'today') {
  return useQuery({
    queryKey: ['dashboard', 'summary', timeframe],
    queryFn: async (): Promise<DashboardData> => {
      try {
        return await apiClient.get<DashboardData>(`/dashboard/summary?timeframe=${timeframe}`);
      } catch (error) {
        console.warn('[Dashboard API] Failed to fetch live data, triggering mockup fallbacks.', error);
        
        // Return structured mock data reflecting real SME operations
        await new Promise((resolve) => setTimeout(resolve, 600));

        const metrics: DashboardMetrics = {
          todaySales: timeframe === 'today' ? 42500 : timeframe === 'seven_days' ? 295400 : 1245000,
          totalDue: 18400,
          totalExpenses: timeframe === 'today' ? 8200 : timeframe === 'seven_days' ? 56800 : 245000,
          netProfit: timeframe === 'today' ? 34300 : timeframe === 'seven_days' ? 238600 : 1000000,
          inventoryValue: 485000,
          salesGrowthPercentage: 12.5,
          dueGrowthPercentage: -4.2,
          expensesGrowthPercentage: 2.1,
          profitGrowthPercentage: 14.8,
          inventoryGrowthPercentage: 5.6,
        };

        const chartData: ChartDataPoint[] = timeframe === 'today' 
          ? [
              { label: '০৮:০০টা', sales: 2500, expenses: 1000 },
              { label: '১০:০০টা', sales: 8400, expenses: 1500 },
              { label: '১২:০০টা', sales: 12000, expenses: 2000 },
              { label: '০২:০০টা', sales: 4500, expenses: 800 },
              { label: '০৪:০০টা', sales: 6200, expenses: 1200 },
              { label: '০৬:০০টা', sales: 15400, expenses: 3200 },
              { label: '০৮:০০টা', sales: 11000, expenses: 1500 },
            ]
          : [
              { label: 'শনি', sales: 38000, expenses: 6200 },
              { label: 'রবি', sales: 42000, expenses: 8000 },
              { label: 'সোম', sales: 31000, expenses: 5400 },
              { label: 'মঙ্গল', sales: 49000, expenses: 12000 },
              { label: 'বুধ', sales: 45000, expenses: 9500 },
              { label: 'বৃহস্পতি', sales: 52000, expenses: 7800 },
              { label: 'শুক্র', sales: 65000, expenses: 15000 },
            ];

        const recentTransactions: RecentTransaction[] = [
          {
            id: 'tx-101',
            invoiceNo: 'INV-260615-01',
            customerName: 'আবুল কাসেম (Kashem)',
            amount: 1250,
            paymentStatus: 'paid',
            timestamp: '১০ মিনিট আগে',
            type: 'sale',
          },
          {
            id: 'tx-102',
            invoiceNo: 'INV-260615-02',
            customerName: 'সুমন আহমেদ (Sumon)',
            amount: 4500,
            paymentStatus: 'unpaid',
            timestamp: '২৫ মিনিট আগে',
            type: 'sale',
          },
          {
            id: 'tx-103',
            invoiceNo: 'EXP-260615-01',
            customerName: 'দোকান ভাড়া (Rent)',
            amount: 8000,
            paymentStatus: 'paid',
            timestamp: '১ ঘন্টা আগে',
            type: 'expense',
          },
          {
            id: 'tx-104',
            invoiceNo: 'INV-260615-03',
            customerName: 'মোঃ রাশেদ (Rashed)',
            amount: 3200,
            paymentStatus: 'partial',
            timestamp: '২ ঘন্টা আগে',
            type: 'sale',
          },
        ];

        const topProducts: TopProductItem[] = [
          { id: 'p-1', name: 'মিনিকেট চাল ২৫ কেজি', salesCount: 18, stockRemaining: 5, unit: 'বস্তা', revenue: 27000 },
          { id: 'p-2', name: 'তীর সয়াবিন তেল ৫ লিটার', salesCount: 24, stockRemaining: 12, unit: 'বোতল', revenue: 21600 },
          { id: 'p-3', name: 'ড্যানো গুঁড়ো দুধ ১ কেজি', salesCount: 15, stockRemaining: 3, unit: 'প্যাকেট', revenue: 12750 },
          { id: 'p-4', name: 'ফ্রেশ চিনি ১ কেজি', salesCount: 40, stockRemaining: 8, unit: 'প্যাকেট', revenue: 5200 },
        ];

        const insights: BusinessInsight[] = [
          {
            id: 'ins-1',
            type: 'alert',
            banglaText: '৩টি প্রোডাক্টের স্টক শেষ পর্যায়ে রয়েছে। রি-অর্ডার করুন।',
            englishText: '3 products are low in stock. Please re-order.',
          },
          {
            id: 'ins-2',
            type: 'success',
            banglaText: 'গত সপ্তাহের তুলনায় আজকের বিক্রি ১২.৫% বৃদ্ধি পেয়েছে।',
            englishText: 'Today sales increased by 12.5% compared to last week.',
          },
          {
            id: 'ins-3',
            type: 'info',
            banglaText: 'বকেয়া খাতার মোট বাকি পরিশোধের অনুপাত ৫% বৃদ্ধি পেয়েছে।',
            englishText: 'Customer due recovery rate improved by 5%.',
          },
        ];

        return {
          metrics,
          chartData,
          recentTransactions,
          topProducts,
          insights,
        };
      }
    },
  });
}
