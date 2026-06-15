import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ReportTimeframe, ReportSummaryMetrics, ProfitReportRow, ExpenseReportRow, InventoryReportRow, DueReportRow } from '../types';

export interface ReportsResult {
  metrics: ReportSummaryMetrics;
  profitRows: ProfitReportRow[];
  expenseRows: ExpenseReportRow[];
  inventoryRows: InventoryReportRow[];
  dueRows: DueReportRow[];
  chartData: { label: string; sales: number; cost: number; expense: number }[];
}

const MOCK_PROFIT_ROWS: ProfitReportRow[] = [
  { id: 'pr-1', timestamp: '2026-06-15 10:15', description: 'মেমো চালান BOS-48201934', salesAmount: 2400, costPrice: 2160, grossProfit: 240, marginPercentage: 10 },
  { id: 'pr-2', timestamp: '2026-06-15 09:30', description: 'মেমো চালান BOS-73910482', salesAmount: 850, costPrice: 765, grossProfit: 85, marginPercentage: 10 },
  { id: 'pr-3', timestamp: '2026-06-14 18:20', description: 'মেমো চালান BOS-10293847', salesAmount: 5200, costPrice: 4680, grossProfit: 520, marginPercentage: 10 },
  { id: 'pr-4', timestamp: '2026-06-13 15:45', description: 'মেমো চালান BOS-28374619', salesAmount: 1500, costPrice: 1350, grossProfit: 150, marginPercentage: 10 },
  { id: 'pr-5', timestamp: '2026-06-12 11:10', description: 'মেমো চালান BOS-90182736', salesAmount: 8500, costPrice: 7400, grossProfit: 1100, marginPercentage: 12.94 },
];

const MOCK_EXPENSE_ROWS: ExpenseReportRow[] = [
  { id: 'ex-1', category: 'দোকান ভাড়া (Rent)', description: 'জুন ২০২৬ মাসের দোকান ভাড়া পরিশোধ', amount: 12000, paymentMode: 'bank', timestamp: '2026-06-05 11:00' },
  { id: 'ex-2', category: 'বিদ্যুৎ বিল (Electricity)', description: 'মে ২০২৬ বিদ্যুৎ বিল পরিশোধ', amount: 2450, paymentMode: 'bkash', timestamp: '2026-06-08 14:30' },
  { id: 'ex-3', category: 'কর্মচারী বেতন (Wages)', description: 'সহকারী ক্যাশিয়ার জুন মাসের অগ্রিম বেতন', amount: 5000, paymentMode: 'cash', timestamp: '2026-06-10 17:00' },
  { id: 'ex-4', category: 'পরিবহন খরচ (Transport)', description: 'মালপত্র আনয়ন ভাড়া (কারওয়ান বাজার হতে)', amount: 1500, paymentMode: 'cash', timestamp: '2026-06-12 09:00' },
  { id: 'ex-5', category: 'অন্যান্য (Others)', description: 'দোকানের জন্য চা-নাস্তা খরচ', amount: 350, paymentMode: 'nagad', timestamp: '2026-06-14 16:15' },
];

const MOCK_INVENTORY_ROWS: InventoryReportRow[] = [
  { id: 'p-1', productName: 'মিনিকেট চাল ২৫ কেজি', sku: 'MC-25', price: 1500, costPrice: 1350, stockCount: 5, unit: 'বস্তা', stockValueCost: 6750, stockValueRetail: 7500 },
  { id: 'p-2', productName: 'তীর সয়াবিন তেল ৫ লিটার', sku: 'TSO-5', price: 900, costPrice: 810, stockCount: 12, unit: 'বোতল', stockValueCost: 9720, stockValueRetail: 10800 },
  { id: 'p-3', productName: 'ড্যানো গুঁড়ো দুধ ১ কেজি', sku: 'DGM-1', price: 850, costPrice: 765, stockCount: 3, unit: 'প্যাকেট', stockValueCost: 2295, stockValueRetail: 2550 },
  { id: 'p-4', productName: 'ফ্রেশ চিনি ১ কেজি', sku: 'FC-1', price: 130, costPrice: 118, stockCount: 8, unit: 'প্যাকেট', stockValueCost: 944, stockValueRetail: 1040 },
  { id: 'p-5', productName: 'এলইডি বাল্ব ১৮ ওয়াট', sku: 'LB-18', price: 280, costPrice: 220, stockCount: 15, unit: 'পিস', stockValueCost: 3300, stockValueRetail: 4200 },
];

