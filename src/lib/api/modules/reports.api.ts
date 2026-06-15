// =============================================================================
// BizOS API SDK — Reports Module
// =============================================================================

import { apiClient, buildParams } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DashboardTimeframe =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export type ReportType = 'daily_sales' | 'monthly_sales' | 'profit' | 'inventory' | 'dues';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  revenue: {
    totalCents: number;
    trend: number; // percentage change vs prior period
  };
  profit: {
    totalCents: number;
    trend: number;
  };
  expenses: {
    totalCents: number;
    trend: number;
  };
  sales: {
    count: number;
    trend: number;
  };
  newCustomers: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    revenueCents: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenueCents: number;
    profitCents: number;
  }>;
  cashVsDigital: {
    cashCents: number;
    digitalCents: number;
  };
}

// ─── Sales Reports ────────────────────────────────────────────────────────────

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalRevenueCents: number;
  totalProfitCents: number;
  cashSalesCents: number;
  creditSalesCents: number;
}

export interface MonthlySalesReport {
  month: string; // YYYY-MM
  totalSales: number;
  totalRevenueCents: number;
  totalProfitCents: number;
  averageOrderValueCents: number;
}

// ─── Profit Report ────────────────────────────────────────────────────────────

export interface ProfitReport {
  period: { startDate: string; endDate: string };
  grossRevenueCents: number;
  costOfGoodsSoldCents: number;
  grossProfitCents: number;
  totalExpensesCents: number;
  netProfitCents: number;
  grossMarginPct: number;
  netMarginPct: number;
}

// ─── Inventory Report ─────────────────────────────────────────────────────────

export interface InventoryReportItem {
  productId: string;
  sku: string;
  name: string;
  categoryName?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  stockValueCents: number;
}

export interface InventoryReport {
  generatedAt: string;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValueCents: number;
  items: InventoryReportItem[];
}

// ─── Due Report ───────────────────────────────────────────────────────────────

export interface DueReportItem {
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  dueCents: number;
  lastActivityDate?: string;
}

export interface DueReport {
  totalCustomerDueCents: number;
  totalSupplierDueCents: number;
  netDueCents: number;
  items: DueReportItem[];
}

// ─── Generated Report ─────────────────────────────────────────────────────────

export interface GeneratedReport {
  reportType: ReportType;
  generatedAt: string;
  downloadUrl?: string;
  data: unknown;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface ReportDateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface DashboardQueryParams {
  timeframe?: DashboardTimeframe;
  startDate?: Date;
  endDate?: Date;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  parameters?: Record<string, unknown>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Get KPI dashboard metrics for the selected timeframe
 */
export async function getDashboardMetrics(
  params?: DashboardQueryParams,
): Promise<DashboardMetrics> {
  const res = await apiClient.get<DashboardMetrics>('/reports/dashboard', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get daily sales breakdown for a date range
 */
export async function getDailySalesReport(
  params?: ReportDateRangeParams,
): Promise<DailySalesReport[]> {
  const res = await apiClient.get<DailySalesReport[]>('/reports/daily-sales', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get monthly sales aggregation for a date range
 */
export async function getMonthlySalesReport(
  params?: ReportDateRangeParams,
): Promise<MonthlySalesReport[]> {
  const res = await apiClient.get<MonthlySalesReport[]>('/reports/monthly-sales', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get profit and loss report for a date range
 */
export async function getProfitReport(params?: ReportDateRangeParams): Promise<ProfitReport> {
  const res = await apiClient.get<ProfitReport>('/reports/profit', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}

/**
 * Get a full inventory status report (no date range needed)
 */
export async function getInventoryReport(): Promise<InventoryReport> {
  const res = await apiClient.get<InventoryReport>('/reports/inventory');
  return res.data;
}

/**
 * Get current due/receivable report across all customers and suppliers
 */
export async function getDueReport(): Promise<DueReport> {
  const res = await apiClient.get<DueReport>('/reports/dues');
  return res.data;
}

/**
 * Generate and optionally export a structured report (returns download URL)
 */
export async function generateReport(data: GenerateReportRequest): Promise<GeneratedReport> {
  const res = await apiClient.post<GeneratedReport>('/reports/generate', data);
  return res.data;
}
