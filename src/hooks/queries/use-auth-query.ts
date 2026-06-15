// =============================================================================
// BizOS — TanStack Query Auth Hooks
// Covers profile retrieval, registration, login, logout, password resets, OTP.
// Syncs session state with Zustand + cookies on every auth mutation.
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/lib/api';
import { queryKeys } from './query-keys';
import { tokenStore } from '@/lib/api/client';
import { establishSession, clearSession, applyRefreshedTokens } from '@/lib/auth/session';
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
  AuthTokens,
} from '@/lib/api';

/**
 * Hook to retrieve the current user profile.
 */
export function useMeQuery() {
  return useQuery<AuthUser>({
    queryKey: queryKeys.auth.me(),
    queryFn: auth.getMe,
    staleTime: 15 * 60 * 1000,
    enabled: typeof window !== 'undefined' && !!tokenStore.getAccessToken(),
    retry: (failureCount, error) => {
      if (error && 'status' in error && (error as { status: number }).status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCsrfTokenQuery() {
  return useQuery<CsrfTokenResponse>({
    queryKey: queryKeys.auth.session(),
    queryFn: auth.getCsrfToken,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, RegisterRequest>({
    mutationFn: auth.register,
    onSuccess: (data) => {
      establishSession(data);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, LoginRequest>({
    mutationFn: auth.login,
    onSuccess: (data) => {
      establishSession(data);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries();
    },
  });
}

export function useRefreshTokenMutation() {
  return useMutation<AuthTokens, Error, string>({
    mutationFn: (refreshToken) => auth.refreshToken({ refreshToken }),
    onSuccess: (tokens) => {
      applyRefreshedTokens(tokens.accessToken, tokens.refreshToken);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: auth.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: auth.changePassword,
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation<{ message: string }, Error, PasswordResetRequestDTO>({
    mutationFn: auth.requestPasswordReset,
  });
}

export function useConfirmPasswordResetMutation() {
  return useMutation<{ message: string }, Error, PasswordResetConfirmRequest>({
    mutationFn: auth.confirmPasswordReset,
  });
}

export function useRequestOtpMutation() {
  return useMutation<{ message: string }, Error, OtpRequestDTO>({
    mutationFn: auth.requestOtp,
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, Error, OtpVerifyRequest>({
    mutationFn: auth.verifyOtp,
    onSuccess: (data) => {
      establishSession(data);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries();
    },
  });
}