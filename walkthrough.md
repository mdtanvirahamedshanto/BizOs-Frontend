# TanStack Query Architecture — Walkthrough

This document describes the centralized TanStack Query layer in BizOS Frontend. All hooks live under `src/hooks/queries/` and pair with the Axios API SDK in `src/lib/api/`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  UI Components (pages, feature components)                │
└──────────────────────────┬──────────────────────────────────┘
                           │ import from @/hooks/queries
┌──────────────────────────▼──────────────────────────────────┐
│  Query Hooks (use-*-query.ts)                             │
│  • useQuery / useInfiniteQuery / useMutation                │
│  • Cache invalidation & optimistic updates                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ queryKeys + API SDK
┌──────────────────────────▼──────────────────────────────────┐
│  query-keys.ts          │  @/lib/api (Axios modules)      │
└──────────────────────────┴──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  QueryClient (src/lib/query-client.ts)                      │
│  staleTime: 5m · gcTime: 30m · retry: skip 4xx             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```typescript
import {
  queryKeys,
  useProductsQuery,
  useInfiniteProductsQuery,
  useToggleProductActiveMutation,
  useDashboardMetricsQuery,
} from '@/hooks/queries';

// Paginated list
const { data, isLoading } = useProductsQuery({ limit: 20, search: 'rice' });

// Infinite scroll (POS product search)
const infinite = useInfiniteProductsQuery({ limit: 30 });
const products = infinite.data?.pages.flatMap((p) => p.data) ?? [];

// Optimistic toggle
const toggle = useToggleProductActiveMutation();
toggle.mutate({ id: productId, isActive: false });

// Dashboard with background polling
const { data: metrics } = useDashboardMetricsQuery({ timeframe: 'today' });
```

## Query Keys Factory

`src/hooks/queries/query-keys.ts` is the single source of truth for cache keys. Keys are hierarchical and type-safe:

| Domain | Example Key | Purpose |
|--------|-------------|---------|
| Auth | `queryKeys.auth.me()` | Current user profile |
| Shop | `queryKeys.shop.detail(id)` | Shop profile |
| Customers | `queryKeys.customers.list(params)` | Paginated customer list |
| Products | `queryKeys.products.categories.tree()` | Category hierarchy |
| Sales | `queryKeys.sales.detail(id)` | Single sale |
| Khata | `queryKeys.khata.entries(accountId, params)` | Ledger entries |
| Cashbook | `queryKeys.cashbook.balance()` | Drawer balance |
| Reports | `queryKeys.reports.dashboard(params)` | KPI dashboard |

**Invalidation pattern:** Mutations invalidate the narrowest relevant key first, then cross-domain keys when side effects occur (e.g. a sale invalidates products, cashbook, reports, and khata).

## Domain Hooks Reference

### Auth (`use-auth-query.ts`)
- `useMeQuery` — current user (15m stale, enabled when token present)
- `useCsrfTokenQuery` — CSRF token for forms
- Mutations: register, login, logout, change password, password reset, OTP

### Shop (`use-shop-query.ts`)
- `useShopQuery(shopId)` — shop profile
- Mutations: update profile, update settings, delete shop

### Customers (`use-customer-query.ts`)
- `useCustomersQuery` / `useInfiniteCustomersQuery` — cursor-paginated lists
- `useCustomerQuery(id)` — single customer
- CRUD mutations with list invalidation

### Suppliers (`use-supplier-query.ts`)
- List, infinite list, detail, due tracking, ledger (paginated + infinite)
- Purchase and payment history per supplier
- CRUD mutations

### Products (`use-product-query.ts`)
- Categories: list, tree, detail, CRUD
- Products: list, **infinite scroll**, detail, brands, units
- **`useToggleProductActiveMutation`** — optimistic update with rollback on error
- Create, update, delete mutations

### Sales (`use-sales-query.ts`)
- List, infinite list, detail
- `useCreateSaleMutation` — cross-invalidates products, cashbook, reports, khata, customers
- `useReturnSaleMutation`, `useGenerateInvoiceMutation`

### Purchases (`use-purchase-query.ts`)
- List, infinite list, detail
- Create, status update, return mutations with supplier/product/cashbook invalidation

