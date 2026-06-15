'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Laptop, 
  Wifi, 
  WifiOff, 
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useUiStore } from '@/stores/use-ui';
import { useOffline } from '@/hooks/use-offline';
import { usePermissions } from '@/hooks/use-permissions';
import { useLogoutMutation } from '@/features/authentication/api/auth-api';
import { useNotificationStore } from '@/stores/use-notifications';

// Breadcrumb path translation mapping
const PATH_TRANSLATIONS: Record<string, string> = {
  dashboard: 'ড্যাশবোর্ড',
  pos: 'বিক্রয় (POS)',
  inventory: 'ইনভেন্টরি',
  ledger: 'লেনদেন',
  customers: 'গ্রাহক',
  reports: 'রিপোর্ট সমূহ',
  settings: 'সেটিংস',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { theme, setTheme } = useUiStore();
  const isOffline = useOffline();
  const { user, role } = usePermissions();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const notifications = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        router.push('/login');
      },
    });
  };

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-focus search keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Split and generate dynamic breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      {/* Left side: toggle + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 md:hidden"
          aria-label="Toggle Sidebar Mobile"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer transition-colors">BizOS</span>
          {pathSegments.map((segment, index) => {
            const translated = PATH_TRANSLATIONS[segment] || segment;
            return (
              <React.Fragment key={segment}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span
                  className={
                    index === pathSegments.length - 1
                      ? 'text-slate-800 font-semibold'
                      : 'hover:text-slate-800 cursor-pointer transition-colors'
                  }
                >
                  {translated}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative max-w-md w-40 sm:w-60 md:w-80 lg:w-96 mx-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          id="global-search-input"
          type="text"
          placeholder="সার্চ করুন (Ctrl + K)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-12 text-sm bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
        />
        <kbd className="absolute inset-y-0 right-2 hidden sm:flex items-center text-[10px] font-mono text-slate-400 select-none pointer-events-none">
          CTRL K
        </kbd>
      </div>

      {/* Right side: status + notifications + profile */}
      <div className="flex items-center gap-3">
        {/* Network Connectivity Indicator */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isOffline
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-500" />
              <span className="hidden lg:inline">অফলাইন</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden lg:inline">অনলাইন</span>
            </>
          )}
        </div>

        {/* Notifications Panel Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Toggle Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Simple Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 slide-in-from-top-5">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-sm font-semibold text-slate-800">নোটিফিকেশন সমূহ</span>
                <button
                  type="button"
                  onClick={() => {
                    markAllRead();
                    clearAll();
                  }}
                  className="text-[10px] text-primary cursor-pointer hover:underline"
                >
                  সব ক্লিয়ার করুন
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto py-1 text-xs">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-slate-400">কোনো নোটিফিকেশন নেই</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 ${
                        notification.read ? 'opacity-70' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-800">{notification.title}</p>
                      <p className="text-slate-500">{notification.body}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notification.timestamp).toLocaleString('bn-BD')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
              {user ? user.name.split(' ')[0] : 'ইউজার'}
            </span>
          </button>

          {/* Simple Profile Menu Popover */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 slide-in-from-top-5">
              <div className="border-b border-slate-100 px-3 py-2.5 mb-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-primary">
                  <Shield className="h-3 w-3" />
                  <span>{role === 'Owner' ? 'মালিক একাউন্ট' : role === 'Manager' ? 'ম্যানেজার' : 'ক্যাশিয়ার'}</span>
                </div>
              </div>

              {/* Theme Selector Actions */}
              <div className="flex border-b border-slate-100 p-1 mb-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 ${theme === 'light' ? 'bg-primary/10 text-primary hover:bg-primary/10' : ''}`}
                  title="Light mode"
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 ${theme === 'dark' ? 'bg-primary/10 text-primary hover:bg-primary/10' : ''}`}
                  title="Dark mode"
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 ${theme === 'system' ? 'bg-primary/10 text-primary hover:bg-primary/10' : ''}`}
                  title="System default"
                >
                  <Laptop className="h-4 w-4" />
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'লগ আউট হচ্ছে...' : 'লগ আউট'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
