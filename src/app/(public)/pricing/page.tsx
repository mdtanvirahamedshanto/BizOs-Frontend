import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'মূল্যতালিকা (Pricing) | BizOS',
  description: 'BizOS এর সহজ ও সাশ্রয়ী প্যাকেজসমূহ। আপনার ব্যবসার সাইজ অনুযায়ী সঠিক প্ল্যানটি বেছে নিন।',
};

const PLANS = [
  {
    name: 'ফ্রি (Free)',
    price: '৳ ০',
    period: '/মাস',
    description: 'নতুন ও ছোট দোকানের জন্য পারফেক্ট',
    features: [
      '১টি দোকান',
      'সর্বোচ্চ ১০০ টি প্রোডাক্ট',
      '১ জন ইউজার (মালিক)',
      'অফলাইন পেমেন্ট ও খাতা',
      'বেসিক রিপোর্ট',
    ],
    buttonText: 'ফ্রি ব্যবহার শুরু করুন',
    buttonLink: '/register',
    highlighted: false,
  },
  {
    name: 'প্রফেশনাল (Pro)',
    price: '৳ ৪৯৯',
    period: '/মাস',
    description: 'যেসব দোকানে স্টাফ ও ইনভেন্টরি বেশি',
    features: [
      '১টি দোকান',
      'আনলিমিটেড প্রোডাক্ট',
      '৫ জন পর্যন্ত ইউজার (স্টাফ/ম্যানেজার)',
      'অ্যাডভান্সড ইনভেন্টরি ও লস ট্র্যাকিং',
      'MFS (bKash, Nagad) হিসাব',
      'সকল প্রিমিয়াম রিপোর্ট',
      'প্রাইওরিটি কাস্টমার সাপোর্ট',
    ],
    buttonText: '১৪ দিন ফ্রি ট্রায়াল',
    buttonLink: '/register',
    highlighted: true,
  },
  {
    name: 'এন্টারপ্রাইজ (Enterprise)',
    price: 'কাস্টম',
    period: '',
    description: 'একাধিক ব্রাঞ্চ বা চেইন শপের জন্য',
    features: [
      'একাধিক ব্রাঞ্চ/দোকান',
      'আনলিমিটেড প্রোডাক্ট ও ইউজার',
      'সেন্ট্রাল ইনভেন্টরি ম্যানেজমেন্ট',
      'কাস্টম রিপোর্ট ও অ্যানালিটিক্স',
      'কাস্টম ডোমেইন (যদি প্রয়োজন হয়)',
      'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার',
    ],
    buttonText: 'যোগাযোগ করুন',
    buttonLink: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
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
        {PLANS.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-3xl p-8 shadow-sm transition-all hover:shadow-lg ${
              plan.highlighted 
                ? 'bg-primary text-white scale-105 shadow-primary/20 border border-primary ring-2 ring-primary ring-offset-2' 
                : 'bg-white border border-slate-200 text-slate-900'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm">
                  সবচেয়ে জনপ্রিয়
                </span>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h2>
              <p className={`mt-2 text-sm ${plan.highlighted ? 'text-violet-100' : 'text-slate-500'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
              {plan.period && <span className={`text-sm font-medium ${plan.highlighted ? 'text-violet-200' : 'text-slate-500'}`}>{plan.period}</span>}
            </div>

            <ul className="mb-8 space-y-4 text-sm flex-1">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start gap-3">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-emerald-300' : 'text-emerald-500'}`} />
                  <span className={plan.highlighted ? 'text-white/90' : 'text-slate-600'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.buttonLink}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
                plan.highlighted
                  ? 'bg-white text-primary hover:bg-slate-50'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {plan.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
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
