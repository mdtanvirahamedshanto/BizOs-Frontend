'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth';

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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const dashboardLink = user?.role === 'SuperAdmin' ? '/admin' : '/dashboard';

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50">
      <header className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="BizOS Home">
            <BrandLogo size="sm" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"
            >
              হোম
            </Link>
            {!isLoading && isAuthenticated ? (
              <Link
                href={dashboardLink}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/95 active:scale-[0.98]"
              >
                ড্যাশবোর্ডে যান
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/95 active:scale-[0.98]"
              >
                লগইন
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 sm:py-16 mt-auto">
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
