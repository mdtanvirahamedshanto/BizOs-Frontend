'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  ToggleLeft,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useUiStore } from '@/stores/use-ui';

export type AdminView = 
  | 'overview'
  | 'tenants'
  | 'subscriptions'
  | 'tickets'
  | 'monitoring'
  | 'flags';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

interface AdminNavItem {
  id: AdminView;
  name: string;
  banglaName: string;
  icon: React.ComponentType<any>;
}

const ADMIN_NAVIGATION_ITEMS: AdminNavItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    banglaName: 'ওভারভিউ ড্যাশবোর্ড',
    icon: LayoutDashboard,
  },
  {
    id: 'tenants',
    name: 'Tenants',
    banglaName: 'মার্চেন্ট টেন্যান্টস',
    icon: Users,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    banglaName: 'প্ল্যান ও প্রাইসিং',
    icon: CreditCard,
  },
  {
    id: 'tickets',
    name: 'Support Tickets',
    banglaName: 'সাপোর্ট টিকিট ডেস্ক',
    icon: MessageSquare,
  },
  {
    id: 'monitoring',
    name: 'System Monitoring',
    banglaName: 'সার্ভার মনিটরিং',
    icon: Activity,
  },
  {
    id: 'flags',
    name: 'Feature Flags',
    banglaName: 'ফিচার ফ্ল্যাগস',
    icon: ToggleLeft,
  },
];

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-20 hidden md:flex flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Superadmin Panel Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg animate-pulse">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              BizOS <span className="text-indigo-400 font-medium text-xs bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/30">SAAS ADMIN</span>
            </span>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg mx-auto">
            <ShieldAlert className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Admin Quick Indicator */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-800/50 border border-slate-800 text-xs text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-medium truncate">সুপার এডমিন সেশন একটিভ</span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        )}
      </div>

      {/* Sidebar Nav Items */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {ADMIN_NAVIGATION_ITEMS.map((item) => {
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              {sidebarOpen && (
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{item.banglaName}</span>
                  <span className="text-[10px] text-slate-500 font-normal leading-none mt-0.5">
                    {item.name}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Return to App Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 text-xs font-semibold transition-all border border-slate-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {sidebarOpen && (
            <div className="flex flex-col text-left min-w-0">
              <span className="leading-none mb-0.5">মার্চেন্ট প্যানেল</span>
              <span className="text-[9px] text-slate-500 font-normal leading-none truncate">Return to App</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
