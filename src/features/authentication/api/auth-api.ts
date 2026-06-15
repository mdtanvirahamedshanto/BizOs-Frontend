/**
 * Feature-level auth hooks — thin adapters over centralized TanStack Query hooks.
 * Maps form DTOs to backend API contracts and surfaces ApiError messages.
 */

import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/types';
import {
  useLoginMutation as useLoginMutationBase,
  useRegisterMutation as useRegisterMutationBase,
  useVerifyOtpMutation as useVerifyOtpMutationBase,
  useRequestOtpMutation as useRequestOtpMutationBase,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useLogoutMutation as useLogoutMutationBase,
} from '@/hooks/queries/use-auth-query';
import type {
  LoginInput,
  RegisterInput,
  OtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../types';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useLoginMutation() {
  const mutation = useLoginMutationBase();
  return {
    ...mutation,
    mutate: (
      data: LoginInput,
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate({ email: data.email, password: data.password }, options),
    mutateAsync: (data: LoginInput) =>
      mutation.mutateAsync({ email: data.email, password: data.password }),
  };
}

export function useRegisterMutation() {
  const mutation = useRegisterMutationBase();
  return {
    ...mutation,
    mutate: (
      data: RegisterInput,
      options?: Parameters<typeof mutation.mutate>[1],
    ) =>
      mutation.mutate(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          shopName: data.shopName,
        },
        options,
      ),
    mutateAsync: (data: RegisterInput) =>
      mutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
        shopName: data.shopName,
      }),
  };
}

export function useVerifyOtpMutation() {
  const mutation = useVerifyOtpMutationBase();
  return {
    ...mutation,
    mutate: (
      data: { phone: string; code: string; shopId: string },
      options?: Parameters<typeof mutation.mutate>[1],
    ) =>
      mutation.mutate(
        { phone: data.phone, shopId: data.shopId, otp: data.code },
        options,
      ),
    mutateAsync: (data: { phone: string; code: string; shopId: string }) =>
      mutation.mutateAsync({ phone: data.phone, shopId: data.shopId, otp: data.code }),
  };
}

export function useRequestOtpMutation() {
  const mutation = useRequestOtpMutationBase();
  return {
    ...mutation,
    mutate: (
      data: { phone: string; shopId: string },
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate(data, options),
  };
}

export function useForgotPasswordMutation() {
  const mutation = useRequestPasswordResetMutation();
  return {
    ...mutation,
    mutate: (
      data: ForgotPasswordInput,
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate({ email: data.email, shopId: data.shopId }, options),
    mutateAsync: (data: ForgotPasswordInput) =>
      mutation.mutateAsync({ email: data.email, shopId: data.shopId }),
  };
}

export function useResetPasswordMutation() {
  const mutation = useConfirmPasswordResetMutation();
  return {
    ...mutation,
    mutate: (
      data: Pick<ResetPasswordInput, 'token' | 'newPassword'>,
      options?: Parameters<typeof mutation.mutate>[1],
    ) =>
      mutation.mutate(
        { token: data.token, newPassword: data.newPassword },
        options,
      ),
  };
}

export function useLogoutMutation() {
  return useLogoutMutationBase();
}

export { toErrorMessage };
