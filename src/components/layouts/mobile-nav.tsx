'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import { useTenantStore } from '@/stores/use-tenant';
import { usePermissions } from '@/hooks/use-permissions';

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentBusiness = useTenantStore((state) =>
    state.businesses.find((b) => b.id === state.activeBusinessId),
  );
  const { hasPermission, role } = usePermissions();

  const handleLinkClick = () => {
    setDrawerOpen(false);
  };

  const navItems = [
    { name: 'হোম', href: '/dashboard', icon: LayoutDashboard },
    { name: 'বিক্রয়', href: '/dashboard/pos', icon: ShoppingBag, permission: 'pos:checkout' },
    { name: 'স্টক', href: '/dashboard/inventory', icon: Warehouse, permission: 'inventory:read' },
    { name: 'হিসাব', href: '/dashboard/ledger', icon: BookOpen, permission: 'ledger:read' },
  ];

  // Filter primary links
  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission as any)
  );

  return (
    <>
      {/* Bottom Sticky Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-around md:hidden px-2 pb-safe shadow-lg">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-all ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <item.icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Menu Toggle Drawer Button */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-all ${
            drawerOpen ? 'text-primary' : 'text-slate-500'
          }`}
          aria-label="Open navigation menu drawer"
        >
          <Menu className="h-5 w-5 mb-0.5 text-slate-400" />
          <span>মেনু</span>
        </button>
      </div>

      {/* Slide-out Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Sheet Drawer container */}
          <div className="relative flex flex-col w-80 max-w-sm h-full bg-white ml-auto p-5 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-bold text-slate-800">{currentBusiness?.name || 'BizOS'}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account Role Info */}
            <div className="my-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500">লগইন করা রোল</p>
              <p className="text-sm font-bold text-slate-800">
                {role === 'Owner' ? 'মালিক (Owner)' : role === 'Manager' ? 'ম্যানেজার (Manager)' : 'ক্যাশিয়ার (Cashier)'}
              </p>
            </div>

            {/* Menu Links */}
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              <Link
                href="/dashboard/customers"
                onClick={handleLinkClick}
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Users className="h-5 w-5 text-slate-400" />
                <span>গ্রাহক তালিকা (Customers)</span>
              </Link>

              {hasPermission('reports:read') && (
                <Link
                  href="/dashboard/reports"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  <span>রিপোর্ট সমূহ (Reports)</span>
                </Link>
              )}

              {hasPermission('settings:write') && (
                <Link
                  href="/dashboard/settings"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-5 w-5 text-slate-400" />
                  <span>সেটিংস (Settings)</span>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  alert('লগআউট করা হচ্ছে...');
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>লগ আউট (Log Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
