// =============================================================================
// BizOS — TanStack Query Inventory / Stock Movement Hooks
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { products } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  StockMovement,
  StockAdjustmentRequest,
  StockAdjustmentResult,
  StockMovementQueryParams,
  PaginatedResponse,
} from '@/lib/api';

export function useStockMovementsQuery(productId: string, params?: StockMovementQueryParams) {
  return useQuery<PaginatedResponse<StockMovement>>({
    queryKey: queryKeys.products.stockMovements(productId, params),
    queryFn: () => products.listStockMovements(productId, params),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useAdjustStockMutation() {
  const queryClient = useQueryClient();
  return useMutation<StockAdjustmentResult, Error, { productId: string; data: StockAdjustmentRequest }>({
    mutationFn: ({ productId, data }) => products.adjustStock(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.stockMovements(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
