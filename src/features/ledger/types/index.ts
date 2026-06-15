import { z } from 'zod';

export const supplierInputSchema = z.object({
  name: z.string().min(2, { message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' }),
  phone: z.string().regex(/^01[3-9]\d{8}$/, { message: 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন' }),
  companyName: z.string().min(2, { message: 'প্রতিষ্ঠানের নাম কমপক্ষে ২ অক্ষরের হতে হবে' }),
  address: z.string().optional(),
  initialDue: z.number({ message: 'পাওনা অবশ্যই সংখ্যা হতে হবে' }).nonnegative({ message: 'পাওনা নেগেটিভ হতে পারবে না' }),
  notes: z.string().optional(),
});

export const paymentRecordSchema = z.object({
  amount: z.number({ message: 'টাকার পরিমাণ সংখ্যা হতে হবে' }).positive({ message: 'টাকার পরিমাণ শূন্যের চেয়ে বড় হতে হবে' }),
  paymentMode: z.enum(['cash', 'bkash', 'nagad', 'bank'], {
    message: 'পেমেন্টের মাধ্যম নির্বাচন করুন',
  }),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
  sendSMS: z.boolean(),
});

export const settlementRecordSchema = z.object({
  amount: z.number({ message: 'টাকার পরিমাণ সংখ্যা হতে হবে' }).positive({ message: 'টাকার পরিমাণ শূন্যের চেয়ে বড় হতে হবে' }),
  paymentMode: z.enum(['cash', 'bkash', 'nagad', 'bank'], {
    message: 'পেমেন্টের মাধ্যম নির্বাচন করুন',
  }),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;
export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>;
export type SettlementRecordInput = z.infer<typeof settlementRecordSchema>;
