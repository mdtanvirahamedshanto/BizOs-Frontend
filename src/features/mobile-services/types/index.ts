import { z } from 'zod';

export const mfsTransactionSchema = z.object({
  provider: z.enum(['bkash', 'nagad', 'rocket', 'upay'], {
    message: 'সেবাদাতা (MFS Provider) নির্বাচন করুন',
  }),
  type: z.enum(['cash_in', 'cash_out', 'send_money'], {
    message: 'লেনদেনের ধরণ নির্বাচন করুন',
  }),
  mobileNumber: z.string().regex(/^01[3-9]\d{8}$/, {
    message: 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন',
  }),
  amount: z.number({ message: 'পরিমাণ অবশ্যই সংখ্যা হতে হবে' }).positive({ message: 'পরিমাণ অবশ্যই শূন্যের চেয়ে বড় হতে হবে' }),
  fee: z.number({ message: 'ফি অবশ্যই সংখ্যা হতে হবে' }).nonnegative({ message: 'ফি নেগেটিভ হতে পারবে না' }),
  commission: z.number({ message: 'কমিশন অবশ্যই সংখ্যা হতে হবে' }).nonnegative({ message: 'কমিশন নেগেটিভ হতে পারবে না' }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const flexiloadTransactionSchema = z.object({
  operator: z.enum(['gp', 'robi', 'banglalink', 'airtel', 'teletalk'], {
    message: 'মোবাইল অপারেটর নির্বাচন করুন',
  }),
  connectionType: z.enum(['prepaid', 'postpaid'], {
    message: 'কানেকশন টাইপ নির্বাচন করুন',
  }),
  mobileNumber: z.string().regex(/^01[3-9]\d{8}$/, {
    message: 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন',
  }),
  amount: z.number({ message: 'পরিমাণ অবশ্যই সংখ্যা হতে হবে' }).positive({ message: 'পরিমাণ অবশ্যই শূন্যের চেয়ে বড় হতে হবে' }),
  notes: z.string().optional(),
});

export type MfsTransactionInput = z.infer<typeof mfsTransactionSchema>;
export type FlexiloadTransactionInput = z.infer<typeof flexiloadTransactionSchema>;
