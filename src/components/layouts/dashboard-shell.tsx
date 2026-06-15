'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { useUiStore } from '@/stores/use-ui';
import { AuthGuard } from '@/components/auth/auth-provider';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Sidebar />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'md:pl-64' : 'md:pl-16'
          } pb-16 md:pb-0`}
        >
          <Topbar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        <MobileNav />
      </div>
    </AuthGuard>
  );
}
