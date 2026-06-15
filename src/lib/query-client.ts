import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      gcTime: 1000 * 60 * 30,    // Keep garbage collection cache for 30 mins
      refetchOnWindowFocus: false, // Prevent distracting refetch triggers during cashier active workflow
      retry: (failureCount, error: any) => {
        // Do not retry on client errors (400s)
        const apiError = error as ApiError;
        if (apiError.status && apiError.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false, // POS checkout actions and ledger changes should not blindly auto-retry
    },
  },
});
