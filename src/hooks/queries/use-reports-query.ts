// =============================================================================
// BizOS — TanStack Query Reports Hooks
// Covers dashboard KPIs, P&L statements, inventory, dues, and batch exports.
// Includes background polling refetching for real-time dashboards.
// =============================================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { reports } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  DashboardMetrics,
  DailySalesReport,
  MonthlySalesReport,
  ProfitReport,
  InventoryReport,
  DueReport,
  DashboardQueryParams,
  ReportDateRangeParams,
  GenerateReportRequest,
  GeneratedReport,
} from '@/lib/api';

/**
 * Retrieve KPI dashboard metrics.
 * Configured with background refetching (polls every 2 minutes) to keep admin screens active.
 */
export function useDashboardMetricsQuery(params?: DashboardQueryParams) {
  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.reports.dashboard(params),
    queryFn: () => reports.getDashboardMetrics(params),
    staleTime: 2 * 60 * 1000, // Stale after 2 minutes
    refetchInterval: 2 * 60 * 1000, // Poll and refetch in background every 2 minutes
    refetchIntervalInBackground: false, // Don't burn resources if tab is completely inactive
  });
}

/**
 * Retrieve daily sales aggregates report.
 */
export function useDailySalesReportQuery(params?: ReportDateRangeParams) {
  return useQuery<DailySalesReport[]>({
    queryKey: [...queryKeys.reports.all, 'daily-sales', params ?? {}],
    queryFn: () => reports.getDailySalesReport(params),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}

/**
 * Retrieve monthly sales aggregates report.
 */
export function useMonthlySalesReportQuery(params?: ReportDateRangeParams) {
  return useQuery<MonthlySalesReport[]>({
    queryKey: [...queryKeys.reports.all, 'monthly-sales', params ?? {}],
    queryFn: () => reports.getMonthlySalesReport(params),
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
  });
}

/**
 * Retrieve profit and loss statement report.
 */
export function useProfitReportQuery(params?: ReportDateRangeParams) {
  return useQuery<ProfitReport>({
    queryKey: queryKeys.reports.profitLoss(params),
    queryFn: () => reports.getProfitReport(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Retrieve a full snapshot of catalog inventory levels and total value cents.
 */
export function useInventoryReportQuery() {
  return useQuery<InventoryReport>({
    queryKey: queryKeys.reports.inventory(),
    queryFn: reports.getInventoryReport,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Retrieve aggregated customer and supplier due totals aging.
 */
export function useDueReportQuery() {
  return useQuery<DueReport>({
    queryKey: queryKeys.reports.due(),
    queryFn: reports.getDueReport,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Generate a new report export (triggers CSV/PDF compile job).
 */
export function useGenerateReportMutation() {
  return useMutation<GeneratedReport, Error, GenerateReportRequest>({
    mutationFn: reports.generateReport,
  });
}
