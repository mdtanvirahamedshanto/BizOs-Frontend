import { z } from 'zod';

// Bangladeshi mobile number pattern (starts with 013-019 followed by 8 digits)
const bangladeshiPhoneRegex = /^(01[3-9]\d{8})$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'মোবাইল নম্বর লিখুন' })
    .regex(bangladeshiPhoneRegex, { message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017xxxxxxxx)' }),
  password: z
    .string()
    .min(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'আপনার নাম লিখুন (কমপক্ষে ২ অক্ষর)' }),
  phone: z
    .string()
    .min(1, { message: 'মোবাইল নম্বর লিখুন' })
    .regex(bangladeshiPhoneRegex, { message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন' }),
  password: z
    .string()
    .min(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
  businessName: z
    .string()
    .min(3, { message: 'ব্যবসা প্রতিষ্ঠানের নাম লিখুন (কমপক্ষে ৩ অক্ষর)' }),
  businessType: z.enum(
    ['grocery', 'mobile_banking', 'flexiload', 'electronics', 'clothing', 'hardware', 'restaurant', 'wholesale'],
    { message: 'ব্যবসার ধরন নির্বাচন করুন' }
  ),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, { message: '৬ ডিজিটের ওটিপি (OTP) কোডটি লিখুন' })
    .regex(/^\d+$/, { message: 'কোডটি শুধুমাত্র সংখ্যা হতে হবে' }),
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'মোবাইল নম্বর লিখুন' })
    .regex(bangladeshiPhoneRegex, { message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন' }),
});

export const resetPasswordSchema = z.object({
  phone: z.string(),
  otpCode: z
    .string()
    .length(6, { message: '৬ ডিজিটের ওটিপি (OTP) কোডটি লিখুন' }),
  newPassword: z
    .string()
    .min(6, { message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'পাসওয়ার্ড নিশ্চিত করুন' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'পাসওয়ার্ড দুটি মেলেনি',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
