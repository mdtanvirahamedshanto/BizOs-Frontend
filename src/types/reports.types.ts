// =============================================================================
// BizOS — Reports Types
// Covers: dashboard KPIs, daily/monthly sales, P&L, inventory, due, snapshots
// =============================================================================

import type { UUID, ISODateString, ISODateOnly, Cents } from './common.types';
import type { PaymentMethod } from './common.types';

// ─── Dashboard Timeframe ──────────────────────────────────────────────────────

export type DashboardTimeframe =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export type ReportType =
  | 'daily_sales'
  | 'monthly_sales'
  | 'profit'
  | 'inventory'
  | 'dues';

// ─── Trend ────────────────────────────────────────────────────────────────────

export interface TrendMetric {
  /** Current period value (cents or count) */
  readonly current: number;
  /** Prior period value (cents or count) */
  readonly previous: number;
  /** Percentage change: ((current - previous) / previous) × 100 */
  readonly changePercent: number;
  readonly direction: 'up' | 'down' | 'flat';
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  readonly timeframe: DashboardTimeframe;
  readonly periodStart: ISODateString;
  readonly periodEnd: ISODateString;

  readonly revenue: TrendMetric;
  readonly grossProfit: TrendMetric;
  readonly netProfit: TrendMetric;
  readonly expenses: TrendMetric;
  readonly salesCount: TrendMetric;
  readonly newCustomers: number;

  readonly cashVsDigital: {
    readonly cashCents: Cents;
    readonly digitalCents: Cents;
    readonly cashPercent: number;
  };

  readonly paymentMethodBreakdown: ReadonlyArray<{
    readonly method: PaymentMethod;
    readonly amountCents: Cents;
    readonly count: number;
    readonly percentage: number;
  }>;

  readonly topProducts: ReadonlyArray<{
    readonly productId: UUID;
    readonly productName: string;
    readonly sku: string;
    readonly quantitySold: number;
    readonly revenueCents: Cents;
    readonly profitCents: Cents;
  }>;

  readonly revenueByDay: ReadonlyArray<{
    readonly date: ISODateOnly;
    readonly revenueCents: Cents;
    readonly profitCents: Cents;
    readonly salesCount: number;
  }>;

  readonly outstandingDues: {
    readonly customerDueCents: Cents;
    readonly supplierDueCents: Cents;
  };
}

// ─── Daily Sales Report ───────────────────────────────────────────────────────

export interface DailySalesRecord {
  readonly date: ISODateOnly;
  readonly salesCount: number;
  readonly totalRevenueCents: Cents;
  readonly totalCostCents: Cents;
  readonly grossProfitCents: Cents;
  readonly cashSalesCents: Cents;
  readonly creditSalesCents: Cents;
  readonly returnedAmountCents: Cents;
  readonly netRevenueCents: Cents;
}

// ─── Monthly Sales Report ─────────────────────────────────────────────────────

export interface MonthlySalesRecord {
  /** Format: "YYYY-MM" */
  readonly month: string;
  readonly salesCount: number;
  readonly totalRevenueCents: Cents;
  readonly grossProfitCents: Cents;
  readonly totalExpensesCents: Cents;
  readonly netProfitCents: Cents;
  readonly averageOrderValueCents: Cents;
}

// ─── Profit & Loss Report ─────────────────────────────────────────────────────

export interface ProfitReport {
  readonly period: {
    readonly startDate: ISODateString;
    readonly endDate: ISODateString;
  };

  readonly grossRevenueCents: Cents;
  readonly salesReturnsCents: Cents;
  readonly netRevenueCents: Cents;
  readonly costOfGoodsSoldCents: Cents;
  readonly grossProfitCents: Cents;
  readonly grossMarginPercent: number;

  readonly totalExpensesCents: Cents;
  readonly expenseBreakdown: ReadonlyArray<{
    readonly categoryName: string;
    readonly amountCents: Cents;
    readonly percentage: number;
  }>;

  readonly netProfitCents: Cents;
  readonly netMarginPercent: number;
}

// ─── Inventory Report ─────────────────────────────────────────────────────────

export interface InventoryReportSummary {
  readonly generatedAt: ISODateString;
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly totalStockValueCents: Cents;
  readonly items: ReadonlyArray<{
    readonly productId: UUID;
    readonly sku: string;
    readonly name: string;
    readonly categoryName: string | null;
    readonly unit: string;
    readonly stockQuantity: number;
    readonly lowStockThreshold: number;
    readonly isLowStock: boolean;
    readonly isOutOfStock: boolean;
    readonly costPriceCents: Cents;
    readonly stockValueCents: Cents;
  }>;
}

// ─── Due Report ───────────────────────────────────────────────────────────────

export interface DueReportItem {
  readonly partyId: UUID;
  readonly partyName: string;
  readonly partyType: 'CUSTOMER' | 'SUPPLIER';
  readonly partyPhone: string | null;
  readonly dueCents: Cents;
  readonly overdueAge?: number; // days since first transaction with balance
  readonly lastActivityDate: ISODateString | null;
}

export interface DueReport {
  readonly totalCustomerReceivableCents: Cents;
  readonly totalSupplierPayableCents: Cents;
  readonly netDueCents: Cents;
  readonly items: readonly DueReportItem[];
}

// ─── Report Snapshot ──────────────────────────────────────────────────────────

/** Pre-computed report stored in the DB */
export interface ReportSnapshot {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly reportType: ReportType;
  readonly periodStart: ISODateOnly;
  readonly periodEnd: ISODateOnly;
  readonly data: unknown;
  readonly generatedBy: UUID | null;
  readonly createdAt: ISODateString;
}

/** Generated on-demand report (may include download URL) */
export interface GeneratedReport {
  readonly reportType: ReportType;
  readonly generatedAt: ISODateString;
  readonly downloadUrl: UrlString | null;
  readonly data: unknown;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

import type { UrlString } from './common.types';

export interface DashboardQueryParams {
  timeframe?: DashboardTimeframe;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportDateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  parameters?: Record<string, unknown>;
}
