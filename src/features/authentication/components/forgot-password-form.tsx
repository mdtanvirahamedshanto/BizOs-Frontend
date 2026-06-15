'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordInput } from '../types';
import { useForgotPasswordMutation } from '../api/auth-api';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { mutate: forgotPassword, isPending, error } = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data, {
      onSuccess: () => {
        // Redirect to the Reset Password view with the phone number as parameter
        router.push(`/reset-password?phone=${encodeURIComponent(data.phone)}`);
      },
    });
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-1 mb-4 text-xs font-semibold text-slate-500">
        <Link href="/login" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>লগইনে ফিরে যান</span>
        </Link>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          পাসওয়ার্ড রিসেট করুন
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          আপনার অ্যাকাউন্টের রেজিস্টার্ড মোবাইল নম্বরটি নিচে দিন। আমরা পাসওয়ার্ড পরিবর্তন করার জন্য একটি ৬ ডিজিটের ওটিপি (OTP) পাঠাবো।
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'মোবাইল নম্বরটি সঠিক নয় অথবা রেজিস্টার্ড নেই।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Mobile Number Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
            মোবাইল নম্বর <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="017xxxxxxxx"
              {...register('phone')}
              className={`h-11 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.phone
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.phone.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>কোড পাঠানো হচ্ছে...</span>
            </>
          ) : (
            <span>ওটিপি (OTP) পাঠান</span>
          )}
        </button>
      </form>
    </div>
  );
}
