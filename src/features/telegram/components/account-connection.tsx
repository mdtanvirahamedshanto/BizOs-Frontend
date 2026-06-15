'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Link as LinkIcon,
  RefreshCw,
  XCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { TelegramAccount } from '../types';
import {
  useDisconnectAccountMutation,
  useTelegramLinkTokenMutation,
  useTelegramLinkStatusQuery,
} from '../api/telegram-api';

interface AccountConnectionProps {
  account: TelegramAccount;
}

export function AccountConnection({ account }: AccountConnectionProps) {
  const linkMutation = useTelegramLinkTokenMutation();
  const disconnectMutation = useDisconnectAccountMutation();
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [polling, setPolling] = useState(false);

  useTelegramLinkStatusQuery(polling && !account.connected);

  const handleGenerateLink = async () => {
    setErrorMsg('');
    try {
      const token = await linkMutation.mutateAsync();
      setDeepLink(token.deepLink);
      setExpiresIn(token.expiresIn);
      setPolling(true);
    } catch {
      setErrorMsg('লিংক টোকেন তৈরি করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleCopy = async () => {
    if (!deepLink) return;
    await navigator.clipboard.writeText(deepLink);
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      setDeepLink(null);
      setPolling(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Send className="h-4.5 w-4.5 text-indigo-600" /> ১. টেলিগ্রাম অ্যাকাউন্ট সংযোগ
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          BizOS অ্যাপ থেকে লিংক টোকেন জেনারেট করে টেলিগ্রাম বটে /start পাঠান
        </p>
      </div>

      {account.connected ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-9 w-9 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">টেলিগ্রাম অ্যাকাউন্ট সংযুক্ত</h4>
              <p className="text-[10px] text-emerald-600 font-semibold">
                আপনি এখন বটের মাধ্যমে এন্ট্রি ও রিপোর্ট পেতে পারবেন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">ইউজারনেম</span>
              <span className="text-slate-800 font-mono">
                {account.username ? `@${account.username}` : '—'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">চ্যাট আইডি</span>
              <span className="text-slate-800 font-mono">{account.userId ?? '—'}</span>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" /> সংযোগ বিচ্ছিন্ন করুন
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> অ্যাকাউন্ট কানেক্ট করা নেই
            </h4>
            <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
              নিচের বাটনে ক্লিক করে লিংক টোকেন তৈরি করুন, তারপর টেলিগ্রামে বট খুলে Start করুন।
            </p>
          </div>

          {errorMsg && (
            <div className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2 rounded-lg">
              ⚠️ {errorMsg}
            </div>
          )}

          {deepLink ? (
            <div className="space-y-3 p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl">
              <p className="text-[10px] font-bold text-indigo-800 uppercase">আপনার লিংক (১৫ মিনিটের মধ্যে ব্যবহার করুন)</p>
              <code className="block text-[10px] break-all bg-white border border-indigo-100 rounded-lg p-2 font-mono text-slate-700">
                {deepLink}
              </code>
              {expiresIn && (
                <p className="text-[10px] text-slate-500">মেয়াদ: {Math.floor(expiresIn / 60)} মিনিট</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Copy className="h-4 w-4" /> কপি করুন
                </button>
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" /> টেলিগ্রাম খুলুন
                </a>
              </div>
              <p className="text-[10px] text-slate-500 animate-pulse">লিংক সম্পন্ন হলে এই পেইজ স্বয়ংক্রিয় আপডেট হবে...</p>
            </div>
          ) : (
            <button
              onClick={handleGenerateLink}
              disabled={linkMutation.isPending}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {linkMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> টোকেন তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" /> লিংক টোকেন জেনারেট করুন
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
