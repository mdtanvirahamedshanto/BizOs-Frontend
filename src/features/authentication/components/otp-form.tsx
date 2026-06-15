'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { otpSchema, OtpInput } from '../types';
import { useVerifyOtpMutation } from '../api/auth-api';

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const { mutate: verifyOtp, isPending, error } = useVerifyOtpMutation();

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  // Countdown timer logic
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    alert(`ওটিপি আবার পাঠানো হয়েছে ${phone} নম্বরে।`);
  };

  const onSubmit = (data: OtpInput) => {
    if (!phone) {
      alert('মোবাইল নম্বর পাওয়া যায়নি। অনুগ্রহ করে আবার শুরু করুন।');
      return;
    }

    verifyOtp(
      { phone, code: data.code },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          মোবাইল নম্বর ভেরিফিকেশন
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          আপনার প্রদত্ত মোবাইল নম্বর <span className="font-semibold text-slate-700">{phone || '01xxxxxxxxx'}</span> এ পাঠানো ৬ ডিজিটের ওটিপি (OTP) কোডটি এখানে লিখুন।
        </p>
      </div>

      {!phone && (
        <div className="mb-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 p-3 text-xs font-semibold text-amber-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>মোবাইল নম্বর পাওয়া যায়নি। অনুগ্রহ করে আগের পেইজে ফিরে যান।</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-destructive p-3 text-xs font-semibold text-destructive">
          {error.message || 'ভেরিফিকেশন কোডটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Input */}
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2 text-center">
            ওটিপি (OTP) কোড লিখুন
          </label>
          <input
            id="code"
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="------"
            {...register('code')}
            onChange={(e) => {
              // Only allow digits
              const cleanVal = e.target.value.replace(/\D/g, '');
              setValue('code', cleanVal);
            }}
            className="h-12 w-full tracking-[1.5em] text-center rounded-lg border border-slate-200 text-lg font-bold bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300"
          />
          {errors.code && (
            <p className="text-xs text-center text-destructive mt-1.5 font-semibold">
              {errors.code.message}
            </p>
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
              <span>কোড ভেরিফাই করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>কোড যাচাই করুন</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Actions */}
      <div className="text-center mt-6 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-xs font-bold text-primary hover:underline"
          >
            ওটিপি (OTP) আবার পাঠান
          </button>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            কোড পাননি? <span className="font-bold text-slate-700">{timer} সেকেন্ড</span> পর আবার পাঠান।
          </p>
        )}
      </div>
    </div>
  );
}
