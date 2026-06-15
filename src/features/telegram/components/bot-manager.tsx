'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Settings, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Radio, 
  Play 
} from 'lucide-react';
import { TelegramBot } from '../types';
import { useConfigureBotMutation, useDisconnectAccountMutation, useSendTestMessageMutation } from '../api/telegram-api';

interface BotManagerProps {
  bot: TelegramBot;
}

export function BotManager({ bot }: BotManagerProps) {
  const configureMutation = useConfigureBotMutation();
  const disconnectMutation = useDisconnectAccountMutation();
  const testMutation = useSendTestMessageMutation();

  const [token, setToken] = useState(bot.token || '');
  const [botUsername, setBotUsername] = useState(bot.botUsername || '');
  const [botName, setBotName] = useState(bot.botName || '');
  
  // Settings switches
  const [sendDailyReport, setSendDailyReport] = useState(bot.settings.sendDailyReport);
  const [sendLowStockAlert, setSendLowStockAlert] = useState(bot.settings.sendLowStockAlert);
  const [sendDueNotification, setSendDueNotification] = useState(bot.settings.sendDueNotification);

  const [errorMsg, setErrorMsg] = useState('');
  const [testResult, setTestResult] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !botUsername.trim() || !botName.trim()) {
      setErrorMsg('সবগুলো ঘর পূরণ করুন');
      return;
    }
    setErrorMsg('');
    try {
      const cleanedUsername = botUsername.replace('@', '').replace(' ', '').trim();
      await configureMutation.mutateAsync({
        token: token.trim(),
        botUsername: cleanedUsername,
        botName: botName.trim(),
        settings: {
          sendDailyReport,
          sendLowStockAlert,
          sendDueNotification
        }
      });
    } catch (err) {
      setErrorMsg('বট কনফিগারেশন ব্যর্থ হয়েছে।');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync('bot');
      setToken('');
      setBotUsername('');
      setBotName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestPing = async () => {
    setTestResult('sending');
    try {
      await testMutation.mutateAsync();
      setTestResult('success');
      setTimeout(() => setTestResult('idle'), 4000);
    } catch (err) {
      setTestResult('failed');
      setTimeout(() => setTestResult('idle'), 4000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 text-left">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Bot className="h-4.5 w-4.5 text-indigo-600" /> ২. শপ অ্যাসিস্ট্যান্ট বট ম্যানেজমেন্ট (Bot Manager)
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">দোকানের নিজস্ব টেলিগ্রাম বট গেটওয়ে টোকেন কনফিগার করুন</p>
        </div>

        {bot.connected && (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" /> সেশন চালু (Live)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Setup Bot Form */}
        <div className="lg:col-span-7 space-y-4">
          {bot.connected ? (
            /* Connected Bot Display */
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="text-slate-800 font-bold text-[13px]">{bot.botName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">@{bot.botUsername}</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">বট এপিআই টোকেন (Masked Token)</span>
                  <span className="text-slate-800 font-mono select-all truncate block bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                    {bot.token?.substring(0, 10)}...********************
                  </span>
                </div>
              </div>

              {/* Bot Automation Toggles */}
              <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Settings className="h-4 w-4 text-slate-500" /> অটোমেশন নোটিফিকেশন সেটিংস (Alerts):
                </h4>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">দৈনিক ক্যাশ ও সেলস রিপোর্ট পাঠান</span>
                    <input 
                      type="checkbox" 
                      checked={sendDailyReport} 
                      onChange={(e) => {
                        setSendDailyReport(e.target.checked);
                        configureMutation.mutate({
                          token: bot.token!,
                          botUsername: bot.botUsername!,
                          botName: bot.botName!,
                          settings: {
                            sendDailyReport: e.target.checked,
                            sendLowStockAlert,
                            sendDueNotification
                          }
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">কম স্টকের প্রোডাক্ট এলার্ট দিন</span>
                    <input 
                      type="checkbox" 
                      checked={sendLowStockAlert} 
                      onChange={(e) => {
                        setSendLowStockAlert(e.target.checked);
                        configureMutation.mutate({
                          token: bot.token!,
                          botUsername: bot.botUsername!,
                          botName: bot.botName!,
                          settings: {
                            sendDailyReport,
                            sendLowStockAlert: e.target.checked,
                            sendDueNotification
                          }
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-slate-600 font-semibold">বকেয়া রেকর্ডের পর মেসেজ দিন</span>
                    <input 
                      type="checkbox" 
                      checked={sendDueNotification} 
                      onChange={(e) => {
                        setSendDueNotification(e.target.checked);
                        configureMutation.mutate({
                          token: bot.token!,
                          botUsername: bot.botUsername!,
                          botName: bot.botName!,
                          settings: {
                            sendDailyReport,
                            sendLowStockAlert,
                            sendDueNotification: e.target.checked
                          }
                        });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>
                </div>
              </div>

              {/* Bot Test Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleTestPing}
                  disabled={testResult === 'sending'}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" /> টেস্ট মেসেজ পাঠান (Test Ping)
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  বট অপসারণ করুন (Remove)
                </button>
              </div>

              {/* Ping status chimes */}
              {testResult === 'sending' && <p className="text-[10px] text-slate-400 animate-pulse font-semibold">বট হতে একটি টেস্ট পিং বার্তা পাঠানো হচ্ছে...</p>}
              {testResult === 'success' && <p className="text-[10px] text-emerald-600 font-bold">✅ আপনার যুক্ত করা আইডিতে টেস্ট মেসেজ পাঠানো হয়েছে! টেলিগ্রাম চেক করুন।</p>}
              {testResult === 'failed' && <p className="text-[10px] text-rose-600 font-bold">❌ মেসেজ পাঠানো যায়নি। বট টোকেনটি বা আপনার অ্যাকাউন্ট লিংক চেক করুন।</p>}
            </div>
          ) : (
            /* Configure Form */
            <form onSubmit={handleConfigure} className="space-y-3">
              {errorMsg && (
                <div className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2 rounded-lg">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">বটের নাম (Bot Name)</label>
                <input
                  type="text"
                  placeholder="যেমন: BizOS POS Manager"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">বটের ইউজারনেম (Bot Username)</label>
                <input
                  type="text"
                  placeholder="যেমন: MyShopAssist_bot"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">বট এপিআই টোকেন (HTTP API Token)</label>
                <input
                  type="password"
                  placeholder="যেমন: 1234567890:ABCdef..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={configureMutation.isPending}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {configureMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> বট সেভ ও চালু করুন (Save & Run)
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Col: BotFather Guide guidelines */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0" /> কিভাবে নিজের বট তৈরি করবেন?
          </h4>

          <ol className="list-decimal list-inside space-y-2 leading-relaxed pl-1 text-[11px] font-semibold text-slate-600">
            <li>
              প্রথমে আপনার টেলিগ্রাম অ্যাপ খুলে সার্চবারে <span className="font-mono text-indigo-600 select-all font-bold">@BotFather</span> লিখে সার্চ করুন এবং মেসেজ চ্যাট স্টার্ট করুন।
            </li>
            <li>
              বটফাদারকে <span className="font-mono text-slate-700 bg-slate-200 px-1 rounded select-all font-bold">/newbot</span> কম্যান্ড পাঠান।
            </li>
            <li>
              নির্দেশনা অনুযায়ী আপনার বটের জন্য একটি নাম ও শেষে "bot" যুক্ত একটি ইউনিক ইউজারনেম দিন (যেমন: `XYZShop_bot`)।
            </li>
            <li>
              সফলভাবে তৈরির পর বটফাদার আপনাকে একটি দীর্ঘ <span className="font-bold text-indigo-600">HTTP API token</span> কোড প্রদান করবে।
            </li>
            <li>
              টোকেন কোডটি কপি করে বাম পাশের ফর্মে বসিয়ে দিন।
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
