'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { useUiStore } from '@/stores/use-ui';
import { useTenantStore } from '@/stores/use-tenant';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setTenants = useTenantStore((state) => state.setTenants);

  // Bootstrap initial mock merchant tenant data for demonstration
  useEffect(() => {
    setTenants(
      [
        {
          id: 'biz-01',
          name: 'শরীফ জেনারেল স্টোর',
          type: 'grocery',
        },
        {
          id: 'biz-02',
          name: 'অনন্যা কসমেটিকস',
          type: 'clothing',
        },
      ],
      [
        {
          id: 'br-01',
          businessId: 'biz-01',
          name: 'মিরপুর শাখা',
          address: 'মিরপুর ১০, ঢাকা',
        },
        {
          id: 'br-02',
          businessId: 'biz-01',
          name: 'উত্তরা শাখা',
          address: 'সেক্টর ৪, ঢাকা',
        },
        {
          id: 'br-03',
          businessId: 'biz-02',
          name: 'প্রধান শাখা',
          address: 'ধানমন্ডি, ঢাকা',
        },
      ]
    );
  }, [setTenants]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Desktop Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        } pb-16 md:pb-0`}
      >
        {/* Top Header Navbar */}
        <Topbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Tab bar */}
      <MobileNav />
    </div>
  );
}
