import { z } from 'zod';

const bangladeshiPhoneRegex = /^(01[3-9]\d{8})$/;

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'গ্রাহকের নাম লিখুন (কমপক্ষে ২ অক্ষর)' }),
  phone: z
    .string()
    .min(1, { message: 'মোবাইল নম্বর লিখুন' })
    .regex(bangladeshiPhoneRegex, { message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017xxxxxxxx)' }),
  address: z
    .string()
    .optional(),
  initialDue: z
    .number({ message: 'সংখ্যা লিখুন' })
    .nonnegative({ message: 'বকেয়ার পরিমাণ নেগেটিভ হতে পারবে না' })
    .optional(),
  notes: z
    .string()
    .optional(),
});

export const ledgerEntrySchema = z.object({
  amount: z
    .number({ message: 'সংখ্যা লিখুন' })
    .positive({ message: 'টাকার পরিমাণ অবশ্যই ০ থেকে বেশি হতে হবে' }),
  type: z.enum(['collect', 'give'], { message: 'লেনদেনের ধরন নির্বাচন করুন' }),
  description: z
    .string()
    .min(1, { message: 'বিবরণ লিখুন (যেমন: বকেয়া আদায়, নগদ ক্রয় ইত্যাদি)' }),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type LedgerEntryInput = z.infer<typeof ledgerEntrySchema>;