### Expenses (`use-expense-query.ts`)
- Categories CRUD, daily expenses (list + infinite), recurring expenses
- `useProcessRecurringExpensesMutation` — batch process due schedules

### Khata (`use-khata-query.ts`)
- Due summary, accounts (list + infinite), entries (list + infinite)
- `useRecordCollectionMutation`, `useRecordRepaymentMutation`, `useRecordKhataAdjustmentMutation`

### Cashbook (`use-cashbook-query.ts`)
- `useCashbookBalanceQuery` — 30s stale time for POS accuracy
- Entries (list + infinite), closing preview, daily closings
- Cash in/out and daily closing mutations

### MFS (`use-mfs-query.ts`)
- Account CRUD, transactions (list + infinite), create transaction

### Flexiload (`use-flexiload-query.ts`)
- Account CRUD, recharges (list + infinite), create recharge

### Reports (`use-reports-query.ts`)
- **`useDashboardMetricsQuery`** — background refetch every 2 minutes (`refetchInterval`)
- Daily/monthly sales, profit, inventory, due reports
- `useGenerateReportMutation` — export generation

## Special Patterns

### Infinite Scroll

All list hooks that support cursor pagination expose both `useXxxQuery` and `useInfiniteXxxQuery`:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteProductsQuery({ limit: 20 });

// Flatten pages for rendering
const items = data?.pages.flatMap((page) => page.data) ?? [];
```

`getNextPageParam` reads `lastPage.meta.nextCursor` from the API's `PaginatedResponse`.

### Optimistic Updates (Products)

`useToggleProductActiveMutation` demonstrates the full optimistic flow:

1. `onMutate` — cancel in-flight queries, snapshot previous state, update detail + list caches
2. `onError` — restore snapshot, invalidate lists
3. `onSettled` — refetch detail and lists for consistency

### Background Refetching (Reports)

`useDashboardMetricsQuery` polls every 2 minutes while the tab is active:

```typescript
refetchInterval: 2 * 60 * 1000,
refetchIntervalInBackground: false,
```

### Cross-Domain Invalidation

Financial mutations propagate cache invalidation across related domains:

| Mutation | Invalidates |
|----------|-------------|
| `useCreateSaleMutation` | sales, products, cashbook, reports, khata, customers |
| `useCreatePurchaseMutation` | purchases, products, cashbook, reports, suppliers |
| `useCreateExpenseMutation` | expenses, cashbook, reports |
| `useRecordCollectionMutation` | khata, cashbook, reports, customers |

## Stale Time Guidelines

| Data Type | Stale Time | Rationale |
|-----------|------------|-----------|
| Auth profile | 15 min | Rarely changes |
| Category tree | 30 min | Highly static |
| Cash balance | 30 sec | POS accuracy |
| Sales / purchases | 3 min | Dynamic transaction data |
| Khata entries | 1 min | Active ledger |
| Dashboard metrics | 2 min + poll | Near real-time KPIs |

## Migration from Legacy Hooks

Pages currently use feature-scoped hooks in `src/features/*/api/`. To migrate:

```diff
- import { useCustomersQuery } from '@/features/customers/api/customers-api';
+ import { useCustomersQuery } from '@/hooks/queries';
```

Legacy hooks use fetch + mock fallbacks. New hooks call the Axios SDK directly with no mock layer.

## Verification

```bash
cd BizOs-Frontend
npx tsc --noEmit
```

All query hooks, query keys, and barrel exports type-check cleanly against the API SDK.

## File Index

```
src/hooks/queries/
├── index.ts                 # Barrel export (import from @/hooks/queries)
├── query-keys.ts            # Centralized cache key factory
├── use-auth-query.ts
├── use-shop-query.ts
├── use-customer-query.ts
├── use-supplier-query.ts
├── use-product-query.ts     # infinite scroll + optimistic toggle
├── use-sales-query.ts
├── use-purchase-query.ts
├── use-expense-query.ts
├── use-khata-query.ts
├── use-cashbook-query.ts
├── use-mfs-query.ts
├── use-flexiload-query.ts
└── use-reports-query.ts     # background refetching
```
