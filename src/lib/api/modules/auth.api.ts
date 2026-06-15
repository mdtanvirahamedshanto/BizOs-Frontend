// =============================================================================
// BizOS API SDK — Auth Module
// =============================================================================

import { apiClient } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  shopId: string;
  email: string;
  name: string;
  permissions: string[];
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface CsrfTokenResponse {
  csrfToken: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  shopName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequestDTO {
  email: string;
  shopId: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface OtpRequestDTO {
  phone: string;
  shopId: string;
}

export interface OtpVerifyRequest {
  phone: string;
  shopId: string;
  otp: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Retrieve a CSRF token (use before forms in CSRF-protected contexts)
 */
export async function getCsrfToken(): Promise<CsrfTokenResponse> {
  const res = await apiClient.get<CsrfTokenResponse>('/auth/csrf');
  return res.data;
}

/**
 * Register a new user and create their shop
 */
export async function register(data: RegisterRequest): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>('/auth/register', data);
  return res.data;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>('/auth/login', data);
  return res.data;
}

/**
 * Silently rotate an access token using a refresh token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>('/auth/refresh', data);
  return res.data;
}

/**
 * Revoke the current session (server-side logout)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Get the currently authenticated user's profile
 */
export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get<AuthUser>('/auth/me');
  return res.data;
}

/**
 * Change the authenticated user's password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/auth/change-password', data);
}

/**
 * Request a password reset link via email
 */
export async function requestPasswordReset(data: PasswordResetRequestDTO): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/password-reset/request', data);
  return res.data;
}

/**
 * Confirm a password reset with a token
 */
export async function confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/password-reset/confirm', data);
  return res.data;
}

/**
 * Request an OTP for phone-based login
 */
export async function requestOtp(data: OtpRequestDTO): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/otp/request', data);
  return res.data;
}

/**
 * Verify OTP and receive auth tokens
 */
export async function verifyOtp(data: OtpVerifyRequest): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>('/auth/otp/verify', data);
  return res.data;
}
