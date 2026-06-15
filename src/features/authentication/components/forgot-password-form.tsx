'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordInput } from '../types';
import { useForgotPasswordMutation } from '../api/auth-api';
import { useAuthStore } from '@/stores/use-auth';

export function ForgotPasswordForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mutate: forgotPassword, isPending, error, isSuccess } = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: user?.email ?? '',
      shopId: user?.shopId ?? '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data, {
      onSuccess: () => {
        router.push('/login');
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
          আপনার রেজিস্টার্ড ইমেইল ও শপ আইডি দিন। রিসেট লিংক ইমেইলে পাঠানো হবে।
        </p>
      </div>

      {isSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 border-l-4 border-green-500 p-3 text-xs font-semibold text-green-800">
          রিসেট লিংক পাঠানো হয়েছে। ইমেইল চেক করুন।
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'ইমেইল বা শপ আইডি সঠিক নয়।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            ইমেইল <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`h-11 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.email
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="shopId" className="block text-sm font-semibold text-slate-700 mb-1.5">
            শপ আইডি <span className="text-destructive">*</span>
          </label>
          <input
            id="shopId"
            type="text"
            placeholder="00000000-0000-0000-0000-000000000000"
            {...register('shopId')}
            className={`h-10 w-full rounded-lg border px-3 text-xs font-mono outline-none transition-all ${
              errors.shopId
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
          {errors.shopId && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.shopId.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>পাঠানো হচ্ছে...</span>
            </>
          ) : (
            <span>রিসেট লিংক পাঠান</span>
          )}
        </button>
      </form>
    </div>
  );
}
