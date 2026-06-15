// =============================================================================
// BizOS API SDK — Master Barrel Export
// All API modules are re-exported here for clean, single-import access.
//
// Usage:
//   import { auth, products, sales } from '@/lib/api';
//   const me = await auth.getMe();
// =============================================================================

// ─── Core ─────────────────────────────────────────────────────────────────────
export { apiClient, tokenStore, buildParams } from './client';
export type { ApiError } from './types';
export type {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  ApiErrorBody,
  PaymentMethod,
  SaleStatus,
  PaymentStatus,
  PurchaseStatus,
  TransactionStatus,
} from './types';

// ─── Modules (namespace imports) ─────────────────────────────────────────────

export * as auth from './modules/auth.api';
export * as shop from './modules/shop.api';
export * as customers from './modules/customers.api';
export * as suppliers from './modules/suppliers.api';
export * as products from './modules/products.api';
export * as sales from './modules/sales.api';
export * as purchases from './modules/purchases.api';
export * as payments from './modules/payments.api';
export * as khata from './modules/khata.api';
export * as expenses from './modules/expenses.api';
export * as cashbook from './modules/cashbook.api';
export * as mfs from './modules/mfs.api';
export * as flexiload from './modules/flexiload.api';
export * as reports from './modules/reports.api';
export * as telegram from './modules/telegram.api';
export * as audit from './modules/audit.api';
export * as uploads from './modules/uploads.api';

// ─── Module Types (named re-exports for convenience) ─────────────────────────

// Auth
export type {
  AuthUser,
  AuthTokens,
  AuthResult,
  CsrfTokenResponse,
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  PasswordResetRequestDTO,
  PasswordResetConfirmRequest,
  OtpRequestDTO,
  OtpVerifyRequest,
} from './modules/auth.api';

// Shop
export type {
  Shop,
  ShopSettings,
  ShopAddress,
  ShopStatus,
  ShopPlan,
  BusinessType,
  UpdateShopRequest,
  UpdateShopSettingsRequest,
} from './modules/shop.api';

// Customers
export type {
  Customer,
  CustomerAddress,
  CustomerAttachment,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
} from './modules/customers.api';

// Suppliers
export type {
  Supplier,
  SupplierDueTracking,
  SupplierLedgerEntry,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
} from './modules/suppliers.api';

// Products
export type {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
  StockMovement,
  StockAdjustmentRequest,
  StockAdjustmentResult,
  StockMovementQueryParams,
} from './modules/products.api';

// Sales
export type {
  Sale,
  SaleItem,
  CreateSaleRequest,
  CreateSaleItemRequest,
  ReturnSaleRequest,
  SaleQueryParams,
} from './modules/sales.api';

// Purchases
export type {
  Purchase,
  PurchaseItem,
  CreatePurchaseRequest,
  CreatePurchaseItemRequest,
  UpdatePurchaseStatusRequest,
  ReturnPurchaseRequest,
  PurchaseQueryParams,
} from './modules/purchases.api';

// Payments
export type {
  Payment,
  PaymentType,
  PayableType,
  CreatePaymentRequest,
  RefundPaymentRequest,
  PaymentQueryParams,
} from './modules/payments.api';

// Khata
export type {
  KhataAccount,
  KhataEntry,
  KhataDueSummary,
  KhataPartyType,
  KhataEntryType,
  KhataQueryParams,
  KhataEntryQueryParams,
  RecordCollectionRequest,
  RecordRepaymentRequest,
  KhataAdjustmentRequest,
} from './modules/khata.api';

// Expenses
export type {
  Expense,
  ExpenseCategory,
  RecurringExpense,
  ExpenseFrequency,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateRecurringExpenseRequest,
  UpdateRecurringExpenseRequest,
  ExpenseCategoryRequest,
  ExpenseQueryParams,
  RecurringExpenseQueryParams,
} from './modules/expenses.api';

// Cashbook
export type {
  CashEntry,
  CashBalance,
  ClosingPreview,
  DailyClosing,
  CashEntryType,
  CashEntrySource,
  ManualCashEntryRequest,
  DailyClosingRequest,
  CashbookQueryParams,
} from './modules/cashbook.api';

// MFS
export type {
  MfsAccount,
  MfsTransaction,
  MfsProvider,
  MfsAccountType,
  MfsTransactionType,
  CreateMfsAccountRequest,
  UpdateMfsAccountRequest,
  CreateMfsTransactionRequest,
  MfsTransactionQueryParams,
} from './modules/mfs.api';

// Flexiload
export type {
  FlexiloadAccount,
  FlexiloadTransaction,
  FlexiloadOperator,
  FlexiloadConnectionType,
  CreateFlexiloadAccountRequest,
  UpdateFlexiloadAccountRequest,
  CreateFlexiloadTransactionRequest,
  FlexiloadQueryParams,
} from './modules/flexiload.api';

// Reports
export type {
  DashboardMetrics,
  DailySalesReport,
  MonthlySalesReport,
  ProfitReport,
  InventoryReport,
  InventoryReportItem,
  DueReport,
  DueReportItem,
  DashboardTimeframe,
  ReportType,
  DashboardQueryParams,
  ReportDateRangeParams,
  GenerateReportRequest,
  GeneratedReport,
} from './modules/reports.api';

// Telegram
export type {
  TelegramLinkStatus,
  TelegramLinkToken,
} from './modules/telegram.api';

// Audit
export type {
  AuditLog,
  AuditQueryParams,
} from './modules/audit.api';

// Uploads
export type {
  UploadedFile,
  UploadContext,
} from './modules/uploads.api';
