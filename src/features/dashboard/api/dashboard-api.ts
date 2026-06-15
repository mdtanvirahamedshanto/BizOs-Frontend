import { useQuery } from '@tanstack/react-query';
import { reports } from '@/lib/api';
import {
  backendDashboardToView,
  mapUiTimeframeToBackend,
  type BackendDashboardPayload,
} from '@/lib/crm/report-mappers';

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
  label: string;
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
 * Hook to retrieve full dashboard details from GET /reports/dashboard
 */
export function useDashboardQuery(timeframe: 'today' | 'seven_days' | 'month' = 'today') {
  const backendTimeframe = mapUiTimeframeToBackend(timeframe);

  return useQuery({
    queryKey: ['dashboard', 'summary', timeframe],
    queryFn: async (): Promise<DashboardData> => {
      const payload = await reports.getDashboardMetrics({
        timeframe: backendTimeframe,
      });
      return backendDashboardToView(payload as unknown as BackendDashboardPayload);
    },
    staleTime: 2 * 60 * 1000,
  });
}
