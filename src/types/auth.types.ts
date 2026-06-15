// =============================================================================
// BizOS — Auth Types
// Covers: registration, login, token refresh, OTP, password reset, user profile
// =============================================================================

import type { UUID, ISODateString } from './common.types';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED';

// ─── Permission System ────────────────────────────────────────────────────────

/**
 * Structured permission string: "{module}.{action}"
 * Examples: "products.read", "sales.create", "reports.read"
 */
export type PermissionString = `${string}.${string}`;

export interface Permission {
  readonly id: UUID;
  readonly module: string;
  readonly resource: string;
  readonly action: string;
  readonly description?: string;
}

export interface Role {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly isSystem: boolean;
  readonly permissions: readonly string[];
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ─── Token Types ──────────────────────────────────────────────────────────────

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  /** Seconds until the access token expires */
  readonly expiresIn: number;
}

export interface DecodedJwtPayload {
  readonly sub: UUID;       // userId
  readonly shopId: UUID;
  readonly email: string;
  readonly permissions: readonly string[];
  readonly iat: number;
  readonly exp: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly email: string;
  readonly name: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly status: UserStatus;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly emailVerifiedAt?: ISODateString;
  readonly lastLoginAt?: ISODateString;
}

export interface UserProfile extends AuthUser {
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface AuthResult {
  readonly user: AuthUser;
  readonly tokens: AuthTokens;
}

export interface RefreshTokenResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface CsrfTokenResponse {
  readonly csrfToken: string;
}

export interface MessageResponse {
  readonly message: string;
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
  shopId: UUID;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface OtpRequestDTO {
  phone: string;
  shopId: UUID;
}

export interface OtpVerifyRequest {
  phone: string;
  shopId: UUID;
  /** Exactly 6 digits */
  otp: string;
}

// ─── Client-Side Session State ────────────────────────────────────────────────

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SessionState {
  readonly status: AuthStatus;
  readonly user: AuthUser | null;
  readonly accessToken: string | null;
}
