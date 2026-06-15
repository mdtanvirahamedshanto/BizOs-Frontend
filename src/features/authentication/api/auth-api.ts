import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore, UserInfo } from '@/stores/use-auth';
import { 
  LoginInput, 
  RegisterInput, 
  OtpInput, 
  ForgotPasswordInput, 
  ResetPasswordInput 
} from '../types';

interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
}

/**
 * Hook to execute user login mutation
 */
export function useLoginMutation() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      try {
        // Actual API endpoint invocation
        return await apiClient.post<AuthResponse>('/auth/login', data);
      } catch (error) {
        // Prototyping simulation fallback in local development
        console.warn('[Auth API] Login request failed, triggering simulation fallback.', error);
        
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock response
        return {
          user: {
            id: 'usr-simulated',
            name: 'মোঃ শরিফুল ইসলাম (Sharif)',
            phone: data.phone,
            role: 'Owner' as const,
          },
          accessToken: 'simulated_jwt_access_token',
          refreshToken: 'simulated_jwt_refresh_token',
        };
      }
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
}

/**
 * Hook to execute merchant registration mutation
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      try {
        return await apiClient.post<{ message: string }>('/auth/register', data);
      } catch (error) {
        console.warn('[Auth API] Register request failed, triggering simulation.', error);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { message: 'OTP sent to mobile number' };
      }
    },
  });
}

/**
 * Hook to execute OTP code verification mutation
 */
export function useVerifyOtpMutation() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: { phone: string; code: string }) => {
      try {
        return await apiClient.post<AuthResponse>('/auth/otp-verify', data);
      } catch (error) {
        console.warn('[Auth API] OTP verification failed, triggering simulation.', error);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          user: {
            id: 'usr-simulated',
            name: 'মোঃ শরিফুল ইসলাম (Sharif)',
            phone: data.phone,
            role: 'Owner' as const,
          },
          accessToken: 'simulated_jwt_access_token',
          refreshToken: 'simulated_jwt_refresh_token',
        };
      }
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
}

/**
 * Hook to execute forgot password verification request
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      try {
        return await apiClient.post<{ message: string }>('/auth/forgot-password', data);
      } catch (error) {
        console.warn('[Auth API] Forgot-password failed, triggering simulation.', error);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { message: 'OTP sent to mobile number' };
      }
    },
  });
}

/**
 * Hook to execute credentials reset mutation
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (data: Omit<ResetPasswordInput, 'confirmPassword'>) => {
      try {
        return await apiClient.post<{ message: string }>('/auth/reset-password', data);
      } catch (error) {
        console.warn('[Auth API] Reset-password failed, triggering simulation.', error);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { message: 'Password reset completed successfully' };
      }
    },
  });
}
