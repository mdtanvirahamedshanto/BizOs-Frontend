'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Menu, X } from 'lucide-react';
import { useUiStore } from '@/stores/use-ui';
import { AdminSidebar, AdminView } from '@/features/admin/components/admin-sidebar';
import { AdminOverview } from '@/features/admin/components/admin-overview';
import { TenantManager } from '@/features/admin/components/tenant-manager';
import { SubscriptionManager } from '@/features/admin/components/subscription-manager';
import { TicketManager } from '@/features/admin/components/ticket-manager';
import { MonitoringManager } from '@/features/admin/components/monitoring-manager';
import { FlagsManager } from '@/features/admin/components/flags-manager';

export default function AdminPage() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'overview':
        return <AdminOverview onNavigate={(view) => setCurrentView(view)} />;
      case 'tenants':
        return <TenantManager />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'tickets':
        return <TicketManager />;
      case 'monitoring':
        return <MonitoringManager />;
      case 'flags':
        return <FlagsManager />;
      default:
        return <AdminOverview onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  const getMobileHeaderTitle = () => {
    switch (currentView) {
      case 'overview': return 'ওভারভিউ';
      case 'tenants': return 'মার্চেন্ট';
      case 'subscriptions': return 'প্ল্যান';
      case 'tickets': return 'সাপোর্ট ডেস্ক';
      case 'monitoring': return 'মনিটরিং';
      case 'flags': return 'ফিচার ফ্ল্যাগ';
      default: return 'সুপার এডমিন';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Collapsible Sidebar */}
      <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Mobile Top Nav Bar */}
      <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-indigo-400" />
            BizOS: {getMobileHeaderTitle()}
          </span>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-[10px] font-bold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>অ্যাপ প্যানেল</span>
        </Link>
      </header>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-slate-950/90 z-20 transition-all p-4 space-y-2 flex flex-col">
          {[
            { id: 'overview', label: 'ওভারভিউ ড্যাশবোর্ড', name: 'Overview' },
            { id: 'tenants', label: 'মার্চেন্ট টেন্যান্টস', name: 'Tenants' },
            { id: 'subscriptions', label: 'প্ল্যান ও প্রাইসিং', name: 'Subscriptions' },
            { id: 'tickets', label: 'সাপোর্ট টিকিট ডেস্ক', name: 'Support Tickets' },
            { id: 'monitoring', label: 'সার্ভার মনিটরিং', name: 'System Monitoring' },
            { id: 'flags', label: 'ফিচার ফ্ল্যাগস', name: 'Feature Flags' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as AdminView);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3.5 rounded-xl font-bold text-xs flex justify-between items-center transition-all ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[9px] opacity-60 font-mono uppercase">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Workspace Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 items-center justify-between px-6 bg-white border-b border-slate-200/80 sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              সুপার এডমিন কন্ট্রোল ডেস্ক (SaaS Control Room)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                SA
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-bold text-slate-700">সুপার এডমিন</p>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  Super Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace views content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
