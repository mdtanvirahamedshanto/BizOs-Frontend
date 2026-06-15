import { z } from 'zod';

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number({ message: 'পরিমাণ অবশ্যই সংখ্যা হতে হবে' })
    .positive({ message: 'পরিমাণ কমপক্ষে ১ হতে হবে' }),
  price: z
    .number({ message: 'মূল্য অবশ্যই সংখ্যা হতে হবে' })
    .nonnegative({ message: 'মূল্য নেগেটিভ হতে পারবে না' }),
});

export const checkoutSchema = z.object({
  customerId: z
    .string()
    .nullable()
    .optional(),
  paymentType: z.enum(['cash', 'due', 'partial', 'mobile_banking'], {
    message: 'পেমেন্টের ধরন নির্বাচন করুন',
  }),
  discount: z
    .number({ message: 'ডিসকাউন্ট অবশ্যই সংখ্যা হতে হবে' })
    .nonnegative({ message: 'ডিসকাউন্ট নেগেটিভ হতে পারবে না' })
    .default(0),
  taxRate: z
    .number({ message: 'ভ্যাট/ট্যাক্স অবশ্যই সংখ্যা হতে হবে' })
    .nonnegative({ message: 'ভ্যাট নেগেটিভ হতে পারবে না' })
    .default(0),
  cashReceived: z
    .number({ message: 'নগদ জমার পরিমাণ অবশ্যই সংখ্যা হতে হবে' })
    .nonnegative({ message: 'নগদ জমা নেগেটিভ হতে পারবে না' })
    .default(0),
  items: z
    .array(checkoutItemSchema)
    .min(1, { message: 'কার্টে কমপক্ষে ১টি প্রোডাক্ট থাকতে হবে' }),
}).refine((data) => {
  // If paymentType is due or partial, customerId is mandatory to track balances
  if ((data.paymentType === 'due' || data.paymentType === 'partial') && !data.customerId) {
    return false;
  }
  return true;
}, {
  message: 'বাকি বা আংশিক লেনদেনের জন্য কাস্টমার নির্বাচন করা আবশ্যক',
  path: ['customerId'],
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
