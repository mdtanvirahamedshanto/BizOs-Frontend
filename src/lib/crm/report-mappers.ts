import type {
  DailySalesReport,
  MonthlySalesReport,
  ProfitReport,
  InventoryReport,
  DueReport,
  Expense,
} from '@/lib/api';
import { centsToTaka } from './money';
import type {
  DashboardMetrics,
  DashboardData,
  ChartDataPoint,
  RecentTransaction,
  TopProductItem,
  BusinessInsight,
} from '@/features/dashboard/api/dashboard-api';
import type {
  ReportSummaryMetrics,
  ProfitReportRow,
  ExpenseReportRow,
  InventoryReportRow,
  DueReportRow,
  ReportTimeframe,
} from '@/features/reports/types';

/** Backend dashboard payload from GET /reports/dashboard */
export interface BackendDashboardPayload {
  timeframe: string;
  kpis: {
    revenue: { current: number; previous: number; changePercent: number };
    saleCount: { current: number; previous: number; changePercent: number };
    grossProfit: { current: number; previous: number; changePercent: number };
    netProfit: { current: number; previous: number; changePercent: number };
    expenses: { current: number; previous: number; changePercent: number };
    grossMarginPercent: number;
    netMarginPercent: number;
    averageTicketCents: number;
  };
  revenueTrend: Array<{ date: string; revenueCents: number; saleCount: number }>;
  expenseDistribution: Array<{
    categoryId: string | null;
    categoryName: string;
    color: string | null;
    amountCents: number;
  }>;
  balances: { cashbookCents: number; mfsCents: number; flexiloadCents: number };
  recent: {
    sales: Array<{
      id: string;
      invoiceNumber: string;
      totalCents: number;
      paidCents: number;
      dueCents: number;
      paymentStatus: string;
      saleDate: string;
      customer?: { name: string } | null;
    }>;
    payments: Array<{
      id: string;
      amountCents: number;
      method: string;
      createdAt: string;
      reference?: string;
    }>;
    expenses: Array<{
      id: string;
      title: string;
      amountCents: number;
      expenseDate: string;
      category?: { name: string } | null;
    }>;
  };
}

export function mapUiTimeframeToBackend(
  timeframe: 'today' | 'seven_days' | 'month',
): 'today' | 'this_week' | 'this_month' {
  if (timeframe === 'seven_days') return 'this_week';
  if (timeframe === 'month') return 'this_month';
  return 'today';
}

