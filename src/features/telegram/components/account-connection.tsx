'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, Link as LinkIcon, RefreshCw, XCircle } from 'lucide-react';
import { TelegramAccount } from '../types';
import { useConnectAccountMutation, useDisconnectAccountMutation } from '../api/telegram-api';

interface AccountConnectionProps {
  account: TelegramAccount;
}

export function AccountConnection({ account }: AccountConnectionProps) {
  const connectMutation = useConnectAccountMutation();
  const disconnectMutation = useDisconnectAccountMutation();
  
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !firstName.trim()) {
      setErrorMsg('সবগুলো ঘর পূরণ করুন');
      return;
    }
    setErrorMsg('');
    try {
      // Remove '@' if user entered it
      const cleanedUser = username.replace('@', '').trim();
      await connectMutation.mutateAsync({
        username: cleanedUser,
        firstName: firstName.trim()
      });
    } catch (err) {
      setErrorMsg('কানেক্ট করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync('account');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Send className="h-4.5 w-4.5 text-indigo-600" /> ১. টেলিগ্রাম অ্যাকাউন্ট সংযোগ (Connect Telegram Account)
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">মার্চেন্ট বা প্রোপরাইটার হিসেবে নিজের টেলিগ্রাম আইডি লিঙ্ক করুন</p>
      </div>

      {account.connected ? (
        /* Connected State */
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-9 w-9 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">টেলিগ্রাম অ্যাকাউন্ট সংযুক্ত রয়েছে</h4>
              <p className="text-[10px] text-emerald-600 font-semibold">আপনার শপের অ্যাডমিন পিন ভেরিফিকেশন সম্পন্ন হয়েছে।</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">ইউজারনেম (Username)</span>
              <span className="text-slate-800 font-mono">@{account.username}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">ইউজার আইডি (User ID)</span>
              <span className="text-slate-800 font-mono">{account.userId}</span>
            </div>
            <div className="space-y-1 col-span-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">প্রথম নাম (First Name)</span>
              <span className="text-slate-800">{account.firstName}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> সংযোগ বিচ্ছিন্ন করুন (Disconnect)
            </button>
          </div>
        </div>
      ) : (
        /* Disconnected State */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> অ্যাকাউন্ট কানেক্ট করা নেই
            </h4>
            <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
              টেলিগ্রাম বট ও ইনস্ট্যান্ট রিপোর্ট অ্যাক্সেস করার পূর্বে আপনার অ্যাকাউন্টটি কানেক্ট করে নিন। প্রথমে টেলিগ্রামে যান এবং আমাদের মূল বট আইডি সার্চ করুন।
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-3">
            {errorMsg && (
              <div className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 p-2 rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">টেলিগ্রাম ইউজারনেম</label>
                <input
                  type="text"
                  placeholder="যেমন: abid_shanto"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">ফার্স্ট নেম (টেলিগ্রাম)</label>
                <input
                  type="text"
                  placeholder="যেমন: Shanto"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={connectMutation.isPending}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {connectMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> কানেক্ট হচ্ছে...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" /> অ্যাকাউন্ট কানেক্ট করুন (Connect Profile)
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
