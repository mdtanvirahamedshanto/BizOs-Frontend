/**
 * Khata feature hooks — due summary and shared khata utilities.
 */

import { useMemo } from 'react';
import { useKhataDueSummaryQuery } from '@/hooks/queries/use-khata-query';
import { centsToTaka } from '@/lib/crm/money';

export interface KhataSummaryView {
  totalCustomerDues: number;
  totalSupplierDues: number;
  netBalance: number;
  customerDueCents: number;
  supplierDueCents: number;
}

export function useKhataSummaryQuery() {
  const query = useKhataDueSummaryQuery();

  const summary = useMemo((): KhataSummaryView | undefined => {
    if (!query.data) return undefined;
    const customerDueCents = query.data.customerDueCents;
    const supplierDueCents = query.data.supplierDueCents;
    return {
      totalCustomerDues: centsToTaka(customerDueCents),
      totalSupplierDues: centsToTaka(supplierDueCents),
      netBalance: centsToTaka(query.data.netReceivableCents),
      customerDueCents,
      supplierDueCents,
    };
  }, [query.data]);

  return { ...query, data: summary };
}
