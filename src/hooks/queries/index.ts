// =============================================================================
// BizOS — TanStack Query Hooks Barrel Export
// Centralized re-export of all domain query hooks and the query keys factory.
// =============================================================================

export { queryKeys } from './query-keys';

// Auth
export {
  useMeQuery,
  useCsrfTokenQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from './use-auth-query';

// Shop
export {
  useShopQuery,
  useUpdateShopMutation,
  useUpdateShopSettingsMutation,
  useDeleteShopMutation,
} from './use-shop-query';

// Customers
export {
  useCustomersQuery,
  useInfiniteCustomersQuery,
  useCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from './use-customer-query';

// Suppliers
export {
  useSuppliersQuery,
  useInfiniteSuppliersQuery,
  useSupplierQuery,
  useSupplierDueTrackingQuery,
  useSupplierLedgerQuery,
  useInfiniteSupplierLedgerQuery,
  useSupplierPurchaseHistoryQuery,
  useSupplierPaymentsQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from './use-supplier-query';

// Products & Categories
export {
  useCategoriesQuery,
  useCategoryTreeQuery,
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useProductsQuery,
  useInfiniteProductsQuery,
  useProductQuery,
  useProductBrandsQuery,
  useProductUnitsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleProductActiveMutation,
  useDeleteProductMutation,
} from './use-product-query';

// Sales
export {
  useSalesQuery,
  useInfiniteSalesQuery,
  useSaleQuery,
  useCreateSaleMutation,
  useReturnSaleMutation,
  useGenerateInvoiceMutation,
} from './use-sales-query';

// Purchases
export {
  usePurchasesQuery,
  useInfinitePurchasesQuery,
  usePurchaseQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseStatusMutation,
  useReturnPurchaseMutation,
} from './use-purchase-query';

// Expenses
export {
  useExpenseCategoriesQuery,
  useExpenseCategoryQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useExpensesQuery,
  useInfiniteExpensesQuery,
  useExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useRecurringExpensesQuery,
  useInfiniteRecurringExpensesQuery,
  useRecurringExpenseQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useProcessRecurringExpensesMutation,
} from './use-expense-query';

// Khata (Credit Ledger)
export {
  useKhataDueSummaryQuery,
  useKhataAccountsQuery,
  useInfiniteKhataAccountsQuery,
  useKhataAccountQuery,
  useKhataEntriesQuery,
  useInfiniteKhataEntriesQuery,
  useRecordCollectionMutation,
  useRecordRepaymentMutation,
  useRecordKhataAdjustmentMutation,
} from './use-khata-query';

// Cashbook
export {
  useCashbookBalanceQuery,
  useCashbookEntriesQuery,
  useInfiniteCashbookEntriesQuery,
  useClosingPreviewQuery,
  useDailyClosingsQuery,
  useRecordCashInMutation,
  useRecordCashOutMutation,
  useRecordDailyClosingMutation,
} from './use-cashbook-query';

// MFS (Mobile Financial Services)
export {
  useMfsAccountsQuery,
  useMfsAccountQuery,
  useCreateMfsAccountMutation,
  useUpdateMfsAccountMutation,
  useMfsTransactionsQuery,
  useInfiniteMfsTransactionsQuery,
  useMfsTransactionQuery,
  useCreateMfsTransactionMutation,
} from './use-mfs-query';

// Flexiload
export {
  useFlexiloadAccountsQuery,
  useFlexiloadAccountQuery,
  useCreateFlexiloadAccountMutation,
  useUpdateFlexiloadAccountMutation,
  useFlexiloadRechargesQuery,
  useInfiniteFlexiloadRechargesQuery,
  useFlexiloadRechargeQuery,
  useCreateFlexiloadRechargeMutation,
} from './use-flexiload-query';

// Reports
export {
  useDashboardMetricsQuery,
  useDailySalesReportQuery,
  useMonthlySalesReportQuery,
  useProfitReportQuery,
  useInventoryReportQuery,
  useDueReportQuery,
  useGenerateReportMutation,
} from './use-reports-query';
