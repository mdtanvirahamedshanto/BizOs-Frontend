import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries/query-keys';

/**
 * Maps backend `dashboard:refresh` sources to TanStack Query invalidations.
 */
export function invalidateQueriesForDashboardRefresh(
  queryClient: QueryClient,
  source: string,
  entityId?: string,
): void {
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

  switch (source) {
    case 'sale':
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.lists() });
      if (entityId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sales.detail(entityId) });
      }
      break;
    case 'payment':
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cashbook.all });
      break;
    case 'expense':
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });
      break;
    case 'khata':
      queryClient.invalidateQueries({ queryKey: queryKeys.khata.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.lists() });
      break;
    case 'inventory':
    case 'purchase':
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      if (entityId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(entityId) });
      }
      break;
    case 'report':
    case 'scheduled-report':
      break;
    default:
      break;
  }
}
