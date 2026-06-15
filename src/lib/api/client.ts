// =============================================================================
// BizOS API SDK — Axios Client (Interceptors + Token Refresh)
// =============================================================================

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, ApiErrorBody } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bizos.com/v1';

const DEFAULT_TIMEOUT = 15_000; // 15 s

// ─── Token Storage Helpers ───────────────────────────────────────────────────
// Cookies are the source of truth (Next.js middleware reads them for SSR guards).
// We also keep a short-lived in-memory copy to avoid repeated cookie parsing.

let _inMemoryAccessToken: string | null = null;
let _isRefreshing = false;

/** Queue of resolve/reject callbacks waiting for a token refresh to finish */
type RefreshSubscriber = (token: string | null) => void;
let _refreshSubscribers: RefreshSubscriber[] = [];

function subscribeToRefresh(cb: RefreshSubscriber) {
  _refreshSubscribers.push(cb);
}

function notifyRefreshSubscribers(token: string | null) {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

// ─── Cookie Helpers (client-side only) ───────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 1) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure`;
}

// ─── Token API ───────────────────────────────────────────────────────────────

export const tokenStore = {
  getAccessToken(): string | null {
    return _inMemoryAccessToken ?? getCookie('bizos_token');
  },
  getRefreshToken(): string | null {
    return getCookie('bizos_refresh_token');
  },
  setTokens(accessToken: string, refreshToken?: string) {
    _inMemoryAccessToken = accessToken;
    setCookie('bizos_token', accessToken, 1);
    if (refreshToken) setCookie('bizos_refresh_token', refreshToken, 7);
  },
  clearTokens() {
    _inMemoryAccessToken = null;
    deleteCookie('bizos_token');
    deleteCookie('bizos_refresh_token');
    deleteCookie('bizos_user_info');
  },
};

// ─── Tenant Store Accessor ────────────────────────────────────────────────────
// Lazy import avoids circular dependency with Zustand stores.

function getTenantHeaders(): Record<string, string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTenantStore } = require('@/stores/use-tenant');
    const state = useTenantStore.getState();
    const headers: Record<string, string> = {};
    if (state.activeBusinessId) headers['X-Business-ID'] = state.activeBusinessId;
    if (state.activeBranchId) headers['X-Branch-ID'] = state.activeBranchId;
    return headers;
  } catch {
    return {};
  }
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // JWT is header-based, not cookie-sent to API
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject Bearer token
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. Inject multi-tenant context headers
    if (typeof window !== 'undefined') {
      const tenantHeaders = getTenantHeaders();
      Object.entries(tenantHeaders).forEach(([k, v]) => config.headers.set(k, v));
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  // Success path — pass through
  (response: AxiosResponse) => response,

  // Error path — handle 401 / normalize errors
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ── 401 Unauthorized: attempt silent token refresh ──
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (_isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          subscribeToRefresh((newToken) => {
            if (newToken && originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED'));
            }
          });
        });
      }

      _isRefreshing = true;

      try {
        const refreshToken = tokenStore.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // Call the refresh endpoint directly (no interceptor loop)
        const response = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenStore.setTokens(accessToken, newRefreshToken);
        notifyRefreshSubscribers(accessToken);

        // Retry the original request with the new token
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear session and redirect to login
        tokenStore.clearTokens();
        notifyRefreshSubscribers(null);

        if (typeof window !== 'undefined') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }

        return Promise.reject(
          new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED'),
        );
      } finally {
        _isRefreshing = false;
      }
    }

    // ── Normalize all other errors into ApiError ──
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message =
      body?.message ??
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : 'An unexpected network error occurred.');

    return Promise.reject(
      new ApiError(message, status, body?.code, body?.details),
    );
  },
);

// ─── Typed Request Helpers ────────────────────────────────────────────────────

/**
 * Build a query string from an object, omitting undefined / null values.
 * Accepts any typed query-param interface without requiring an index signature.
 */
export function buildParams(params?: object): Record<string, string> {
  const result: Record<string, string> = {};
  if (!params) return result;
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else {
      result[key] = String(value as string | number | boolean);
    }
  });
  return result;
}
