import { useTenantStore } from '@/stores/use-tenant';
import { useAuthStore } from '@/stores/use-auth';
import { getAuthCookie, AUTH_COOKIES } from '@/lib/auth/cookies';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  retryCount?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base

/**
 * Helper to construct URL with query parameters
 */
function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Helper to handle retry delay using exponential backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Standardized API client using fetch
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, retryCount = 0, ...init } = options;
  const url = buildUrl(path, params);

  // Set default headers
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject active tenant headers (Business and Branch context)
  if (typeof window !== 'undefined') {
    const tenantState = useTenantStore.getState();
    if (tenantState.activeBusinessId) {
      headers.set('X-Business-ID', tenantState.activeBusinessId);
    }
    if (tenantState.activeBranchId) {
      headers.set('X-Branch-ID', tenantState.activeBranchId);
    }
  }

  // Attach the bearer token so admin/platform calls are authenticated.
  // Matches the axios client's token store (cookie-backed).
  if (typeof window !== 'undefined' && !headers.has('Authorization')) {
    const token = getAuthCookie(AUTH_COOKIES.accessToken);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...init,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized (401), handle token refresh logic here
    if (response.status === 401 && typeof window !== 'undefined') {
      // For now, immediately logout and redirect to prevent being stuck in a broken state
      useAuthStore.getState().logout();
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }

    if (!response.ok) {
      // Try to parse error details
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const error: ApiError = new Error(errorData.message || 'An error occurred while fetching the data.');
      error.status = response.status;
      error.code = errorData.code;
      error.details = errorData.details;
      throw error;
    }

    // Process empty content or response parsing
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: any) {
    // Determine if we should retry the request (network errors and server errors)
    const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
    const isServerError = error.status && error.status >= 500;

    if ((isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
      const backoffDelay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await delay(backoffDelay);

      return apiRequest<T>(path, {
        ...options,
        retryCount: retryCount + 1,
      });
    }

    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  
  post: <T>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(path: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
