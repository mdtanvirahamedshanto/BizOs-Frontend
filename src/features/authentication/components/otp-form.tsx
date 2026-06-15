'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, KeyRound, Loader2, ArrowRight, Phone } from 'lucide-react';
import { otpSchema, OtpInput } from '../types';
import { useVerifyOtpMutation, useRequestOtpMutation } from '../api/auth-api';

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const shopId = searchParams.get('shopId') || '';

  const { mutate: verifyOtp, isPending, error } = useVerifyOtpMutation();
  const { mutate: requestOtp, isPending: isResending } = useRequestOtpMutation();

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [localShopId, setLocalShopId] = useState(shopId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!phone || !localShopId) return;
    requestOtp(
      { phone, shopId: localShopId },
      {
        onSuccess: () => {
          setTimer(60);
          setCanResend(false);
        },
      },
    );
  };

  const onSubmit = (data: OtpInput) => {
    if (!phone || !localShopId) return;

    verifyOtp(
      { phone, code: data.code, shopId: localShopId },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
      },
    );
  };

  const missingParams = !phone || !localShopId;

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          মোবাইল OTP লগইন
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          <span className="font-semibold text-slate-700">{phone || '01xxxxxxxxx'}</span> নম্বরে পাঠানো ৬ ডিজিটের OTP লিখুন।
        </p>
      </div>

      {!shopId && (
        <div className="mb-4">
          <label htmlFor="shopId" className="block text-xs font-semibold text-slate-700 mb-1">
            শপ আইডি (UUID) <span className="text-destructive">*</span>
          </label>
          <input
            id="shopId"
            type="text"
            value={localShopId}
            onChange={(e) => setLocalShopId(e.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {missingParams && (
        <div className="mb-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 p-3 text-xs font-semibold text-amber-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>ফোন নম্বর ও শপ আইডি প্রয়োজন। URL: /otp-verify?phone=01...&amp;shopId=...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'ভেরিফিকেশন কোডটি সঠিক নয়।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2 text-center">
            OTP কোড
          </label>
          <input
            id="code"
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="------"
            {...register('code')}
            onChange={(e) => setValue('code', e.target.value.replace(/\D/g, ''))}
            className="h-12 w-full tracking-[1.5em] text-center rounded-lg border border-slate-200 text-lg font-bold bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300"
          />
          {errors.code && (
            <p className="text-xs text-center text-destructive mt-1.5 font-semibold">
              {errors.code.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || missingParams}
          className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-primary/50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>যাচাই হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>লগইন করুন</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending || missingParams}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
          >
            {isResending ? 'পাঠানো হচ্ছে...' : 'OTP আবার পাঠান'}
          </button>
        ) : (
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {timer} সেকেন্ড পর আবার পাঠান
          </p>
        )}
      </div>
    </div>
  );
}
