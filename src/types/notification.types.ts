// =============================================================================
// BizOS — Notification Types
// Covers: in-app notifications, channels, event types, preferences, badge counts
// =============================================================================

import type { UUID, ISODateString } from './common.types';
import type { PaginationParams } from './common.types';

// ─── Notification Channel ────────────────────────────────────────────────────

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'TELEGRAM';

// ─── Notification Event Types ─────────────────────────────────────────────────
// Dot-notation string: "{module}.{event}"

export type NotificationEventType =
  // Sales events
  | 'sale.created'
  | 'sale.completed'
  | 'sale.returned'
  | 'sale.void'
  // Purchase events
  | 'purchase.created'
  | 'purchase.received'
  | 'purchase.overdue'
  // Inventory events
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'inventory.adjusted'
  // Customer / Khata
  | 'khata.collection_recorded'
  | 'khata.repayment_recorded'
  | 'khata.balance_exceeded'
  // Expense events
  | 'expense.created'
  | 'expense.recurring_processed'
  // Cashbook events
  | 'cashbook.daily_closing'
  | 'cashbook.discrepancy'
  // System events
  | 'system.maintenance'
  | 'system.plan_upgrade'
  | string; // extensible for future types

// ─── Notification Data Payloads ───────────────────────────────────────────────

interface BaseSaleNotificationData {
  saleId: UUID;
  invoiceNumber: string;
  totalCents: number;
}

interface LowStockNotificationData {
  productId: UUID;
  productName: string;
  currentStock: number;
  threshold: number;
}

interface KhataNotificationData {
  accountId: UUID;
  partyName: string;
  amountCents: number;
  newBalanceCents: number;
}

/** Discriminated union of all notification data shapes */
export type NotificationData =
  | ({ type: 'sale.created' | 'sale.completed' } & BaseSaleNotificationData)
  | ({ type: 'inventory.low_stock' | 'inventory.out_of_stock' } & LowStockNotificationData)
  | ({ type: 'khata.collection_recorded' | 'khata.repayment_recorded' } & KhataNotificationData)
  | { type: string; [key: string]: unknown }; // fallback

// ─── Notification Entity ──────────────────────────────────────────────────────

export interface Notification {
  readonly id: UUID;
  readonly shopId: UUID;
  readonly userId: UUID;
  readonly type: NotificationEventType;
  readonly title: string;
  readonly body: string;
  readonly data: NotificationData | null;
  readonly channel: NotificationChannel;
  readonly readAt: ISODateString | null;
  readonly sentAt: ISODateString | null;
  readonly createdAt: ISODateString;
}

// ─── Notification Summary ─────────────────────────────────────────────────────

export interface NotificationSummary {
  readonly unreadCount: number;
  readonly totalCount: number;
  readonly latestNotification: Notification | null;
}

// ─── Telegram Notification Preferences ───────────────────────────────────────

export interface TelegramNotificationPref {
  readonly id: UUID;
  readonly telegramLinkId: UUID;
  readonly eventType: NotificationEventType;
  readonly isEnabled: boolean;
}

export type UpdateTelegramPrefsRequest = ReadonlyArray<{
  eventType: NotificationEventType;
  isEnabled: boolean;
}>;

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface NotificationQueryParams extends PaginationParams {
  channel?: NotificationChannel;
  type?: NotificationEventType;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
}

// ─── Mark as Read ─────────────────────────────────────────────────────────────

export interface MarkNotificationsReadRequest {
  /** If omitted, marks ALL unread notifications as read */
  ids?: UUID[];
}

export interface MarkNotificationsReadResponse {
  readonly markedCount: number;
}
