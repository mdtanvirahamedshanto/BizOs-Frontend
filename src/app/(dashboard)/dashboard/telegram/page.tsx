'use client';

import React, { useState } from 'react';
import { Send, Bot, Terminal, BookOpen, BarChart3, HelpCircle, Loader2 } from 'lucide-react';
import { useTelegramStatusQuery } from '@/features/telegram/api/telegram-api';
import { AccountConnection } from '@/features/telegram/components/account-connection';
import { BotManager } from '@/features/telegram/components/bot-manager';
import { CommandMonitor } from '@/features/telegram/components/command-monitor';
import { ActivityLogs } from '@/features/telegram/components/activity-logs';
import { TelegramReports } from '@/features/telegram/components/telegram-reports';

type TabView = 'connect' | 'commands' | 'logs' | 'reports';

export default function TelegramPage() {
  const { data: status, isLoading } = useTelegramStatusQuery();
  const [activeTab, setActiveTab] = useState<TabView>('connect');

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">টেলিগ্রাম সেটিংস লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="h-6.5 w-6.5 text-indigo-600 fill-indigo-50" /> টেলিগ্রাম ইন্টিগ্রেশন (Telegram Assistants)
          </h2>
          <p className="text-xs text-slate-500 mt-1">দোকানের বেচাকেনা, বকেয়া খাতা ও স্টক রিপোর্ট স্বয়ংক্রিয়ভাবে টেলিগ্রাম বটের মাধ্যমে ট্র্যাক করুন</p>
        </div>
      </div>

      {/* Tabs Sub-navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        {[
          { id: 'connect', label: 'সংযোগ সেটিংস', name: 'Connection Config', icon: Bot },
          { id: 'commands', label: 'কম্যান্ড টেমপ্লেট', name: 'Command Settings', icon: Terminal },
          { id: 'logs', label: 'অ্যাক্টিভিটি লগ', name: 'Traffic History', icon: BookOpen },
          { id: 'reports', label: 'বট অ্যানালিটিক্স', name: 'Bot Analytics', icon: BarChart3 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs shrink-0 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div className="flex flex-col text-left leading-none">
                <span>{tab.label}</span>
                <span className="text-[8px] text-slate-400 font-normal leading-none mt-0.5">{tab.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'connect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <AccountConnection account={status?.account || { connected: false }} />
            </div>
            <div className="lg:col-span-7">
              <BotManager bot={status?.bot || { connected: false, settings: { sendDailyReport: false, sendLowStockAlert: false, sendDueNotification: false } }} />
            </div>
          </div>
        )}

        {activeTab === 'commands' && <CommandMonitor />}

        {activeTab === 'logs' && <ActivityLogs />}

        {activeTab === 'reports' && <TelegramReports />}
      </div>
    </div>
  );
}
