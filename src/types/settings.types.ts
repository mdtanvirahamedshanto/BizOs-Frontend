// =============================================================================
// BizOS — Settings Types
// Covers: shop profile, operational settings, user profile, RBAC management,
//         billing & plan, Telegram integration, notification preferences
// =============================================================================

import type { UUID, ISODateString, UrlString, HexColor } from './common.types';
import type { AddressGeneric } from './common.types';
import type { NotificationEventType, NotificationChannel } from './notification.types';

// ─── Shop Status & Plan ───────────────────────────────────────────────────────

export type ShopStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
export type ShopPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BusinessType = 'RETAIL' | 'WHOLESALE' | 'RESTAURANT' | 'SERVICE' | 'OTHERS';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED';

// ─── Shop Operational Settings ────────────────────────────────────────────────

export interface ShopOperationalSettings {
  /** ISO 4217 currency code (e.g. "BDT") */
  readonly currency: string;
  /** IANA timezone (e.g. "Asia/Dhaka") */
  readonly timezone: string;
  readonly businessType: BusinessType;
  readonly receiptHeader: string | null;
  readonly receiptFooter: string | null;
  /** NID / TIN / VAT registration number */
  readonly taxId: string | null;
  /** Enable low-stock alerts */
  readonly lowStockAlertsEnabled: boolean;
  /** Auto-send invoice via Telegram after each sale */
  readonly telegramInvoiceEnabled: boolean;
}

// ─── Shop Profile ─────────────────────────────────────────────────────────────

export interface ShopProfile {
  readonly id: UUID;
  readonly name: string;
  readonly slug: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: AddressGeneric;
  readonly logo: UrlString | null;
  readonly currency: string;
  readonly timezone: string;
  readonly status: ShopStatus;
  readonly plan: ShopPlan;
  readonly settings: ShopOperationalSettings;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ─── Plan Features ────────────────────────────────────────────────────────────

export interface PlanFeatures {
  readonly plan: ShopPlan;
  readonly maxProducts: number;
  readonly maxUsers: number;
  readonly telegramIntegration: boolean;
  readonly advancedReports: boolean;
  readonly apiAccess: boolean;
  readonly prioritySupport: boolean;
}

// ─── User Profile Settings ────────────────────────────────────────────────────

export interface UserProfileSettings {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly avatar: UrlString | null;
  readonly status: UserStatus;
  readonly roles: readonly UserRoleSummary[];
  readonly permissions: readonly string[];
  readonly emailVerifiedAt: ISODateString | null;
  readonly lastLoginAt: ISODateString | null;
  readonly createdAt: ISODateString;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export interface UserRoleSummary {
  readonly id: UUID;
  readonly name: string;
  readonly isSystem: boolean;
}

export interface RoleWithPermissions {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
  readonly permissions: readonly PermissionDetail[];
  readonly userCount: number;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

export interface PermissionDetail {
  readonly id: UUID;
  readonly module: string;
  readonly resource: string;
  readonly action: string;
  readonly description: string | null;
}

export interface ShopMember {
  readonly id: UUID;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly avatar: UrlString | null;
  readonly status: UserStatus;
  readonly roles: readonly UserRoleSummary[];
  readonly lastLoginAt: ISODateString | null;
  readonly joinedAt: ISODateString;
}

// ─── Telegram Settings ────────────────────────────────────────────────────────

export type TelegramLinkStatus = 'LINKED' | 'UNLINKED' | 'PENDING';
export type TelegramMessageStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface TelegramSettings {
  readonly status: TelegramLinkStatus;
  readonly telegramChatId: string | null;
  readonly telegramUsername: string | null;
  readonly isActive: boolean;
  readonly linkedAt: ISODateString | null;
  readonly notificationPreferences: readonly TelegramEventPreference[];
}

export interface TelegramEventPreference {
  readonly eventType: NotificationEventType;
  readonly isEnabled: boolean;
  readonly label: string;
}

export interface TelegramLinkToken {
  readonly linkToken: string;
  /** Deep link URL to start the Telegram bot (e.g. https://t.me/BizOSBot?start=xxx) */
  readonly linkUrl: string;
  readonly expiresAt: ISODateString;
}

// ─── Notification Channel Preferences ────────────────────────────────────────

export interface ChannelPreference {
  readonly channel: NotificationChannel;
  readonly isEnabled: boolean;
  readonly events: readonly EventPreference[];
}

export interface EventPreference {
  readonly eventType: NotificationEventType;
  readonly isEnabled: boolean;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface UpdateShopProfileRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: Partial<AddressGeneric>;
  logo?: string;
}

export interface UpdateShopSettingsRequest {
  settings: Partial<ShopOperationalSettings>;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface InviteMemberRequest {
  email: string;
  name: string;
  roleIds: UUID[];
}

export interface UpdateMemberRolesRequest {
  roleIds: UUID[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: UUID[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: UUID[];
}
