'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, Lock, Store, FileSpreadsheet, Loader2 } from 'lucide-react';
import { registerSchema, RegisterInput } from '../types';
import { useRegisterMutation } from '../api/auth-api';

const BUSINESS_TYPES = [
  { value: 'grocery', label: 'মুদি দোকান (Grocery Store)' },
  { value: 'mobile_banking', label: 'মোবাইল ব্যাংকিং এজেন্টস (Mobile Banking)' },
  { value: 'flexiload', label: 'ফ্লেক্সিলোড / রিচার্জ শপ (Flexiload)' },
  { value: 'wholesale', label: 'পাইকারি ব্যবসা (Wholesale Business)' },
  { value: 'clothing', label: 'পোশাকের দোকান (Clothing Shop)' },
  { value: 'electronics', label: 'ইলেকট্রনিক্স দোকান (Electronics Store)' },
  { value: 'hardware', label: 'হার্ডওয়্যার ও স্যানিটারি (Hardware)' },
  { value: 'restaurant', label: 'রেস্টুরেন্ট ও খাবার দোকান (Restaurant)' },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const { mutate: registerUser, isPending, error } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      businessName: '',
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data, {
      onSuccess: () => {
        // Redirect to OTP verification page carrying the phone number
        router.push(`/otp-verify?phone=${encodeURIComponent(data.phone)}`);
      },
    });
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Biz<span className="text-primary">OS</span> এ নতুন অ্যাকাউন্ট
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          আপনার ব্যবসার হিসাব ডিজিটাল করতে তথ্যগুলো দিন
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'অ্যাকাউন্ট খুলতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            আপনার নাম <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="যেমন: মোঃ আব্দুল করিম"
              {...register('name')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.name
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Mobile Phone */}
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
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
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

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
            পাসওয়ার্ড (কমপক্ষে ৬ অক্ষরের) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="******"
              {...register('password')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.password
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.password.message}</p>
          )}
        </div>

        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 mb-1.5">
            ব্যবসা প্রতিষ্ঠানের নাম <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Store className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="businessName"
              type="text"
              placeholder="যেমন: করিম ব্রাদার্স এন্ড কোং"
              {...register('businessName')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all ${
                errors.businessName
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.businessName && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.businessName.message}</p>
          )}
        </div>

        {/* Business Type dropdown */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-semibold text-slate-700 mb-1.5">
            ব্যবসার ধরন <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FileSpreadsheet className="h-4 w-4 text-slate-400" />
            </div>
            <select
              id="businessType"
              {...register('businessType')}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-sm bg-white outline-none transition-all ${
                errors.businessType
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            >
              <option value="">নির্বাচন করুন</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {errors.businessType && (
            <p className="text-xs text-destructive mt-1 font-semibold">{errors.businessType.message}</p>
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
              <span>লোডিং...</span>
            </>
          ) : (
            <span>অ্যাকাউন্ট খুলুন</span>
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
