'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  Wallet,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth';

const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'দ্রুত POS বিক্রি',
    subtitle: 'Offline-first POS',
    description: 'বারকোড স্ক্যান, ডিসকাউন্ট, স্প্লিট পেমেন্ট — ইন্টারনেট ছাড়াই বিক্রি চালু রাখুন।',
    color: 'bg-violet-100 text-primary',
  },
  {
    icon: BookOpen,
    title: 'খাতা ও বাকি হিসাব',
    subtitle: 'Khata Ledger',
    description: 'গ্রাহক-সাপ্লায়ারের বাকি, আদায় ও পরিশোধ এক জায়গায় — কাগজের খাতার বিকল্প।',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Store,
    title: 'ইনভেন্টরি নিয়ন্ত্রণ',
    subtitle: 'Stock Management',
    description: 'স্টক ইন/আউট, লো-স্টক অ্যালার্ট, ক্যাটাগরি ও ব্যাচ ট্র্যাকিং।',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Truck,
    title: 'ক্রয় ব্যবস্থাপনা',
    subtitle: 'Purchase Orders',
    description: 'সাপ্লায়ার PO, রিসিভিং ও পেয়েবল — ক্রয় থেকে স্টক পর্যন্ত সম্পূর্ণ ফ্লো।',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Wallet,
    title: 'ক্যাশবুক ও MFS',
    subtitle: 'Cash & bKash',
    description: 'নগদ, bKash, Nagad — প্রতিটি লেনদেন ক্যাশবুকে অটো রেকর্ড।',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    icon: BarChart3,
    title: 'রিপোর্ট ও ইনসাইট',
    subtitle: 'Business Reports',
    description: 'বিক্রি, লাভ, স্টক ও বাকি — রিয়েল-টাইম ড্যাশবোর্ড ও এক্সপোর্ট।',
    color: 'bg-indigo-100 text-indigo-700',
  },
] as const;

const HIGHLIGHTS = [
  'বাংলা UI — দোকানদারদের জন্য তৈরি',
  'অফলাইনে কাজ করে, অনলাইনে সিঙ্ক',
  'PWA — মোবাইলে অ্যাপের মতো',
  'মাল্টি-শপ ও রোল-ভিত্তিক অ্যাক্সেস',
] as const;

function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg';
  const text = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.png" alt="BizOS Logo" className={`${size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'} object-contain`} />
      <span className={`font-bold ${text} tracking-tight text-slate-800`}>
        Biz<span className="text-primary">OS</span>
      </span>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-200/30 to-emerald-200/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[10px] font-medium text-slate-400">dashboard.bizos.bd</span>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'আজকের বিক্রি', value: '৳ ৪২,৫০০', trend: '+১২%' },
              { label: 'মোট বাকি', value: '৳ ১,৮৫,০০০', trend: '৩২ গ্রাহক' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="text-[10px] font-medium text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{kpi.value}</p>
                <p className="text-[10px] font-semibold text-emerald-600">{kpi.trend}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">সাপ্তাহিক বিক্রি</span>
              <span className="text-[10px] text-slate-400">৭ দিন</span>
            </div>
            <div className="flex h-16 items-end gap-1.5">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
            <WifiOff className="h-3.5 w-3.5" />
            অফলাইনে ৩টি বিক্রি সিঙ্ক হয়েছে
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const dashboardLink = user?.role === 'SuperAdmin' ? '/admin' : '/dashboard';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-200/20 blur-3xl" />

      <header className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="BizOS Home">
            <BrandLogo size="sm" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {!isLoading && isAuthenticated ? (
              <Link
                href={dashboardLink}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/95 active:scale-[0.98]"
              >
                ড্যাশবোর্ডে যান
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"
                >
                  লগইন
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/95 active:scale-[0.98]"
                >
                  বিনামূল্যে শুরু করুন
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                <Zap className="h-3.5 w-3.5" />
                বাংলাদেশের SME-দের জন্য তৈরি
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                আপনার দোকানের{' '}
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  সম্পূর্ণ অপারেটিং সিস্টেম
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 lg:mx-0 lg:text-lg">
                POS, ইনভেন্টরি, খাতা, ক্রয়, ক্যাশবুক ও রিপোর্ট — সব এক প্ল্যাটফর্মে।
                অফলাইন-ফার্স্ট, বাংলা UI, বাংলাদেশি পেমেন্ট মেথড সাপোর্ট।
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                {!isLoading && isAuthenticated ? (
                  <Link
                    href={dashboardLink}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 active:scale-[0.98] sm:w-auto"
                  >
                    ড্যাশবোর্ডে যান
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 active:scale-[0.98] sm:w-auto"
                    >
                      ১৪ দিন ফ্রি ট্রায়াল শুরু করুন
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                    >
                      ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন
                    </Link>
                  </>
                )}
              </div>

              <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <DashboardPreview />
          </div>
        </section>

        <section className="border-y border-slate-200/60 bg-white/60 py-14 backdrop-blur-sm sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                দোকান চালানোর যা যা লাগে — সবই এখানে
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Retail, wholesale, mobile recharge — এক প্ল্যাটফর্ম, পূর্ণ ওয়ার্কফ্লো
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{feature.title}</h3>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {feature.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 px-6 py-12 text-center shadow-2xl shadow-primary/30 sm:px-12 sm:py-16">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/90">
                <Smartphone className="h-3.5 w-3.5" />
                PWA — ইনস্টল করে অফলাইনে ব্যবহার করুন
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                আজই BizOS দিয়ে আপনার ব্যবসা ডিজিটাল করুন
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-violet-100 sm:text-base">
                কোনো ক্রেডিট কার্ড লাগবে ঘন। মিনিটের মধ্যে শপ সেটআপ, টিম ইনভাইট, প্রথম বিক্রি শুরু।
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!isLoading && isAuthenticated ? (
                  <Link
                    href={dashboardLink}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-primary shadow-lg transition-all hover:bg-violet-50 active:scale-[0.98] sm:w-auto"
                  >
                    ড্যাশবোর্ডে যান
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-primary shadow-lg transition-all hover:bg-violet-50 active:scale-[0.98] sm:w-auto"
                    >
                      ফ্রি অ্যাকাউন্ট খুলুন
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/30 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 sm:w-auto"
                    >
                      লগইন করুন
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4 lg:gap-16">
            <div className="md:col-span-1">
              <BrandLogo size="md" />
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                বাংলাদেশের SME-দের জন্য সেরা রিটেইল ও হোলসেল অপারেটিং সিস্টেম।
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">প্রোডাক্ট</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><Link href="/how-to-use" className="hover:text-primary transition-colors">কীভাবে ব্যবহার করবেন</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">মূল্য</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">কোম্পানি</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">যোগাযোগ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4">পলিসি</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><Link href="/terms" className="hover:text-primary transition-colors">শর্তাবলী</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">প্রাইভেসি পলিসি</Link></li>
                <li><Link href="/refund-policy" className="hover:text-primary transition-colors">রিফান্ড পলিসি</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 pt-8 sm:flex-row gap-4">
            <p className="text-sm font-medium text-slate-500">
              © {new Date().getFullYear()} BizOS Bangladesh. সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
              Developed with <span className="text-red-500">❤️</span> by <a href="https://tashanto.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Ta-Shanto</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
