import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LogIn, ShoppingCart, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'কীভাবে ব্যবহার করবেন | BizOS',
  description: 'BizOS POS এবং ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম কীভাবে সেটআপ করবেন এবং ব্যবহার করবেন তার বিস্তারিত গাইড।',
};

export default function HowToUsePage() {
  const steps = [
    {
      title: 'অ্যাকাউন্ট তৈরি করুন',
      description: 'আপনার ইমেইল, ফোন নম্বর এবং দোকানের নাম দিয়ে একটি নতুন অ্যাকাউন্ট তৈরি করুন। এটি করতে মাত্র ১ মিনিট সময় লাগবে।',
      icon: LogIn,
    },
    {
      title: 'প্রোডাক্ট এবং ইনভেন্টরি যোগ করুন',
      description: 'ড্যাশবোর্ড থেকে "ইনভেন্টরি" অপশনে গিয়ে আপনার দোকানের সব প্রোডাক্ট, দাম এবং স্টকের পরিমাণ অ্যাড করুন। আপনি চাইলে এক্সেল ফাইল দিয়ে একসাথে অনেক প্রোডাক্ট আপলোড করতে পারেন।',
      icon: ShoppingCart,
    },
    {
      title: 'কর্মচারীদের ইনভাইট করুন',
      description: 'আপনার দোকানে যদি স্টাফ বা ক্যাশিয়ার থাকে, তবে "টিম" অপশন থেকে তাদের রোল সিলেক্ট করে ইনভাইট করুন। তারা শুধু তাদের জন্য নির্ধারিত ফিচারগুলো দেখতে পাবে।',
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl text-center">কীভাবে ব্যবহার করবেন</h1>
      <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">খুব সহজেই মাত্র কয়েকটি ধাপে শুরু করুন আপনার দোকানের সম্পূর্ণ ডিজিটাল হিসাব-নিকাশ।</p>
      
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 sm:gap-6 items-start bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="font-bold text-lg hidden"> {index + 1} </span>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">ধাপ {index + 1}: {step.title}</h2>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/register" 
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95"
        >
          এখনই শুরু করুন
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
