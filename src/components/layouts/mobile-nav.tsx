'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Warehouse,
  BookOpen,
  Menu,
  X,
  Store,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Truck,
  Receipt,
  Wallet,
  Smartphone,
  Send,
  Shield,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useTenantStore } from '@/stores/use-tenant';
import { usePermissions, type Permission } from '@/hooks/use-permissions';
import { useLogoutMutation } from '@/features/authentication/api/auth-api';

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

// Primary actions shown in the always-visible bottom tab bar
const PRIMARY_ITEMS: NavLink[] = [
  { name: 'হোম', href: '/dashboard', icon: LayoutDashboard },
  { name: 'বিক্রয়', href: '/dashboard/pos', icon: ShoppingBag, permission: 'pos:checkout' },
  { name: 'স্টক', href: '/dashboard/inventory', icon: Warehouse, permission: 'inventory:read' },
  { name: 'হিসাব', href: '/dashboard/ledger', icon: BookOpen, permission: 'ledger:read' },
];

// Full menu shown in the slide-out drawer (parity with desktop sidebar)
const DRAWER_ITEMS: NavLink[] = [
  { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
  { name: 'বিক্রয় (POS)', href: '/dashboard/pos', icon: ShoppingBag, permission: 'pos:checkout' },
  { name: 'ইনভেন্টরি', href: '/dashboard/inventory', icon: Warehouse, permission: 'inventory:read' },
  { name: 'ক্রয় ব্যবস্থাপনা', href: '/dashboard/purchases', icon: Truck, permission: 'purchases:read' },
  { name: 'লেনদেন হিসেব', href: '/dashboard/ledger', icon: BookOpen, permission: 'ledger:read' },
  { name: 'খরচ ব্যবস্থাপনা', href: '/dashboard/expenses', icon: Receipt, permission: 'expenses:read' },
  { name: 'ক্যাশবুক হিসাব', href: '/dashboard/cashbook', icon: Wallet, permission: 'cashbook:read' },
  { name: 'মোবাইল সার্ভিস', href: '/dashboard/mobile-services', icon: Smartphone, permission: 'mfs:read' },
  { name: 'টেলিগ্রাম বট', href: '/dashboard/telegram', icon: Send, permission: 'telegram:read' },
  { name: 'গ্রাহক তালিকা', href: '/dashboard/customers', icon: Users, permission: 'customers:read' },
  { name: 'রিপোর্ট সমূহ', href: '/dashboard/reports', icon: BarChart3, permission: 'reports:read' },
  { name: 'সেটিংস', href: '/dashboard/settings', icon: Settings, permission: 'settings:write' },
];

function getDisplayName(user: { name?: string; email?: string } | null | undefined): string {
  return user?.name?.trim() || user?.email?.split('@')[0] || 'ইউজার';
}

function roleLabel(role?: string): string {
  if (role === 'Owner') return 'মালিক (Owner)';
  if (role === 'Manager') return 'ম্যানেজার (Manager)';
  return 'ক্যাশিয়ার (Cashier)';
}

export function MobileNav() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentBusiness = useTenantStore((state) =>
    state.businesses.find((b) => b.id === state.activeBusinessId),
  );
  const { user, role, hasPermission } = usePermissions();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [drawerOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const visiblePrimary = PRIMARY_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );
  const visibleDrawer = DRAWER_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        setDrawerOpen(false);
        router.push('/login');
      },
    });
  };

  return (
    <>
      {/* Bottom Sticky Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 h-mobile-nav border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-stretch justify-around px-1 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.04)] md:hidden">
        {visiblePrimary.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                active ? 'text-primary' : 'text-slate-500'
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
            drawerOpen ? 'text-primary' : 'text-slate-500'
          }`}
          aria-label="মেনু খুলুন"
        >
          <Menu className={`h-5 w-5 ${drawerOpen ? 'text-primary' : 'text-slate-400'}`} />
          <span>মেনু</span>
        </button>
      </nav>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header — business + user */}
            <div className="pt-safe">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <span className="truncate font-bold text-slate-800">
                    {currentBusiness?.name || 'BizOS'}
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                  aria-label="বন্ধ করুন"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User card */}
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {getDisplayName(user).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{getDisplayName(user)}</p>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Shield className="h-3 w-3" />
                  <span>{roleLabel(role)}</span>
                </div>
              </div>
            </div>

            {/* Menu links */}
            <div className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {visibleDrawer.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-slate-400'}`} />
                      {item.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 p-3 pb-safe">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>লগ আউট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>লগ আউট (Log Out)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
