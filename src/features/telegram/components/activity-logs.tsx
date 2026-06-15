'use client';

import React, { useState } from 'react';
import { BookOpen, Search, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTelegramLogsQuery } from '../api/telegram-api';

export function ActivityLogs() {
  const { data: logs, isLoading, refetch } = useTelegramLogsQuery();
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  const filteredLogs = logs?.filter((log) => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  }) || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-left">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <BookOpen className="h-4.5 w-4.5 text-indigo-600" /> ৪. বট ট্রাফিক ও অ্যাক্টিভিটি লগ (Bot Traffic & Audit Logs)
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">বটের কাছে আসা ইনকামিং মেসেজ এবং স্বয়ংক্রিয় উত্তরের লগ রেকর্ড</p>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          
          {(['all', 'success', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                filterStatus === status
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'সব' : status === 'success' ? 'সফল' : 'ব্যর্থ'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <p className="text-center py-8 text-xs text-slate-400 font-semibold">কোনো লগ পাওয়া যায়নি।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
              <tr>
                <th className="p-3">ইউজার আইডি (User Telegram)</th>
                <th className="p-3">অনুরোধ কম্যান্ড (Incoming)</th>
                <th className="p-3">বট ফিডব্যাক (Outgoing Feedback)</th>
                <th className="p-3">স্ট্যাটাস (Status)</th>
                <th className="p-3 text-right">তারিখ ও সময় (Timestamp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-mono text-slate-600">
                    <div>{log.userTelegram}</div>
                    <div className="text-[9px] text-slate-400 font-sans">ChatID: {log.chatId}</div>
                  </td>
                  <td className="p-3 font-mono text-indigo-600 font-bold">{log.incomingText}</td>
                  <td className="p-3 max-w-xs truncate" title={log.outgoingText}>
                    {log.outgoingText}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-emerald-500" /> সফল
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-rose-500" /> ব্যর্থ
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-400 font-sans">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
