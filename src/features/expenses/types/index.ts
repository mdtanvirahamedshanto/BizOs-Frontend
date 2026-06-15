import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().min(2, { message: 'খরচের শিরোনাম লিখুন' }),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  amount: z.number().positive({ message: 'পরিমাণ ০ এর বেশি হতে হবে' }),
  paymentMethod: z.enum(['CASH', 'BKASH', 'NAGAD', 'BANK', 'ROCKET', 'CARD', 'CHECK', 'OTHER']),
  expenseDate: z.string().optional(),
});

export type ExpenseFormInput = z.infer<typeof expenseSchema>;
