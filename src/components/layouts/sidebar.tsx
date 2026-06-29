'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Warehouse, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Store,
  Truck,
  Receipt,
  MapPin,
  ChevronsUpDown,
  Smartphone,
  Send,
  Wallet,
  ShieldAlert
} from 'lucide-react';
import { useUiStore } from '@/stores/use-ui';
import { useTenantStore } from '@/stores/use-tenant';
import { usePermissions, Permission } from '@/hooks/use-permissions';

interface NavItem {
  name: string;
  banglaName: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: Permission;
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    banglaName: 'ড্যাশবোর্ড',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'POS',
    banglaName: 'বিক্রয় (POS)',
    href: '/dashboard/pos',
    icon: ShoppingBag,
    permission: 'pos:checkout',
  },
  {
    name: 'Inventory',
    banglaName: 'ইনভেন্টরি',
    href: '/dashboard/inventory',
    icon: Warehouse,
    permission: 'inventory:read',
  },
  {
    name: 'Purchases',
    banglaName: 'ক্রয় ব্যবস্থাপনা',
    href: '/dashboard/purchases',
    icon: Truck,
    permission: 'purchases:read',
  },
  {
    name: 'Ledger',
    banglaName: 'লেনদেন হিসেব',
    href: '/dashboard/ledger',
    icon: BookOpen,
    permission: 'ledger:read',
  },
  {
    name: 'Expenses',
    banglaName: 'খরচ ব্যবস্থাপনা',
    href: '/dashboard/expenses',
    icon: Receipt,
    permission: 'expenses:read',
  },
  {
    name: 'Cashbook',
    banglaName: 'ক্যাশবুক হিসাব',
    href: '/dashboard/cashbook',
    icon: Wallet,
    permission: 'cashbook:read',
  },
  {
    name: 'Mobile Services',
    banglaName: 'মোবাইল সার্ভিস',
    href: '/dashboard/mobile-services',
    icon: Smartphone,
    permission: 'mfs:read',
  },
  {
    name: 'Telegram',
    banglaName: 'টেলিগ্রাম বট',
    href: '/dashboard/telegram',
    icon: Send,
    permission: 'telegram:read',
  },
  {
    name: 'Customers',
    banglaName: 'গ্রাহক তালিকা',
    href: '/dashboard/customers',
    icon: Users,
    permission: 'customers:read',
  },
  {
    name: 'Reports',
    banglaName: 'রিপোর্ট সমূহ',
    href: '/dashboard/reports',
    icon: BarChart3,
    permission: 'reports:read',
  },
  {
    name: 'Settings',
    banglaName: 'সেটিংস',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'settings:write',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  
  const { businesses, branches, activeBusinessId, activeBranchId, setActiveBusiness, setActiveBranch } = useTenantStore();
  const { hasPermission, role } = usePermissions();

  const currentBusiness = businesses.find((b) => b.id === activeBusinessId);
  const currentBranch = branches.find((b) => b.id === activeBranchId);

  // Filter items based on RBAC permissions
  const visibleNavItems = NAVIGATION_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-20 hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand logo & collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BizOS Logo" className="h-9 w-9 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Biz<span className="text-primary">OS</span>
            </span>
          </div>
        ) : (
          <img src="/logo.png" alt="BizOS Logo" className="h-9 w-9 object-contain mx-auto" />
        )}

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Tenant context selector */}
      <div className="p-3 border-b border-slate-100">
        {sidebarOpen ? (
          <div className="relative group">
            <div className="flex items-center justify-between w-full p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/50">
              <div className="flex items-center gap-2 min-w-0">
                <Store className="h-5 w-5 text-primary shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate leading-none mb-1">
                    {currentBusiness ? currentBusiness.name : 'লোডিং...'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-none flex items-center gap-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {currentBranch ? currentBranch.name : 'শাখা নেই'}
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            </div>
            {/* Dropdown switch menu can be integrated here */}
          </div>
        ) : (
          <div className="flex items-center justify-center p-2 rounded-lg bg-slate-50 text-primary border border-slate-200/50 cursor-pointer">
            <Store className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Main navigation list */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-transform ${
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {sidebarOpen && (
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{item.banglaName}</span>
                  <span className="text-[10px] text-slate-400 font-normal leading-none">
                    {item.name}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Platform super-admin entry */}
      {role === 'SuperAdmin' && (
        <div className="px-3 pt-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100"
          >
            <ShieldAlert className="h-5 w-5 shrink-0" />
            {sidebarOpen && (
              <div className="flex flex-col text-left">
                <span className="font-semibold">সুপার এডমিন</span>
                <span className="text-[10px] font-normal leading-none text-indigo-400">
                  Platform Admin
                </span>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Sidebar Footer User Role Badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-primary">
              {role ? role[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 leading-none mb-1 truncate">
                {role === 'SuperAdmin' ? 'সুপার এডমিন' : role === 'Owner' ? 'মালিক' : role === 'Manager' ? 'ম্যানেজার' : 'ক্যাশিয়ার'}
              </p>
              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                Online
              </span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-primary mx-auto">
            {role ? role[0] : 'U'}
          </div>
        )}
      </div>
    </aside>
  );
}
