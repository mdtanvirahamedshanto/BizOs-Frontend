// =============================================================================
// BizOS — TanStack Query Keys Factory
// Centralized, type-safe source of truth for all React Query cache keys.
// =============================================================================

import type {
  CustomerQueryParams,
  SupplierQueryParams,
  ProductQueryParams,
  CategoryQueryParams,
  StockMovementQueryParams,
  SaleQueryParams,
  PurchaseQueryParams,
  PaymentQueryParams,
  KhataQueryParams,
  ExpenseQueryParams,
  RecurringExpenseQueryParams,
  CashbookQueryParams,
  MfsTransactionQueryParams,
  FlexiloadQueryParams,
  DashboardQueryParams,
  AuditQueryParams,
} from '@/lib/api';

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  shop: {
    all: ['shop'] as const,
    detail: (id: string) => [...queryKeys.shop.all, 'detail', id] as const,
    settings: (id: string) => [...queryKeys.shop.all, 'settings', id] as const,
  },

  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (params?: CustomerQueryParams) => [...queryKeys.customers.lists(), params ?? {}] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    stats: () => [...queryKeys.customers.all, 'stats'] as const,
  },

  suppliers: {
    all: ['suppliers'] as const,
    lists: () => [...queryKeys.suppliers.all, 'list'] as const,
    list: (params?: SupplierQueryParams) => [...queryKeys.suppliers.lists(), params ?? {}] as const,
    details: () => [...queryKeys.suppliers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.suppliers.details(), id] as const,
    due: (id: string) => [...queryKeys.suppliers.all, 'due', id] as const,
    ledgers: (id: string) => [...queryKeys.suppliers.all, 'ledger', id] as const,
    ledger: (id: string, params?: any) => [...queryKeys.suppliers.ledgers(id), params ?? {}] as const,
  },

  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params?: ProductQueryParams) => [...queryKeys.products.lists(), params ?? {}] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    brands: () => [...queryKeys.products.all, 'brands'] as const,
    units: () => [...queryKeys.products.all, 'units'] as const,
    stockMovements: (productId: string, params?: StockMovementQueryParams) =>
      [...queryKeys.products.all, 'stock-movements', productId, params ?? {}] as const,
    categories: {
      all: ['categories'] as const,
      tree: () => [...queryKeys.products.categories.all, 'tree'] as const,
      lists: () => [...queryKeys.products.categories.all, 'list'] as const,
      list: (params?: CategoryQueryParams) => [...queryKeys.products.categories.lists(), params ?? {}] as const,
      detail: (id: string) => [...queryKeys.products.categories.all, 'detail', id] as const,
    },
  },

  sales: {
    all: ['sales'] as const,
    lists: () => [...queryKeys.sales.all, 'list'] as const,
    list: (params?: SaleQueryParams) => [...queryKeys.sales.lists(), params ?? {}] as const,
    details: () => [...queryKeys.sales.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sales.details(), id] as const,
  },

  purchases: {
    all: ['purchases'] as const,
    lists: () => [...queryKeys.purchases.all, 'list'] as const,
    list: (params?: PurchaseQueryParams) => [...queryKeys.purchases.lists(), params ?? {}] as const,
    details: () => [...queryKeys.purchases.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.purchases.details(), id] as const,
  },

  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (params?: PaymentQueryParams) => [...queryKeys.payments.lists(), params ?? {}] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
  },

  khata: {
    all: ['khata'] as const,
    accounts: (params?: KhataQueryParams) => [...queryKeys.khata.all, 'accounts', params ?? {}] as const,
    details: () => [...queryKeys.khata.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.khata.details(), id] as const,
    entriesList: (id: string) => [...queryKeys.khata.all, 'entries', id] as const,
    entries: (id: string, params?: any) => [...queryKeys.khata.entriesList(id), params ?? {}] as const,
    dueSummary: () => [...queryKeys.khata.all, 'due-summary'] as const,
  },

  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (params?: ExpenseQueryParams) => [...queryKeys.expenses.lists(), params ?? {}] as const,
    details: () => [...queryKeys.expenses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
    categories: () => [...queryKeys.expenses.all, 'categories'] as const,
    recurrings: () => [...queryKeys.expenses.all, 'recurrings'] as const,
    recurringList: (params?: RecurringExpenseQueryParams) => [...queryKeys.expenses.recurrings(), params ?? {}] as const,
    summary: (params?: any) => [...queryKeys.expenses.all, 'summary', params ?? {}] as const,
  },

  cashbook: {
    all: ['cashbook'] as const,
    balance: () => [...queryKeys.cashbook.all, 'balance'] as const,
    entries: (params?: CashbookQueryParams) => [...queryKeys.cashbook.all, 'entries', params ?? {}] as const,
    closingPreview: () => [...queryKeys.cashbook.all, 'closing-preview'] as const,
    closings: (params?: any) => [...queryKeys.cashbook.all, 'closings', params ?? {}] as const,
  },

  mfs: {
    all: ['mfs'] as const,
    accounts: () => [...queryKeys.mfs.all, 'accounts'] as const,
    transactions: (params?: MfsTransactionQueryParams) => [...queryKeys.mfs.all, 'transactions', params ?? {}] as const,
  },

  flexiload: {
    all: ['flexiload'] as const,
    accounts: () => [...queryKeys.flexiload.all, 'accounts'] as const,
    transactions: (params?: FlexiloadQueryParams) => [...queryKeys.flexiload.all, 'transactions', params ?? {}] as const,
  },

  reports: {
    all: ['reports'] as const,
    dashboard: (params?: DashboardQueryParams) => [...queryKeys.reports.all, 'dashboard', params ?? {}] as const,
    profitLoss: (params?: any) => [...queryKeys.reports.all, 'profit-loss', params ?? {}] as const,
    inventory: (params?: any) => [...queryKeys.reports.all, 'inventory', params ?? {}] as const,
    due: (params?: any) => [...queryKeys.reports.all, 'due', params ?? {}] as const,
  },

  telegram: {
    all: ['telegram'] as const,
    status: () => [...queryKeys.telegram.all, 'status'] as const,
  },

  audit: {
    all: ['audit'] as const,
    list: (params?: AuditQueryParams) => [...queryKeys.audit.all, 'list', params ?? {}] as const,
  },
} as const;
