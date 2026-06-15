export type ReportTimeframe = 'today' | 'weekly' | 'monthly' | 'custom';

export interface SalesReportRow {
  id: string;
  invoiceNo: string;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentType: 'cash' | 'due' | 'partial' | 'mobile_banking';
  timestamp: string;
}

export interface ProfitReportRow {
  id: string;
  timestamp: string;
  description: string;
  salesAmount: number;
  costPrice: number;
  grossProfit: number;
  marginPercentage: number;
}

export interface ExpenseReportRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: 'cash' | 'bkash' | 'nagad' | 'bank';
  timestamp: string;
}

export interface InventoryReportRow {
  id: string;
  productName: string;
  sku: string;
  price: number;
  costPrice: number;
  stockCount: number;
  unit: string;
  stockValueCost: number;
  stockValueRetail: number;
}

export interface DueReportRow {
  id: string;
  customerName: string;
  phone: string;
  dueAmount: number;
  lastPaymentDate: string;
  notes?: string;
}

export interface ReportSummaryMetrics {
  totalSales: number;
  costPrice: number;
  grossProfit: number;
  totalExpense: number;
  netProfit: number;
  totalCustomerDues: number;
  totalSupplierDues: number;
  lowStockItemsCount: number;
}
