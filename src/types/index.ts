// =============================================================================
// BizOS — Type System Master Barrel
//
// Single import point for all domain types.
//
// Usage:
//   import type { Product, Sale, KhataAccount, DashboardMetrics } from '@/types';
//   import type { UUID, Cents, ISODateString } from '@/types';
// =============================================================================

// ─── Primitives & Common ──────────────────────────────────────────────────────
export type {
  // Branded scalars
  UUID,
  ISODateString,
  ISODateOnly,
  Cents,
  DecimalRate,
  BDPhone,
  HexColor,
  UrlString,
  // Utilities
  Nullable,
  DeepPartial,
  Prettify,
  // Pagination
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  // Error
  ApiErrorResponse,
  // Shared enums
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  DiscountType,
  SaleStatus,
  PurchaseStatus,
  TransactionStatus,
  PartyType,
  // Addresses
  AddressGeneric,
  AddressBD,
  // Timestamps
  Timestamps,
  SoftDeletable,
} from './common.types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type {
  UserStatus,
  PermissionString,
  Permission,
  Role,
  AuthTokens,
  DecodedJwtPayload,
  AuthUser,
  UserProfile,
  AuthResult,
  RefreshTokenResult,
  CsrfTokenResponse,
  MessageResponse,
  SessionState,
  AuthStatus,
  // Request DTOs
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  PasswordResetRequestDTO,
  PasswordResetConfirmRequest,
  OtpRequestDTO,
  OtpVerifyRequest,
} from './auth.types';

// ─── Customers ────────────────────────────────────────────────────────────────
export type {
  CustomerAddress,
  CustomerAttachment,
  Customer,
  CustomerRef,
  CustomerStats,
  // Request DTOs
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
} from './customer.types';

// ─── Suppliers ────────────────────────────────────────────────────────────────
export type {
  Supplier,
  SupplierRef,
  SupplierDueTracking,
  SupplierLedgerEntry,
  SupplierLedgerEntryType,
  // Request DTOs
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
} from './supplier.types';

// ─── Products ─────────────────────────────────────────────────────────────────
export type {
  Category,
  CategoryTreeNode,
  CategoryRef,
  Product,
  ProductRef,
  ProductWithStockStatus,
  // Request DTOs
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from './product.types';

// ─── Inventory ────────────────────────────────────────────────────────────────
export type {
  StockMovementType,
  StockMovement,
  StockMovementReferenceType,
  StockLevel,
  InventoryReportItem,
  InventoryReport,
  LowStockAlert,
  // Request DTOs
  StockAdjustmentRequest,
  StockMovementQueryParams,
} from './inventory.types';

// ─── Sales ────────────────────────────────────────────────────────────────────
export type {
  SaleItem,
  Sale,
  SaleSummary,
  CartItem,
  Cart,
  SaleReturnItem,
  SaleReturn,
  // Request DTOs
  CreateSaleItemRequest,
  SalePaymentRequest,
  CreateSaleRequest,
  ReturnSaleRequest,
  SaleQueryParams,
} from './sales.types';

// ─── Purchases ────────────────────────────────────────────────────────────────
export type {
  PurchaseItem,
  Purchase,
  PurchaseSummary,
  PurchaseReturnItem,
  // Request DTOs
  CreatePurchaseItemRequest,
  CreatePurchasePaymentRequest,
  CreatePurchaseRequest,
  UpdatePurchaseStatusRequest,
  ReturnPurchaseRequest,
  PurchaseQueryParams,
} from './purchase.types';

// ─── Expenses ─────────────────────────────────────────────────────────────────
export type {
  ExpenseFrequency,
  ExpenseCategory,
  ExpenseCategoryRef,
  Expense,
  RecurringExpense,
  ExpenseSummary,
  // Request DTOs
  ExpenseCategoryRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  ExpenseQueryParams,
  RecurringExpenseQueryParams,
} from './expense.types';

// ─── Khata ────────────────────────────────────────────────────────────────────
export type {
  KhataEntryType,
  KhataAccount,
  KhataAccountRef,
  KhataEntry,
  KhataReferenceType,
  KhataDueSummary,
  // Request DTOs
  KhataQueryParams,
  KhataEntryQueryParams,
  RecordCollectionRequest,
  RecordRepaymentRequest,
  KhataAdjustmentRequest,
} from './khata.types';

// ─── Reports ──────────────────────────────────────────────────────────────────
export type {
  DashboardTimeframe,
  ReportType,
  TrendMetric,
  DashboardMetrics,
  DailySalesRecord,
  MonthlySalesRecord,
  ProfitReport,
  InventoryReportSummary,
  DueReportItem,
  DueReport,
  ReportSnapshot,
  GeneratedReport,
  // Request DTOs
  DashboardQueryParams,
  ReportDateRangeParams,
  GenerateReportRequest,
} from './reports.types';

// ─── Notifications ────────────────────────────────────────────────────────────
export type {
  NotificationChannel,
  NotificationEventType,
  NotificationData,
  Notification,
  NotificationSummary,
  TelegramNotificationPref,
  UpdateTelegramPrefsRequest,
  // Request DTOs
  NotificationQueryParams,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
} from './notification.types';

// ─── Settings ─────────────────────────────────────────────────────────────────
export type {
  ShopStatus,
  ShopPlan,
  BusinessType,
  ShopOperationalSettings,
  ShopProfile,
  PlanFeatures,
  UserProfileSettings,
  UserRoleSummary,
  RoleWithPermissions,
  PermissionDetail,
  ShopMember,
  TelegramLinkStatus,
  TelegramMessageStatus,
  TelegramSettings,
  TelegramEventPreference,
  TelegramLinkToken,
  ChannelPreference,
  EventPreference,
  // Request DTOs
  UpdateShopProfileRequest,
  UpdateShopSettingsRequest,
  UpdateUserProfileRequest,
  InviteMemberRequest,
  UpdateMemberRolesRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './settings.types';
