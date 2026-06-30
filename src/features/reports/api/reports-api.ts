import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reports, expenses as expensesApi } from '@/lib/api';
import {
  mergeReportMetrics,
  dailySalesToProfitRows,
  dailySalesToChartData,
  monthlySalesToChartData,
  expenseToReportRow,
  inventoryReportToRows,
  dueReportToRows,
} from '@/lib/crm/report-mappers';
import { ReportTimeframe } from '../types';

export interface ReportsResult {
  metrics: import('../types').ReportSummaryMetrics;
  profitRows: import('../types').ProfitReportRow[];
  expenseRows: import('../types').ExpenseReportRow[];
  inventoryRows: import('../types').InventoryReportRow[];
  dueRows: import('../types').DueReportRow[];
  chartData: { label: string; sales: number; cost: number; expense: number }[];
}

function getDateRangeForTimeframe(timeframe: ReportTimeframe): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  if (timeframe === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'weekly') {
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}

/**
 * Composite reports hook — fetches profit, daily/monthly sales, expenses, inventory, and dues.
 */
export function useReportsQuery(timeframe: ReportTimeframe, startDate = '', endDate = '') {
  const range = React.useMemo(() => {
    return startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getDateRangeForTimeframe(timeframe);
  }, [startDate, endDate, timeframe]);

  return useQuery({

    queryKey: ['reports', timeframe, range.startDate.toISOString().split('T')[0], range.endDate.toISOString().split('T')[0]],
    queryFn: async (): Promise<ReportsResult> => {
      const dateParams = { startDate: range.startDate, endDate: range.endDate };

      const [profit, dailySales, monthlySales, expenseList, inventory, due] = await Promise.all([
        reports.getProfitReport(dateParams),
        reports.getDailySalesReport(dateParams),
        timeframe === 'monthly'
          ? reports.getMonthlySalesReport(dateParams)
          : Promise.resolve([]),
        expensesApi.listExpenses({ ...dateParams, limit: 50 }),
        reports.getInventoryReport(),
        reports.getDueReport(),
      ]);

      const metrics = mergeReportMetrics(profit, due, inventory);

      const profitRows = dailySalesToProfitRows(dailySales);
      const expenseRows = (expenseList.data ?? []).map(expenseToReportRow);
      const inventoryRows = inventoryReportToRows(inventory);
      const dueRows = dueReportToRows(due);

      const chartData =
        timeframe === 'monthly' && monthlySales.length > 0
          ? monthlySalesToChartData(monthlySales)
          : dailySalesToChartData(dailySales);

      return {
        metrics,
        profitRows,
        expenseRows,
        inventoryRows,
        dueRows,
        chartData,
      };
    },
    staleTime: 3 * 60 * 1000,
  });
}
