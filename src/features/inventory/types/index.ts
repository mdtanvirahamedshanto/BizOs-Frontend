import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'প্রোডাক্টের নাম লিখুন (কমপক্ষে ২ অক্ষর)' }),
  sku: z
    .string()
    .optional(),
  barcode: z
    .string()
    .optional(),
  price: z
    .number({ message: 'বিক্রয় মূল্য অবশ্যই সংখ্যা হতে হবে' })
    .positive({ message: 'বিক্রয় মূল্য অবশ্যই ০ থেকে বেশি হতে হবে' }),
  costPrice: z
    .number({ message: 'ক্রয় মূল্য অবশ্যই সংখ্যা হতে হবে' })
    .positive({ message: 'ক্রয় মূল্য অবশ্যই ০ থেকে বেশি হতে হবে' }),
  stockCount: z
    .number({ message: 'স্টক সংখ্যা অবশ্যই সংখ্যা হতে হবে' })
    .nonnegative({ message: 'স্টক নেগেটিভ হতে পারবে না' }),
  unit: z
    .string()
    .min(1, { message: 'পরিমাপের একক নির্বাচন করুন' }),
  categoryId: z
    .string()
    .optional(),
  brand: z
    .string()
    .optional(),
});

export const adjustmentSchema = z.object({
  type: z.enum(['stock_in', 'stock_out', 'damage', 'adjust'], {
    message: 'স্টক পরিবর্তনের ধরন নির্বাচন করুন',
  }),
  quantity: z
    .number({ message: 'পরিমাণ অবশ্যই সংখ্যা হতে হবে' })
    .positive({ message: 'পরিমাণ অবশ্যই ০ থেকে বেশি হতে হবে' }),
  reason: z
    .string()
    .min(1, { message: 'পরিবর্তনের কারণ লিখুন' }),
});

export type ProductInput = z.infer<typeof productSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
