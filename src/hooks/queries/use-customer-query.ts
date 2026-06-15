// =============================================================================
// BizOS — TanStack Query Customer Hooks
// Covers listing (cursor pagination / infinite scrolling) and CRUD mutations.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customers } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  PaginatedResponse,
} from '@/lib/api';

/**
 * Standard paginated query for customers.
 */
export function useCustomersQuery(params?: CustomerQueryParams) {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customers.listCustomers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}

/**
 * Infinite query for customer listings, useful for dropdown pickers or infinite scroll tables.
 */
export function useInfiniteCustomersQuery(params?: CustomerQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Customer>>({
    queryKey: queryKeys.customers.list(params),
    queryFn: ({ pageParam }) =>
      customers.listCustomers({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to retrieve details for a single customer.
 */
export function useCustomerQuery(customerId: string) {
  return useQuery<Customer>({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => customers.getCustomer(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation to create a new customer.
 */
export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation<Customer, Error, CreateCustomerRequest>({
    mutationFn: customers.createCustomer,
    onSuccess: (newCustomer) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      // Optimistically seed the detail cache
      queryClient.setQueryData(queryKeys.customers.detail(newCustomer.id), newCustomer);
    },
  });
}

/**
 * Mutation to update an existing customer.
 */
export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation<Customer, Error, { id: string; data: UpdateCustomerRequest }>({
    mutationFn: ({ id, data }) => customers.updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      // Update individual customer cache
      queryClient.setQueryData(queryKeys.customers.detail(updatedCustomer.id), updatedCustomer);
      // Invalidate customer lists
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
  });
}

/**
 * Mutation to delete a customer.
 */
export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: customers.deleteCustomer,
    onSuccess: (_, customerId) => {
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.customers.detail(customerId) });
      // Invalidate list caches
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
  });
}
