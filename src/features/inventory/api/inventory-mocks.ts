import { Product, Category, InventoryLedgerItem } from './inventory-api';

export let MOCK_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'মিনিকেট চাল ২৫ কেজি', sku: 'MC-25', barcode: '8901234567890', price: 1500, costPrice: 1350, stockCount: 5, unit: 'বস্তা', categoryId: 'cat-1', brand: 'তীর', createdAt: '2026-05-01' },
  { id: 'p-2', name: 'তীর সয়াবিন তেল ৫ লিটার', sku: 'TSO-5', barcode: '8901234567891', price: 900, costPrice: 810, stockCount: 12, unit: 'বোতল', categoryId: 'cat-1', brand: 'তীর', createdAt: '2026-05-02' },
  { id: 'p-3', name: 'ড্যানো গুঁড়ো দুধ ১ কেজি', sku: 'DGM-1', barcode: '8901234567892', price: 850, costPrice: 765, stockCount: 3, unit: 'প্যাকেট', categoryId: 'cat-1', brand: 'ড্যানো', createdAt: '2026-05-03' },
  { id: 'p-4', name: 'ফ্রেশ চিনি ১ কেজি', sku: 'FC-1', barcode: '8901234567893', price: 130, costPrice: 118, stockCount: 8, unit: 'প্যাকেট', categoryId: 'cat-1', brand: 'ফ্রেশ', createdAt: '2026-05-04' },
  { id: 'p-5', name: 'এলইডি বাল্ব ১৮ ওয়াট', sku: 'LB-18', barcode: '8901234567894', price: 280, costPrice: 220, stockCount: 15, unit: 'পিস', categoryId: 'cat-2', brand: 'সুপারস্টার', createdAt: '2026-05-05' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'নিত্যপ্রয়োজনীয় খাদ্য সামগ্রী (Groceries)' },
  { id: 'cat-2', name: 'ইলেকট্রনিক্স এক্সেসরিজ (Electronics)' },
  { id: 'cat-3', name: 'কসমেটিকস ও রূপচর্চা (Cosmetics)' },
];

export const MOCK_LEDGERS: Record<string, InventoryLedgerItem[]> = {
  'p-1': [
    { id: 'lg-1', timestamp: '2026-06-01 09:30', type: 'stock_in', quantityDelta: 10, balanceAfter: 10, reason: 'নতুন চাল স্টক ক্রয়', operator: 'মোঃ আব্দুল করিম' },
    { id: 'lg-2', timestamp: '2026-06-05 14:10', type: 'sale', quantityDelta: -5, balanceAfter: 5, reason: 'বিক্রয় (মেমো: INV-01)', operator: 'ক্যাশিয়ার রাসেল' },
  ],
  'p-2': [
    { id: 'lg-3', timestamp: '2026-06-02 11:20', type: 'stock_in', quantityDelta: 20, balanceAfter: 20, reason: 'স্টক রিসিভড', operator: 'মোঃ আব্দুল করিম' },
    { id: 'lg-4', timestamp: '2026-06-10 18:15', type: 'sale', quantityDelta: -8, balanceAfter: 12, reason: 'বিক্রয় (মেমো: INV-03)', operator: 'ক্যাশিয়ার রাসেল' },
  ],
};