export function mapReportTimeframeToBackend(
  timeframe: ReportTimeframe,
): 'today' | 'this_week' | 'this_month' {
  if (timeframe === 'weekly') return 'this_week';
  if (timeframe === 'monthly') return 'this_month';
  return 'today';
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘন্টা আগে`;
  return date.toLocaleDateString('bn-BD');
}

export function backendDashboardToView(payload: BackendDashboardPayload): DashboardData {
  const { kpis, revenueTrend, recent, expenseDistribution } = payload;

  const metrics: DashboardMetrics = {
    todaySales: centsToTaka(kpis.revenue.current),
    totalDue: 0,
    totalExpenses: centsToTaka(kpis.expenses.current),
    netProfit: centsToTaka(kpis.grossProfit.current),
    inventoryValue: 0,
    salesGrowthPercentage: kpis.revenue.changePercent,
    dueGrowthPercentage: 0,
    expensesGrowthPercentage: kpis.expenses.changePercent,
    profitGrowthPercentage: kpis.grossProfit.changePercent,
    inventoryGrowthPercentage: 0,
  };

  const chartData: ChartDataPoint[] = revenueTrend.map((point) => ({
    label: new Date(point.date).toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric' }),
    sales: centsToTaka(point.revenueCents),
    expenses: 0,
  }));

  const recentTransactions: RecentTransaction[] = [
    ...recent.sales.map((sale) => ({
      id: sale.id,
      invoiceNo: sale.invoiceNumber,
      customerName: sale.customer?.name ?? 'ওয়াক-ইন',
      amount: centsToTaka(sale.totalCents),
      paymentStatus:
        sale.paymentStatus === 'PAID'
          ? ('paid' as const)
          : sale.paymentStatus === 'PARTIAL'
            ? ('partial' as const)
            : ('unpaid' as const),
      timestamp: formatRelativeTime(sale.saleDate),
      type: 'sale' as const,
    })),
    ...recent.expenses.map((exp) => ({
      id: exp.id,
      invoiceNo: `EXP-${exp.id.slice(0, 6)}`,
      customerName: exp.category?.name ?? exp.title,
      amount: centsToTaka(exp.amountCents),
      paymentStatus: 'paid' as const,
      timestamp: formatRelativeTime(exp.expenseDate),
      type: 'expense' as const,
    })),
  ].slice(0, 8);

  const topProducts: TopProductItem[] = [];

  const insights: BusinessInsight[] = [];
  if (expenseDistribution.length > 0) {
    const top = expenseDistribution[0];
    insights.push({
      id: 'exp-top',
      type: 'info',
      banglaText: `সর্বোচ্চ খরচের বিভাগ: ${top.categoryName} (${formatTaka(centsToTaka(top.amountCents))})`,
      englishText: `Top expense category: ${top.categoryName}`,
    });
  }
  if (kpis.netProfit.changePercent > 0) {
    insights.push({
      id: 'profit-up',
      type: 'success',
      banglaText: `নীট লাভ ${kpis.netProfit.changePercent.toFixed(1)}% বৃদ্ধি পেয়েছে।`,
      englishText: `Net profit up ${kpis.netProfit.changePercent.toFixed(1)}%`,
    });
  }

  return { metrics, chartData, recentTransactions, topProducts, insights };
}

function formatTaka(n: number): string {
  return `৳${n.toLocaleString('bn-BD')}`;
}

export function profitReportToMetrics(profit: ProfitReport): ReportSummaryMetrics {
  return {
    totalSales: centsToTaka(profit.grossRevenueCents),
    costPrice: centsToTaka(profit.costOfGoodsSoldCents),
    grossProfit: centsToTaka(profit.grossProfitCents),
    totalExpense: centsToTaka(profit.totalExpensesCents),
    netProfit: centsToTaka(profit.netProfitCents),
    totalCustomerDues: 0,
    totalSupplierDues: 0,
    lowStockItemsCount: 0,
  };
}

export function mergeReportMetrics(
  profit: ProfitReport,
  due: DueReport,
  inventory: InventoryReport,
): ReportSummaryMetrics {
  return {
    ...profitReportToMetrics(profit),
    totalCustomerDues: centsToTaka(due.totalCustomerDueCents),
    totalSupplierDues: centsToTaka(due.totalSupplierDueCents),
    lowStockItemsCount: inventory.lowStockCount,
  };
}

export function dailySalesToProfitRows(rows: DailySalesReport[]): ProfitReportRow[] {
  return rows.map((row, index) => {
    const salesAmount = centsToTaka(row.totalRevenueCents);
    const grossProfit = centsToTaka(row.totalProfitCents);
    const costPrice = salesAmount - grossProfit;
    const marginPercentage =
      row.totalRevenueCents > 0
        ? Number(((row.totalProfitCents / row.totalRevenueCents) * 100).toFixed(2))
        : 0;
    return {
      id: `ds-${index}`,
      timestamp: row.date,
      description: `দৈনিক বিক্রয় — ${row.date}`,
      salesAmount,
      costPrice,
      grossProfit,
      marginPercentage,
    };
  });
}

export function monthlySalesToChartData(rows: MonthlySalesReport[]) {
  return rows.map((row) => ({
    label: row.month,
    sales: centsToTaka(row.totalRevenueCents),
    cost: centsToTaka(row.totalRevenueCents - row.totalProfitCents),
    expense: 0,
  }));
}

export function dailySalesToChartData(rows: DailySalesReport[]) {
  return rows.map((row) => ({
    label: new Date(row.date).toLocaleDateString('bn-BD', { weekday: 'short' }),
    sales: centsToTaka(row.totalRevenueCents),
    cost: centsToTaka(row.totalRevenueCents - row.totalProfitCents),
    expense: 0,
  }));
}

export function expenseToReportRow(expense: Expense): ExpenseReportRow {
  const methodMap: Record<string, ExpenseReportRow['paymentMode']> = {
    CASH: 'cash',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    BANK: 'bank',
  };
  return {
    id: expense.id,
    category: expense.category?.name ?? 'অন্যান্য',
    description: expense.description ?? expense.title,
    amount: centsToTaka(expense.amountCents),
    paymentMode: methodMap[expense.paymentMethod] ?? 'cash',
    timestamp: expense.expenseDate,
  };
}

export function inventoryReportToRows(report: InventoryReport): InventoryReportRow[] {
  return report.items.map((item) => ({
    id: item.productId,
    productName: item.name,
    sku: item.sku,
    price: 0,
    costPrice: item.stockQuantity > 0 ? centsToTaka(item.stockValueCents / item.stockQuantity) : 0,
    stockCount: item.stockQuantity,
    unit: 'pcs',
    stockValueCost: centsToTaka(item.stockValueCents),
    stockValueRetail: centsToTaka(item.stockValueCents),
  }));
}

export function dueReportToRows(report: DueReport): DueReportRow[] {
  return report.items
    .filter((item) => item.partyType === 'CUSTOMER')
    .map((item) => ({
      id: item.partyId,
      customerName: item.partyName,
      phone: '',
      dueAmount: centsToTaka(item.dueCents),
      lastPaymentDate: item.lastActivityDate ?? '',
      notes: '',
    }));
}
