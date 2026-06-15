'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '../types';
import { useResetPasswordMutation } from '../api/auth-api';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const { mutate: resetPassword, isPending, error } = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone,
      otpCode: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!phone) {
      alert('মোবাইল নম্বর পাওয়া যায়নি। অনুগ্রহ করে পাসওয়ার্ড রিসেটের লিংকটি চেক করুন।');
      return;
    }

    resetPassword(
      {
        phone,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
          router.push('/login');
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          নতুন পাসওয়ার্ড তৈরি করুন
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          আপনার মোবাইল নম্বর <span className="font-semibold text-slate-700">{phone || '01xxxxxxxxx'}</span> এ পাঠানো ওটিপি কোড এবং নতুন পাসওয়ার্ডটি নিচে লিখুন।
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। কোডটি পুনরায় চেক করুন।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Code */}
        <div>
          <label htmlFor="otpCode" className="block text-sm font-semibold text-slate-700 mb-1.5">
            ওটিপি (OTP) কোড <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <KeyRound className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="otpCode"
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="৬ ডিজিটের কোড"
              {...register('otpCode')}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setValue('otpCode', val);
              }}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.otpCode
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.otpCode && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.otpCode.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
            নতুন পাসওয়ার্ড <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="newPassword"
              type="password"
              placeholder="******"
              {...register('newPassword')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.newPassword
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.newPassword && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
            পাসওয়ার্ড নিশ্চিত করুন <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="******"
              {...register('confirmPassword')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.confirmPassword
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !phone}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>পাসওয়ার্ড রিসেট হচ্ছে...</span>
            </>
          ) : (
            <span>পাসওয়ার্ড রিসেট করুন</span>
          )}
        </button>
      </form>
    </div>
  );
}
