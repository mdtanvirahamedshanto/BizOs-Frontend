// =============================================================================
// BizOS — TanStack Query Shop Hooks
// Covers shop profile retrieval, updates, settings, and deletion.
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shop } from '@/lib/api';
import { queryKeys } from './query-keys';
import type { Shop, UpdateShopRequest, UpdateShopSettingsRequest } from '@/lib/api';

/**
 * Hook to retrieve a shop's profile by ID.
 */
export function useShopQuery(shopId: string) {
  return useQuery<Shop>({
    queryKey: queryKeys.shop.detail(shopId),
    queryFn: () => shop.getShop(shopId),
    enabled: !!shopId,
    staleTime: 10 * 60 * 1000, // Shop profiles change infrequently (10m)
  });
}

/**
 * Mutation to update a shop's core profile fields.
 */
export function useUpdateShopMutation(shopId: string) {
  const queryClient = useQueryClient();
  return useMutation<Shop, Error, UpdateShopRequest>({
    mutationFn: (data) => shop.updateShop(shopId, data),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(queryKeys.shop.detail(shopId), updatedShop);
      // Invalidate audit logs or general reports if status changes
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

/**
 * Mutation to update a shop's operational settings.
 */
export function useUpdateShopSettingsMutation(shopId: string) {
  const queryClient = useQueryClient();
  return useMutation<Shop, Error, UpdateShopSettingsRequest>({
    mutationFn: (data) => shop.updateShopSettings(shopId, data),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(queryKeys.shop.detail(shopId), updatedShop);
    },
  });
}

/**
 * Mutation to delete a shop (e.g. system administration).
 */
export function useDeleteShopMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: shop.deleteShop,
    onSuccess: (_, shopId) => {
      queryClient.removeQueries({ queryKey: queryKeys.shop.detail(shopId) });
    },
  });
}
