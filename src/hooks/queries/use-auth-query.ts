// =============================================================================
// BizOS — TanStack Query Auth Hooks
// Covers profile retrieval, registration, login, logout, password resets, OTP.
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/lib/api';
import { queryKeys } from './query-keys';
import { tokenStore } from '@/lib/api/client';
import type {
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  PasswordResetRequestDTO,
  PasswordResetConfirmRequest,
  OtpRequestDTO,
  OtpVerifyRequest,
  AuthUser,
  CsrfTokenResponse,
  AuthResult,
} from '@/lib/api';

/**
 * Hook to retrieve the current user profile.
 * Standard cache settings are applied (15m staleTime).
 */
export function useMeQuery() {
  return useQuery<AuthUser>({
    queryKey: queryKeys.auth.me(),
    queryFn: auth.getMe,
    staleTime: 15 * 60 * 1000, // 15 minutes
    // Only fetch if a token is present in the tokenStore
    enabled: typeof window !== 'undefined' && !!tokenStore.getAccessToken(),
  });
}

/**
 * Retrieve CSRF token. Used on forms initialization.
 */
export function useCsrfTokenQuery() {
  return useQuery<CsrfTokenResponse>({
    queryKey: queryKeys.auth.session(),
    queryFn: auth.getCsrfToken,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Register a new user and create their shop.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, RegisterRequest>({
    mutationFn: auth.register,
    onSuccess: (data) => {
      // Set tokens in memory and cookie (handled inside SDK, but we update cache here)
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });
}

/**
 * Login mutation.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, LoginRequest>({
    mutationFn: auth.login,
    onSuccess: (data) => {
      // Update authenticated user query cache
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      // Invalidate everything else as user session changed
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Logout mutation. Clears cached data and invalidates user profile.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: auth.logout,
    onSuccess: () => {
      // Clear all react-query queries and reset auth state
      queryClient.clear();
    },
    onError: () => {
      // In case of error (e.g. invalid/expired token on logout), still wipe query client
      queryClient.clear();
    },
  });
}

/**
 * Change authenticated user password.
 */
export function useChangePasswordMutation() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: auth.changePassword,
  });
}

/**
 * Request a password reset link.
 */
export function useRequestPasswordResetMutation() {
  return useMutation<{ message: string }, Error, PasswordResetRequestDTO>({
    mutationFn: auth.requestPasswordReset,
  });
}

/**
 * Confirm password reset via token.
 */
export function useConfirmPasswordResetMutation() {
  return useMutation<{ message: string }, Error, PasswordResetConfirmRequest>({
    mutationFn: auth.confirmPasswordReset,
  });
}

/**
 * Request OTP via phone.
 */
export function useRequestOtpMutation() {
  return useMutation<{ message: string }, Error, OtpRequestDTO>({
    mutationFn: auth.requestOtp,
  });
}

/**
 * Verify OTP.
 */
export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, OtpVerifyRequest>({
    mutationFn: auth.verifyOtp,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries();
    },
  });
}
