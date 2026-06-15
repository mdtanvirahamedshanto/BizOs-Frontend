'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Loader2 } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '../types';
import { useResetPasswordMutation } from '../api/auth-api';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { mutate: resetPassword, isPending, error } = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword(
      { token: data.token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          router.push('/login');
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          নতুন পাসওয়ার্ড তৈরি করুন
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          ইমেইলে পাওয়া রিসেট টোকেন ও নতুন পাসওয়ার্ড দিন।
        </p>
      </div>

      {!token && (
        <div className="mb-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 p-3 text-xs font-semibold text-amber-800">
          রিসেট টোকেন পাওয়া যায়নি। ইমেইলের লিংক ব্যবহার করুন।
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

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
              autoComplete="new-password"
              placeholder="********"
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
              autoComplete="new-password"
              placeholder="********"
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

        <button
          type="submit"
          disabled={isPending || !token}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50"
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
