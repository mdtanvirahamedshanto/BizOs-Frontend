'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, LoginInput } from '../types';
import { useLoginMutation } from '../api/auth-api';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginUser, isPending, error } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginUser(data, {
      onSuccess: (result) => {
        if (result.user.role === 'SuperAdmin' && !searchParams.get('redirect')) {
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
      },
    });
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <img src="/logo.png" alt="BizOS Logo" className="h-12 w-12 object-contain mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Biz<span className="text-primary">OS</span> এ লগইন করুন
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          আপনার ব্যবসার হিসাব নিকাশ সহজ করতে শুরু করুন
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।'}
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
              autoComplete="email"
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              পাসওয়ার্ড <span className="text-destructive">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="********"
              {...register('password')}
              className={`h-11 w-full rounded-lg border pl-9 pr-10 text-sm outline-none transition-all ${
                errors.password
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50 disabled:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>লোডিং...</span>
            </>
          ) : (
            <span>লগইন করুন</span>
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-slate-100 space-y-2">
        <p className="text-xs text-slate-500 font-medium">
          আপনার কোনো অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </p>
        <p className="text-xs text-slate-400">
          ফোন দিয়ে লগইন?{' '}
          <Link href="/otp-verify" className="font-semibold text-primary hover:underline">
            OTP ভেরিফিকেশন
          </Link>
        </p>
      </div>
    </div>
  );
}
