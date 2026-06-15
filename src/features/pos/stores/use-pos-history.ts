import { create } from 'zustand';
import { CheckoutResult } from '../api/pos-api';

interface POSHistoryState {
  sales: CheckoutResult[];
  
  // Actions
  addSale: (sale: CheckoutResult) => void;
  returnSaleItem: (invoiceNo: string, name: string, qtyReturned: number) => void;
  voidSale: (invoiceNo: string) => void;
}

const INITIAL_PAST_SALES: CheckoutResult[] = [
  {
    success: true,
    invoiceNo: 'BOS-48201934',
    transactionId: 'tx-82a17fbc',
    totalAmount: 2400,
    discountAmount: 120,
    taxAmount: 114,
    netPayable: 2394,
    cashReceived: 2500,
    changeDue: 106,
    dueAmount: 0,
    timestamp: '2026-06-15 10:15',
    items: [
      { name: 'মিনিকেট চাল ২৫ কেজি', quantity: 1, unit: 'বস্তা', price: 1500 },
      { name: 'তীর সয়াবিন তেল ৫ লিটার', quantity: 1, unit: 'বোতল', price: 900 }
    ]
  },
  {
    success: true,
    invoiceNo: 'BOS-73910482',
    transactionId: 'tx-b73f2a1c',
    totalAmount: 850,
    discountAmount: 0,
    taxAmount: 43,
    netPayable: 893,
    cashReceived: 0,
    changeDue: 0,
    dueAmount: 893,
    timestamp: '2026-06-15 09:30',
    items: [
      { name: 'ড্যানো গুঁড়ো দুধ ১ কেজি', quantity: 1, unit: 'প্যাকেট', price: 850 }
    ]
  }
];

export const usePOSHistoryStore = create<POSHistoryState>()((set) => ({
  sales: INITIAL_PAST_SALES,
  
  addSale: (sale) => {
    set((state) => ({
      sales: [sale, ...state.sales],
    }));
  },
  
  returnSaleItem: (invoiceNo, itemName, qtyReturned) => {
    set((state) => {
      const nextSales = state.sales.map((sale) => {
        if (sale.invoiceNo === invoiceNo) {
          const nextItems = sale.items.map((item) => {
            if (item.name === itemName) {
              const returnedQty = Math.min(item.quantity, qtyReturned);
              return {
                ...item,
                quantity: item.quantity - returnedQty,
                returnedQuantity: (item.returnedQuantity || 0) + returnedQty,
              };
            }
            return item;
          });

          // Calculate refund amount
          const targetItem = sale.items.find(i => i.name === itemName);
          if (!targetItem) return sale;
          
          const returnedItemPrice = targetItem.price * qtyReturned;
          // Calculate discount & tax proportions
          const discountRatio = sale.totalAmount > 0 ? (sale.discountAmount / sale.totalAmount) : 0;
          const proportionalDiscount = returnedItemPrice * discountRatio;
          const proportionalTax = (returnedItemPrice - proportionalDiscount) * (sale.taxAmount / (sale.totalAmount - sale.discountAmount || 1));
          
          const refundDeduction = Math.round(returnedItemPrice - proportionalDiscount + proportionalTax);
          
          // Adjust totals
          const nextTotal = Math.max(0, sale.totalAmount - returnedItemPrice);
          const nextDiscount = Math.max(0, sale.discountAmount - proportionalDiscount);
          const nextTax = Math.max(0, sale.taxAmount - proportionalTax);
          const nextNet = Math.max(0, sale.netPayable - refundDeduction);
          
          // Adjust dues or cash received
          let nextDue = sale.dueAmount;
          let nextCash = sale.cashReceived;
          
          if (sale.dueAmount > 0) {
            nextDue = Math.max(0, sale.dueAmount - refundDeduction);
          } else {
            nextCash = Math.max(0, sale.cashReceived - refundDeduction);
          }

          return {
            ...sale,
            items: nextItems,
            totalAmount: nextTotal,
            discountAmount: nextDiscount,
            taxAmount: nextTax,
            netPayable: nextNet,
            dueAmount: nextDue,
            cashReceived: nextCash,
            isReturned: true,
          };
        }
        return sale;
      });
      return { sales: nextSales };
    });
  },
  
  voidSale: (invoiceNo) => {
    set((state) => ({
      sales: state.sales.map((sale) => {
        if (sale.invoiceNo === invoiceNo) {
          return {
            ...sale,
            isVoided: true,
            netPayable: 0,
            dueAmount: 0,
            cashReceived: 0,
            changeDue: 0,
          };
        }
        return sale;
      }),
    }));
  },
}));
