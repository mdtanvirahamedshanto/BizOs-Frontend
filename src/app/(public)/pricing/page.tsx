import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SubscriptionPlan } from '@/features/admin/types'; // Using existing type if available, or redefine

export const metadata: Metadata = {
  title: 'মূল্যতালিকা (Pricing) | BizOS',
  description: 'BizOS এর সহজ ও সাশ্রয়ী প্যাকেজসমূহ। আপনার ব্যবসার সাইজ অনুযায়ী সঠিক প্ল্যানটি বেছে নিন।',
};

// Fallback plans if API fails or backend isn't updated yet
const FALLBACK_PLANS = [
  {
    id: 'free',
    name: 'ফ্রি ট্রায়াল (Free Trial)',
    priceMonthly: 0,
    priceYearly: 0,
    maxProductsLimit: 50,
    maxTransactionsLimit: 100,
    description: 'নতুন ও ছোট দোকানের জন্য পারফেক্ট',
    buttonText: 'ফ্রি ব্যবহার শুরু করুন',
    buttonLink: '/register',
    highlighted: false,
  },
  {
    id: 'basic',
    name: 'বেসিক স্টোর (Starter Store)',
    priceMonthly: 50,
    priceYearly: 500,
    maxProductsLimit: 500,
    maxTransactionsLimit: 1000,
    description: 'যেসব দোকানে স্টাফ ও ইনভেন্টরি মাঝারি',
    buttonText: 'স্টার্টার দিয়ে শুরু করুন',
    buttonLink: '/register',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'প্রিমিয়াম বিআইজেড (Premium Biz)',
    priceMonthly: 500,
    priceYearly: 5000,
    maxProductsLimit: 'unlimited',
    maxTransactionsLimit: 'unlimited',
    description: 'একাধিক ব্রাঞ্চ বা চেইন শপের জন্য',
    buttonText: 'প্রিমিয়াম শুরু করুন',
    buttonLink: '/register',
    highlighted: true,
  },
];

async function getPlans() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    // We expect the backend /api/v1/platform/plans to be public.
    const res = await fetch(`${apiUrl}/platform/plans`, { 
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch plans');
    }
    
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as any[];
    }
    return FALLBACK_PLANS;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return FALLBACK_PLANS;
  }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          সহজ ও সাশ্রয়ী মূল্য
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          কোনো লুকানো চার্জ নেই। আপনার ব্যবসার জন্য যে প্ল্যানটি সবচেয়ে উপযুক্ত, সেটিই বেছে নিন। প্রতিটি পেইড প্ল্যানে ১৪ দিনের ফ্রি ট্রায়াল রয়েছে।
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => {
          const isPremium = plan.id === 'premium';
          const isBasic = plan.id === 'basic';
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 shadow-sm transition-all hover:shadow-lg flex flex-col h-full ${
                isPremium
                  ? 'bg-primary text-white scale-105 shadow-primary/20 border border-primary ring-2 ring-primary ring-offset-2' 
                  : isBasic
                  ? 'bg-white border-2 border-emerald-500/20 text-slate-900'
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              {isPremium && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> রিকমেন্ডেড (Featured)
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h2 className={`text-xl font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h2>
                <p className={`mt-2 text-sm ${isPremium ? 'text-violet-100' : 'text-slate-500'}`}>
                  {plan.description || (isPremium ? 'একাধিক ব্রাঞ্চ বা চেইন শপের জন্য' : isBasic ? 'যেসব দোকানে স্টাফ ও ইনভেন্টরি মাঝারি' : 'নতুন ও ছোট দোকানের জন্য পারফেক্ট')}
                </p>
              </div>

              <div className="mb-6 bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-baseline mb-2">
                  <span className={`text-xs font-bold ${isPremium ? 'text-violet-200' : 'text-slate-500'}`}>মাসিক ফি:</span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold tracking-tight">৳{plan.priceMonthly.toLocaleString()}</span>
                    <span className={`text-sm font-medium ${isPremium ? 'text-violet-200' : 'text-slate-500'} ml-1`}>/ মাস</span>
                  </div>
                </div>
                <div className={`flex justify-between items-baseline border-t ${isPremium ? 'border-white/20' : 'border-slate-200'} pt-2`}>
                  <span className={`text-xs font-bold ${isPremium ? 'text-violet-200' : 'text-slate-500'}`}>বাৎসরিক ছাড়:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">৳{plan.priceYearly.toLocaleString()}</span>
                    <span className={`text-xs font-medium ${isPremium ? 'text-violet-200' : 'text-slate-500'} ml-1`}>/ বছর</span>
                  </div>
                </div>
              </div>

              <div className="mb-8 space-y-3 pt-2 flex-1">
                <p className={`text-xs font-bold ${isPremium ? 'text-violet-200' : 'text-slate-500'}`}>প্ল্যান ক্যাপাসিটি লিমিট (Limits):</p>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPremium ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    <span className={isPremium ? 'text-white/90' : 'text-slate-600'}>
                      সর্বোচ্চ পণ্য সংখ্যা: <strong>{plan.maxProductsLimit === 'unlimited' ? 'সীমাহীন' : `${plan.maxProductsLimit} টি`}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPremium ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    <span className={isPremium ? 'text-white/90' : 'text-slate-600'}>
                      সর্বোচ্চ ট্রানজেকশন লিমিট: <strong>{plan.maxTransactionsLimit === 'unlimited' ? 'সীমাহীন' : `${plan.maxTransactionsLimit} টি/মাস`}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPremium ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    <span className={isPremium ? 'text-white/90' : 'text-slate-600'}>বকেয়া খাতা ও এসএমএস এলার্ট</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPremium ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    <span className={isPremium ? 'text-white/90' : 'text-slate-600'}>বাংলাদেশি এমএফএস ও মোবাইল সার্ভিস</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  isPremium
                    ? 'bg-white text-primary hover:bg-slate-50'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isPremium ? 'প্রিমিয়াম শুরু করুন' : isBasic ? 'স্টার্টার দিয়ে শুরু করুন' : 'ফ্রি ব্যবহার শুরু করুন'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <h3 className="text-xl font-bold text-slate-800">কোনো প্রশ্ন আছে?</h3>
        <p className="mt-2 text-slate-600 mb-6">আমাদের সাপোর্ট টিম সবসময় আপনার সাহায্যে প্রস্তুত।</p>
        <Link href="/contact" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          আমাদের সাথে কথা বলুন <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
