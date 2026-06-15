// =============================================================================
// BizOS — TanStack Query Product & Category Hooks
// Covers listings, categories trees, brands, units, and CRUD operations.
// Includes optimistic updates for toggle status.
// =============================================================================

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { products } from '@/lib/api';
import { queryKeys } from './query-keys';
import type {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
  PaginatedResponse,
} from '@/lib/api';

// ─── Categories Hooks ─────────────────────────────────────────────────────────

/**
 * Standard query for listing categories.
 */
export function useCategoriesQuery(params?: CategoryQueryParams) {
  return useQuery<PaginatedResponse<Category>>({
    queryKey: queryKeys.products.categories.list(params),
    queryFn: () => products.listCategories(params),
    staleTime: 15 * 60 * 1000, // Categories change infrequently (15m)
  });
}

/**
 * Hook to retrieve the complete category hierarchy tree.
 */
export function useCategoryTreeQuery() {
  return useQuery<Category[]>({
    queryKey: queryKeys.products.categories.tree(),
    queryFn: products.getCategoryTree,
    staleTime: 30 * 60 * 1000, // Hierarchical tree is highly static (30m)
  });
}

/**
 * Hook to retrieve details of a single category.
 */
export function useCategoryQuery(categoryId: string) {
  return useQuery<Category>({
    queryKey: queryKeys.products.categories.detail(categoryId),
    queryFn: () => products.getCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Create a product category.
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CreateCategoryRequest>({
    mutationFn: products.createCategory,
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.categories.all });
      queryClient.setQueryData(queryKeys.products.categories.detail(newCat.id), newCat);
    },
  });
}

/**
 * Update a category.
 */
export function useUpdateCategoryMutation(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, UpdateCategoryRequest>({
    mutationFn: (data) => products.updateCategory(categoryId, data),
    onSuccess: (updatedCat) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.categories.all });
      queryClient.setQueryData(queryKeys.products.categories.detail(updatedCat.id), updatedCat);
    },
  });
}

/**
 * Delete a category.
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: products.deleteCategory,
    onSuccess: (_, categoryId) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.categories.detail(categoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.categories.all });
    },
  });
}

// ─── Products Hooks ───────────────────────────────────────────────────────────

/**
 * Standard paginated list of products.
 */
export function useProductsQuery(params?: ProductQueryParams) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: queryKeys.products.list(params),
    queryFn: () => products.listProducts(params),
    staleTime: 5 * 60 * 1000, // Products cache stale after 5 minutes
  });
}

/**
 * Infinite query for products list, primary layout for POS cashier item search.
 */
export function useInfiniteProductsQuery(params?: ProductQueryParams) {
  return useInfiniteQuery<PaginatedResponse<Product>>({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ pageParam }) =>
      products.listProducts({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get single product details.
 */
export function useProductQuery(productId: string) {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => products.getProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get distinct list of product brands.
 */
export function useProductBrandsQuery() {
  return useQuery<string[]>({
    queryKey: queryKeys.products.brands(),
    queryFn: products.getProductBrands,
    staleTime: 30 * 60 * 1000, // Brands are static
  });
}

/**
 * Get distinct list of product measurement units.
 */
export function useProductUnitsQuery() {
  return useQuery<string[]>({
    queryKey: queryKeys.products.units(),
    queryFn: products.getProductUnits,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Create a product.
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, CreateProductRequest>({
    mutationFn: products.createProduct,
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.brands() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.units() });
      queryClient.setQueryData(queryKeys.products.detail(newProduct.id), newProduct);
    },
  });
}

/**
 * Update an existing product.
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; data: UpdateProductRequest }>({
    mutationFn: ({ id, data }) => products.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(queryKeys.products.detail(updatedProduct.id), updatedProduct);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

/**
 * Optimistic status toggle mutation.
 * Instantly toggles `isActive` status in UI list/detail cache and reverts on error.
 */
export function useToggleProductActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; isActive: boolean }, { previousProduct: Product | undefined }>({
    mutationFn: ({ id, isActive }) => products.updateProduct(id, { isActive }),
    // When mutate is called:
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot the previous product value
      const previousProduct = queryClient.getQueryData<Product>(queryKeys.products.detail(id));

      // Optimistically update details cache
      if (previousProduct) {
        queryClient.setQueryData<Product>(queryKeys.products.detail(id), {
          ...previousProduct,
          isActive,
        });
      }

      // Optimistically update list caches
      // We search all cached queries starting with products.list and edit the matching product
      queryClient.setQueriesData<PaginatedResponse<Product>>(
        { queryKey: queryKeys.products.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((prod) =>
              prod.id === id ? { ...prod, isActive } : prod
            ),
          };
        }
      );

      // Return context with snapshotted value
      return { previousProduct };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData<Product>(queryKeys.products.detail(id), context.previousProduct);
      }
      // Re-invalidate to fetch correct values
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
    // Always refetch after success or error
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

/**
 * Delete a product.
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: products.deleteProduct,
    onSuccess: (_, productId) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
