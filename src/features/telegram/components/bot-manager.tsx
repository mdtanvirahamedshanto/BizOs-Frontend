'use client';

import React, { useState } from 'react';
import {
  Bot,
  Settings,
  HelpCircle,
  Radio,
  Play,
  RefreshCw,
} from 'lucide-react';
import { TelegramBot } from '../types';
import { useConfigureBotMutation, useSendTestMessageMutation } from '../api/telegram-api';

interface BotManagerProps {
  bot: TelegramBot;
}

export function BotManager({ bot }: BotManagerProps) {
  const configureMutation = useConfigureBotMutation();
  const testMutation = useSendTestMessageMutation();

  const [sendDailyReport, setSendDailyReport] = useState(bot.settings.sendDailyReport);
  const [sendLowStockAlert, setSendLowStockAlert] = useState(bot.settings.sendLowStockAlert);
  const [sendDueNotification, setSendDueNotification] = useState(bot.settings.sendDueNotification);
  const [testResult, setTestResult] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');

  const updateSettings = (settings: TelegramBot['settings']) => {
    configureMutation.mutate(settings);
  };

  const handleTestPing = async () => {
    setTestResult('sending');
    try {
      await testMutation.mutateAsync();
      setTestResult('success');
      setTimeout(() => setTestResult('idle'), 4000);
    } catch {
      setTestResult('failed');
      setTimeout(() => setTestResult('idle'), 4000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Bot className="h-4.5 w-4.5 text-indigo-600" /> ২. BizOS টেলিগ্রাম বট
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            প্ল্যাটফর্ম বট — নোটিফিকেশন প্রেফারেন্স কনফিগার করুন
          </p>
        </div>

        {bot.connected && (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" /> সক্রিয়
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-4">
          {bot.connected ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-slate-800 font-bold text-[13px]">{bot.botName ?? 'BizOS Assistant'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    @{bot.botUsername ?? 'bizos_bot'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  বট টোকেন সার্ভার-সাইডে ম্যানেজ করা হয়। শুধুমাত্র নোটিফিকেশন সেটিংস এখানে পরিবর্তন করুন।
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Settings className="h-4 w-4 text-slate-500" /> নোটিফিকেশন সেটিংস
                </h4>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">দৈনিক ক্যাশ ও সেলস রিপোর্ট</span>
                    <input
                      type="checkbox"
                      checked={sendDailyReport}
                      onChange={(e) => {
                        const value = e.target.checked;
                        setSendDailyReport(value);
                        updateSettings({
                          sendDailyReport: value,
                          sendLowStockAlert,
                          sendDueNotification,
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">কম স্টক অ্যালার্ট</span>
                    <input
                      type="checkbox"
                      checked={sendLowStockAlert}
                      onChange={(e) => {
                        const value = e.target.checked;
                        setSendLowStockAlert(value);
                        updateSettings({
                          sendDailyReport,
                          sendLowStockAlert: value,
                          sendDueNotification,
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">বকেয়া নোটিফিকেশন</span>
                    <input
                      type="checkbox"
                      checked={sendDueNotification}
                      onChange={(e) => {
                        const value = e.target.checked;
                        setSendDueNotification(value);
                        updateSettings({
                          sendDailyReport,
                          sendLowStockAlert,
                          sendDueNotification: value,
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleTestPing}
                disabled={testResult === 'sending' || testMutation.isPending}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> টেস্ট মেসেজ পাঠান
              </button>

              {testResult === 'sending' && (
                <p className="text-[10px] text-slate-400 animate-pulse font-semibold">টেস্ট মেসেজ পাঠানো হচ্ছে...</p>
              )}
              {testResult === 'success' && (
                <p className="text-[10px] text-emerald-600 font-bold">✅ টেস্ট মেসেজ পাঠানো হয়েছে। টেলিগ্রাম চেক করুন।</p>
              )}
              {testResult === 'failed' && (
                <p className="text-[10px] text-rose-600 font-bold">❌ মেসেজ পাঠানো যায়নি। অ্যাকাউন্ট লিংক ও বট কনফিগ চেক করুন।</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 font-semibold">
              সার্ভারে টেলিগ্রাম বট কনফিগার করা নেই। অ্যাডমিনকে `TELEGRAM_BOT_TOKEN` সেট করতে বলুন।
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0" /> কিভাবে ব্যবহার করবেন?
          </h4>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed pl-1 text-[11px] font-semibold text-slate-600">
            <li>বাম পাশ থেকে লিংক টোকেন জেনারেট করুন।</li>
            <li>টেলিগ্রামে BizOS বট খুলে Start করুন।</li>
            <li>বাংলায় এন্ট্রি পাঠান — যেমন: <span className="font-mono">বিক্রি 1200</span></li>
            <li>/help কম্যান্ড দিয়ে সব উদাহরণ দেখুন।</li>
          </ol>
          {configureMutation.isPending && (
            <p className="text-[10px] text-indigo-600 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> সেটিংস সেভ হচ্ছে...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