const MOCK_DUE_ROWS: DueReportRow[] = [
  { id: 'cust-1', customerName: 'মোঃ আব্দুর রহমান (Rahman)', phone: '01711223344', dueAmount: 5200, lastPaymentDate: '2026-06-05', notes: 'বিশ্বস্ত কাস্টমার' },
  { id: 'cust-2', customerName: 'আবুল কালাম (Kalam)', phone: '01819876543', dueAmount: 12000, lastPaymentDate: '2026-05-20', notes: 'পাইকারি ক্রেতা' },
  { id: 'cust-4', customerName: 'রাসেল মিয়া (Rasel)', phone: '01912344321', dueAmount: 1200, lastPaymentDate: '2026-06-14', notes: 'আংশিক বকেয়া' },
];

const MOCK_CHART_DATA = [
  { label: 'শনিবার', sales: 15000, cost: 13200, expense: 1200 },
  { label: 'রবিবার', sales: 18500, cost: 16100, expense: 350 },
  { label: 'সোমবার', sales: 12000, cost: 10500, expense: 5000 },
  { label: 'মঙ্গলবার', sales: 22000, cost: 19000, expense: 1500 },
  { label: 'বুধবার', sales: 25400, cost: 21800, expense: 350 },
  { label: 'বৃহস্পতিবার', sales: 29000, cost: 24500, expense: 2450 },
  { label: 'শুক্রবার', sales: 32000, cost: 27000, expense: 12000 },
];

/**
 * Hook to retrieve full business reports and stats
 */
export function useReportsQuery(timeframe: ReportTimeframe, startDate = '', endDate = '') {
  return useQuery({
    queryKey: ['reports', timeframe, startDate, endDate],
    queryFn: async (): Promise<ReportsResult> => {
      try {
        let url = `/reports?timeframe=${timeframe}`;
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        return await apiClient.get<ReportsResult>(url);
      } catch (error) {
        console.warn('[Reports API] Using mock statistics.', error);
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Scale mock numbers depending on timeframe
        let multiplier = 1;
        if (timeframe === 'weekly') multiplier = 7;
        else if (timeframe === 'monthly') multiplier = 30;

        const totalSales = Math.round(18450 * multiplier);
        const costPrice = Math.round(16200 * multiplier);
        const grossProfit = totalSales - costPrice;
        const totalExpense = Math.round(1250 * multiplier) + 12000; // adding rent bias
        const netProfit = grossProfit - totalExpense;

        const metrics: ReportSummaryMetrics = {
          totalSales,
          costPrice,
          grossProfit,
          totalExpense,
          netProfit,
          totalCustomerDues: 18400,
          totalSupplierDues: 23400,
          lowStockItemsCount: 3,
        };

        return {
          metrics,
          profitRows: MOCK_PROFIT_ROWS.map(row => ({
            ...row,
            salesAmount: Math.round(row.salesAmount * (multiplier > 1 ? multiplier * 0.6 : 1)),
            costPrice: Math.round(row.costPrice * (multiplier > 1 ? multiplier * 0.6 : 1)),
            grossProfit: Math.round(row.grossProfit * (multiplier > 1 ? multiplier * 0.6 : 1)),
          })),
          expenseRows: MOCK_EXPENSE_ROWS,
          inventoryRows: MOCK_INVENTORY_ROWS,
          dueRows: MOCK_DUE_ROWS,
          chartData: MOCK_CHART_DATA,
        };
      }
    },
  });
}
