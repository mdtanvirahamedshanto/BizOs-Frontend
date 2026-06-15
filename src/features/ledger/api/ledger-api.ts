/**
 * @deprecated Import from '@/features/ledger/api/suppliers-api' instead.
 * Re-exports supplier hooks backed by TanStack Query + BizOS API SDK.
 */

export {
  useSuppliersQuery,
  useSupplierQuery,
  useSupplierQuery as useSupplierDetailsQuery,
  useSupplierLedgerQuery,
  useSupplierPaymentsHistoryQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useRecordSupplierSettlementMutation,
  type Supplier,
  type SupplierLedgerItem,
} from './suppliers-api';
