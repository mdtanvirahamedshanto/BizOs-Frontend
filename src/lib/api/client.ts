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
import { ApiError, ApiErrorBody, ApiErrorEnvelope, ApiSuccessEnvelope } from './types';
import {
  AUTH_COOKIES,
  deleteAuthCookie,
  getAuthCookie,
  setAuthCookie,
} from '@/lib/auth/cookies';

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const DEFAULT_TIMEOUT = 15_000; // 15 s

// ─── Token Storage Helpers ───────────────────────────────────────────────────

let _inMemoryAccessToken: string | null = null;
let _isRefreshing = false;

type RefreshSubscriber = (token: string | null) => void;
let _refreshSubscribers: RefreshSubscriber[] = [];

function subscribeToRefresh(cb: RefreshSubscriber) {
  _refreshSubscribers.push(cb);
}

function notifyRefreshSubscribers(token: string | null) {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as ApiSuccessEnvelope<T>).success === true &&
    'data' in payload
  ) {
    return (payload as ApiSuccessEnvelope<T>).data;
  }
  return payload as T;
}

// ─── Token API ───────────────────────────────────────────────────────────────

export const tokenStore = {
  getAccessToken(): string | null {
    return _inMemoryAccessToken ?? getAuthCookie(AUTH_COOKIES.accessToken);
  },
  getRefreshToken(): string | null {
    return getAuthCookie(AUTH_COOKIES.refreshToken);
  },
  setTokens(accessToken: string, refreshToken?: string) {
    _inMemoryAccessToken = accessToken;
    setAuthCookie(AUTH_COOKIES.accessToken, accessToken, 1);
    if (refreshToken) {
      setAuthCookie(AUTH_COOKIES.refreshToken, refreshToken, 7);
    }
  },
  clearTokens() {
    _inMemoryAccessToken = null;
    deleteAuthCookie(AUTH_COOKIES.accessToken);
    deleteAuthCookie(AUTH_COOKIES.refreshToken);
    deleteAuthCookie(AUTH_COOKIES.userInfo);
  },
};

// ─── Tenant Store Accessor ────────────────────────────────────────────────────

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
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

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
  (response: AxiosResponse) => {
    if (response.status === 204) return response;
    response.data = unwrapEnvelope(response.data);
    return response;
  },

  async (error: AxiosError<ApiErrorEnvelope | ApiErrorBody>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (_isRefreshing) {
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

        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const tokens = unwrapEnvelope<{
          accessToken: string;
          refreshToken: string;
          expiresIn?: number;
        }>(response.data);

        tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);

        const { applyRefreshedTokens } = await import('@/lib/auth/session');
        applyRefreshedTokens(tokens.accessToken, tokens.refreshToken);

        notifyRefreshSubscribers(tokens.accessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        tokenStore.clearTokens();
        notifyRefreshSubscribers(null);

        if (typeof window !== 'undefined') {
          const { clearSession } = await import('@/lib/auth/session');
          clearSession();
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }

        return Promise.reject(
          new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED'),
        );
      } finally {
        _isRefreshing = false;
      }
    }

    const status = error.response?.status ?? 0;
    const rawBody = error.response?.data;

    let message = 'An unexpected network error occurred.';
    let code: string | undefined;
    let details: Record<string, string[]> | undefined;

    if (rawBody && typeof rawBody === 'object') {
      if ('success' in rawBody && (rawBody as ApiErrorEnvelope).success === false) {
        const errBody = (rawBody as ApiErrorEnvelope).error;
        message = errBody.message ?? message;
        code = errBody.code;
        details = errBody.details;
      } else if ('message' in rawBody) {
        message = (rawBody as ApiErrorBody).message;
        code = (rawBody as ApiErrorBody).code;
        details = (rawBody as ApiErrorBody).details;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
    }

    return Promise.reject(new ApiError(message, status, code, details));
  },
);

/**
 * Build a query string from an object, omitting undefined / null values.
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
