'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Filter, 
  User, 
  ShieldAlert 
} from 'lucide-react';
import { useAdminTicketsQuery, useResolveTicketMutation } from '../api/admin-api';
import { SupportTicket } from '../types';

export function TicketManager() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const { data: tickets, isLoading } = useAdminTicketsQuery(statusFilter);
  const resolveMutation = useResolveTicketMutation();

  const selectedTicket = tickets?.find((t) => t.id === selectedTicketId);

  const handleSendReply = async (nextStatus?: SupportTicket['status']) => {
    if (!selectedTicketId || (!replyText.trim() && !nextStatus)) return;

    try {
      await resolveMutation.mutateAsync({
        ticketId: selectedTicketId,
        replyMessage: replyText.trim(),
        nextStatus: nextStatus || selectedTicket?.status
      });
      setReplyText('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const getPriorityLabel = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high': return 'উচ্চ (High)';
      case 'medium': return 'মাঝারি (Medium)';
      case 'low': return 'নিম্ন (Low)';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">হেল্পডেস্ক সাপোর্ট টিকিট (Help Desk Tickets)</h2>
        <p className="text-xs text-slate-500 mt-1">মার্চেন্টদের উত্থাপিত সমস্যার তদারকি, চ্যাট সাপোর্ট ও তাৎক্ষণিক সমাধান প্রদানকারী কন্ট্রোল ডেস্ক</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Side: Ticket Queue List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Filter className="h-4 w-4 text-slate-400" /> ফিল্টার (Filters)
            </span>
            <div className="flex gap-1">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setSelectedTicketId(null);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? 'সব' : status === 'open' ? 'নতুন' : status === 'in_progress' ? 'চলমান' : 'সমাধান'}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">কোনো টিকিট পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[420px] flex-1 pr-1">
              {tickets.map((t) => {
                const isActive = t.id === selectedTicketId;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-left space-y-2 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-[13px] line-clamp-1">{t.subject}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold shrink-0 ${
                        t.priority === 'high' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : t.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {getPriorityLabel(t.priority)}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1">{t.issueDescription}</p>

                    <div className="flex justify-between items-center text-[9px] text-slate-400">
                      <span className="font-bold text-slate-600">{t.tenantName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        t.status === 'open' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : t.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {t.status === 'open' ? 'নতুন টিকিট' : t.status === 'in_progress' ? 'চলমান' : 'সমাধানকৃত'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Chat Details Pane */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between flex-1">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{selectedTicket.id}</span>
                    <h3 className="font-bold text-slate-800 text-sm">{selectedTicket.subject}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">মার্চেন্ট: <span className="text-slate-700">{selectedTicket.tenantName}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleSendReply(e.target.value as SupportTicket['status'])}
                      className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-bold focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="open">নতুন টিকিট (Open)</option>
                      <option value="in_progress">চলমান (In Progress)</option>
                      <option value="resolved">সমাধানকৃত (Resolved)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/40 text-xs text-slate-600 font-medium">
                  {selectedTicket.issueDescription}
                </div>
              </div>

              {/* Chat Thread Area */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[300px]">
                {selectedTicket.replies.map((reply, index) => {
                  const isAdmin = reply.sender === 'admin';
                  return (
                    <div key={index} className={`flex gap-2.5 max-w-[85%] ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isAdmin ? <ShieldAlert className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs font-semibold ${
                          isAdmin 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                        }`}>
                          {reply.message}
                        </div>
                        <p className={`text-[8px] text-slate-400 font-bold ${isAdmin ? 'text-right' : 'text-left'}`}>
                          {reply.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Actions Input Panel */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex gap-2">
                  <textarea
                    placeholder="মার্চেন্টের সমস্যাটির সমাধান বা জবাব এখানে লিখুন..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> শেষ আপডেট: {selectedTicket.timestamp}
                  </span>

                  <div className="flex gap-1.5">
                    {selectedTicket.status !== 'resolved' && (
                      <button
                        onClick={() => handleSendReply('resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> সমাধান চিহ্নিত করুন
                      </button>
                    )}
                    <button
                      onClick={() => handleSendReply()}
                      disabled={!replyText.trim() || resolveMutation.isPending}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" /> উত্তর পাঠান
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
              <MessageSquare className="h-12 w-12 text-slate-200" />
              <h4 className="text-sm font-bold text-slate-700">কোনো চ্যাট সেশন সিলেক্ট করা নেই</h4>
              <p className="text-[11px] text-slate-400 max-w-xs">বাম পাশের লিস্ট থেকে একটি মার্চেন্ট সাপোর্ট টিকিট নির্বাচন করে চ্যাট হিস্ট্রি দেখুন এবং রিপ্লাই প্রদান করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
