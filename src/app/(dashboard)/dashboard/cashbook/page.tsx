'use client';

import React, { useState } from 'react';
import {
  useCashbookBalanceQuery,
  useCashbookEntriesQuery,
  useClosingPreviewQuery,
  useDailyClosingsQuery,
  useRecordCashInMutation,
  useRecordCashOutMutation,
  useRecordDailyClosingMutation,
} from '@/hooks/queries/use-cashbook-query';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { centsToTaka, takaToCents } from '@/lib/crm/money';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import { PermissionGuard } from '@/components/auth/auth-provider';
import {
  Wallet,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  Loader2,
  AlertCircle,
  HelpCircle,
  FileText,
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react';

export default function CashbookPage() {
  const [activeTab, setActiveTab] = useState<'entries' | 'closings'>('entries');
  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);

  // Pagination & Queries
  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();
  const { data: balance, isLoading: isBalanceLoading } = useCashbookBalanceQuery();
  const { data: entriesEnvelope, isLoading: isEntriesLoading, refetch: refetchEntries } =
    useCashbookEntriesQuery({ cursor, limit: 15 });
  const { data: closings, isLoading: isClosingsLoading, refetch: refetchClosings } =
    useDailyClosingsQuery();

  // Mutations
  const recordCashIn = useRecordCashInMutation();
  const recordCashOut = useRecordCashOutMutation();
  const recordClosing = useRecordDailyClosingMutation();

  // State for forms
  const [inAmount, setInAmount] = useState('');
  const [inDesc, setInDesc] = useState('');
  const [inRef, setInRef] = useState('');

  const [outAmount, setOutAmount] = useState('');
  const [outDesc, setOutDesc] = useState('');
  const [outRef, setOutRef] = useState('');

  const [actualBalance, setActualBalance] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  // Closing Preview query is triggered only when closing modal is open to keep it fresh
  const { data: closingPreview, isLoading: isPreviewLoading } = useClosingPreviewQuery();

  const handleCashIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(inAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }
    if (!inDesc.trim()) {
      alert('বিবরণ লিখুন।');
      return;
    }

    try {
      await recordCashIn.mutateAsync({
        amountCents: takaToCents(amountVal),
        description: inDesc,
        reference: inRef || undefined,
      });
      setShowInModal(false);
      setInAmount('');
      setInDesc('');
      setInRef('');
      refetchEntries();
    } catch (err: any) {
      alert(err.message || 'ক্যাশ-ইন রেকর্ড করতে সমস্যা হয়েছে।');
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(outAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }
    if (!outDesc.trim()) {
      alert('বিবরণ লিখুন।');
      return;
    }

    try {
      await recordCashOut.mutateAsync({
        amountCents: takaToCents(amountVal),
        description: outDesc,
        reference: outRef || undefined,
      });
      setShowOutModal(false);
      setOutAmount('');
      setOutDesc('');
      setOutRef('');
      refetchEntries();
    } catch (err: any) {
      alert(err.message || 'ক্যাশ-আউট রেকর্ড করতে সমস্যা হয়েছে।');
    }
  };

  const handleClosingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actualVal = parseFloat(actualBalance);
    if (isNaN(actualVal) || actualVal < 0) {
      alert('সঠিক প্রকৃত ক্যাশ পরিমাণ লিখুন।');
      return;
    }

    try {
      await recordClosing.mutateAsync({
        actualBalanceCents: takaToCents(actualVal),
        notes: closingNotes || undefined,
      });
      setShowClosingModal(false);
      setActualBalance('');
      setClosingNotes('');
      refetchEntries();
      refetchClosings();
    } catch (err: any) {
      alert(err.message || 'দিনের হিসাব বন্ধ করতে সমস্যা হয়েছে।');
    }
  };

  const expectedClosingCents = closingPreview?.expectedClosingBalanceCents ?? 0;
  const actualCents = actualBalance ? takaToCents(parseFloat(actualBalance) || 0) : expectedClosingCents;
  const discrepancyCents = actualCents - expectedClosingCents;

  return (
    <PermissionGuard permission="cashbook:read">
      <div className="space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              ক্যাশবুক ও ক্যাশ ড্রয়ার হিসাব
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-none font-sans">
              দোকানের নগদ ক্যাশ ব্যালেন্স ট্র্যাক, ম্যানুয়াল ক্যাশ এন্ট্রি ও দিনের হিসাব সমাপ্ত করুন
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'entries'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              লেনদেন রেজিস্টার (Register)
            </button>
            <button
              onClick={() => setActiveTab('closings')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'closings'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              দিনের সমাপ্তি রিপোর্ট (Closings)
            </button>
          </div>
        </div>

        {/* Dashboard Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Real-time cash balance card */}
          <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700/30 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400">ক্যাশ ড্রয়ারে বর্তমান ব্যালেন্স</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Real-time Cash-in-Hand Balance</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600/40">
                <Wallet className="h-5 w-5 text-indigo-400" />
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-3xl font-black tracking-tight font-sans">
                {isBalanceLoading ? (
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin inline-block" />
                ) : (
                  formatTaka(centsToTaka(balance?.currentBalanceCents ?? 0))
                )}
              </h2>
              <p className="text-[9px] text-slate-400 mt-1.5 font-medium font-sans">
                সর্বশেষ আপডেট: {balance?.lastUpdatedAt ? new Date(balance.lastUpdatedAt).toLocaleTimeString('bn-BD') : 'এখনই'}
              </p>
            </div>
          </div>

          {/* Action buttons panel */}
          <div className="md:col-span-6 lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-center gap-4">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">কুইক অ্যাকশন মেনু (Drawer Operations)</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShowInModal(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-150 hover:bg-slate-50/50 transition-all text-center gap-1.5 group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 border border-emerald-100 text-emerald-600 flex items-center justify-center transition-colors">
                  <Plus className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">নগদ জমা (Cash In)</span>
              </button>

              <button
                onClick={() => setShowOutModal(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-150 hover:bg-slate-50/50 transition-all text-center gap-1.5 group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-rose-50 group-hover:bg-rose-100 border border-rose-100 text-rose-600 flex items-center justify-center transition-colors">
                  <Minus className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">নগদ খরচ (Cash Out)</span>
              </button>

              <button
                onClick={() => setShowClosingModal(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-150 hover:bg-slate-50/50 transition-all text-center gap-1.5 group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-100 text-primary flex items-center justify-center transition-colors">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">দিনের সমাপ্তি (Closing)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab content areas */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          {activeTab === 'entries' ? (
            <>
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>লেনদেন ইতিহাস লেজার (Cashbook Registry Ledger)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">প্রতিটি নগদ আদান-প্রদান এবং বিক্রয়ের বিবরণ খতিয়ান</p>
                </div>
              </div>

              {isEntriesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-xs">লেনদেন লোড হচ্ছে...</p>
                </div>
              ) : !entriesEnvelope?.data?.length ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2">
                  {entriesEnvelope.data.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide border uppercase ${
                              item.type === 'IN'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                          >
                            {item.type === 'IN' ? 'জমা (+ IN)' : 'খরচ (- OUT)'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.source}
                          </span>
                          {item.reference && (
                            <span className="text-[9px] text-slate-400 font-mono bg-slate-50 px-1 rounded border">
                              Ref: {item.reference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate">{item.description}</p>
                        <p className="text-[9px] text-slate-400 font-medium font-sans">
                          {new Date(item.entryDate).toLocaleDateString('bn-BD')} · {new Date(item.createdAt).toLocaleTimeString('bn-BD')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-sans font-black text-sm block ${
                            item.type === 'IN' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {item.type === 'IN' ? '+' : '-'} {formatTaka(centsToTaka(item.amountCents))}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold font-sans block">
                          ব্যালেন্স: {formatTaka(centsToTaka(item.balanceAfterCents))}
                        </span>
                      </div>
                    </div>
                  ))}

                  <CursorPagination
                    meta={entriesEnvelope.meta}
                    hasPrev={hasPrev}
                    onPrev={prev}
                    onNext={() => next(entriesEnvelope.meta?.nextCursor)}
                    currentCount={entriesEnvelope.data.length}
                    itemLabel="লেনদেন"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="pb-2 border-b border-slate-150">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>দিনের সমাপ্তি রেকর্ড সমূহ (Daily Close Records)</span>
                </h3>
                <p className="text-[10px] text-slate-400">প্রতিদিনের শেষে ক্যাশ গণনা ও অমিল হিসাবসমূহের খতিয়ান</p>
              </div>

              {isClosingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-xs">রেকর্ডসমূহ লোড হচ্ছে...</p>
                </div>
              ) : !closings?.length ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  কোনো সমাপ্তি রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {closings.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-150 bg-slate-50/20 space-y-2 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            তারিখ: {new Date(c.date).toLocaleDateString('bn-BD')}
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold font-sans">
                            রেকর্ড তৈরি: {new Date(c.createdAt).toLocaleTimeString('bn-BD')}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            c.discrepancyCents === 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.discrepancyCents < 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.discrepancyCents === 0
                            ? 'মিল রয়েছে (Perfect Match)'
                            : c.discrepancyCents < 0
                            ? `ঘাটতি: ${formatTaka(centsToTaka(Math.abs(c.discrepancyCents)))}`
                            : `উদ্বৃত্ত: ${formatTaka(centsToTaka(c.discrepancyCents))}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-100 font-sans text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">প্রারম্ভিক ক্যাশ</span>
                          <span className="font-extrabold text-slate-700">{formatTaka(centsToTaka(c.openingBalanceCents))}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">মোট ক্যাশ-ইন (+)</span>
                          <span className="font-extrabold text-emerald-600">{formatTaka(centsToTaka(c.totalCashInCents))}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">মোট ক্যাশ-আউট (-)</span>
                          <span className="font-extrabold text-rose-600">{formatTaka(centsToTaka(c.totalCashOutCents))}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">হিসাবকৃত ক্যাশ</span>
                          <span className="font-extrabold text-slate-800">{formatTaka(centsToTaka(c.actualBalanceCents))}</span>
                        </div>
                      </div>

                      {c.notes && (
                        <p className="text-[10px] text-slate-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-700">নোট:</span> {c.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Modals */}
        {/* ========================================================================= */}

        {/* CASH IN MODAL */}
        {showInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  <span>ক্যাশ-ইন এন্ট্রি করুন (Cash In)</span>
                </h3>
                <button
                  onClick={() => setShowInModal(false)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCashIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">জমার পরিমাণ (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={inAmount}
                    onChange={(e) => setInAmount(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-sans font-extrabold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">জমার কারণ / বিবরণ</label>
                  <input
                    type="text"
                    placeholder="যেমন: মালিকের বিনিয়োগ, ঋণ গ্রহণ ইত্যাদি..."
                    value={inDesc}
                    onChange={(e) => setInDesc(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">রেফারেন্স / ভাউচার নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: Rec-0012, TXN103..."
                    value={inRef}
                    onChange={(e) => setInRef(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recordCashIn.isPending}
                  className="h-10 w-full bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {recordCashIn.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>ক্যাশ-ইন সেভ করুন</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CASH OUT MODAL */}
        {showOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <ArrowDownLeft className="h-5 w-5 text-rose-500" />
                  <span>ক্যাশ-আউট এন্ট্রি করুন (Cash Out)</span>
                </h3>
                <button
                  onClick={() => setShowOutModal(false)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCashOut} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">খরচের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={outAmount}
                    onChange={(e) => setOutAmount(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-sans font-extrabold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">খরচের কারণ / বিবরণ</label>
                  <input
                    type="text"
                    placeholder="যেমন: মেহমান আপ্যায়ন, ঘরভাড়া, বিবিধ খরচ..."
                    value={outDesc}
                    onChange={(e) => setOutDesc(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">রেফারেন্স / ভাউচার নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: Exp-0402, Slip-22..."
                    value={outRef}
                    onChange={(e) => setOutRef(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recordCashOut.isPending}
                  className="h-10 w-full bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {recordCashOut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>ক্যাশ-আউট সেভ করুন</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* END OF DAY CLOSING WIZARD */}
        {showClosingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>দিনের সমাপ্তি ক্যাশ ভ্যালিডেশন (Daily Closing Wizard)</span>
                </h3>
                <button
                  onClick={() => setShowClosingModal(false)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  <p className="text-xs">আজকের হিসাবের সারসংক্ষেপ প্রিভিউ হচ্ছে...</p>
                </div>
              ) : (
                <form onSubmit={handleClosingSubmit} className="space-y-4">
                  {/* Ledger Aggregates Preview Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3 font-sans text-xs">
                    <h4 className="text-[10px] font-bold text-slate-650 uppercase border-b border-slate-200 pb-1.5">
                      আজকের হিসাবের খসড়া (Expected Drawer Summary)
                    </h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">প্রারম্ভিক ব্যালেন্স (Opening):</span>
                        <span className="font-extrabold text-slate-700">
                          {formatTaka(centsToTaka(closingPreview?.openingBalanceCents ?? 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">মোট ক্যাশ-ইন (Cash In):</span>
                        <span className="font-extrabold text-emerald-600">
                          {formatTaka(centsToTaka(closingPreview?.totalCashInCents ?? 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">মোট ক্যাশ-আউট (Cash Out):</span>
                        <span className="font-extrabold text-rose-600">
                          {formatTaka(centsToTaka(closingPreview?.totalCashOutCents ?? 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-1.5">
                        <span className="text-slate-800 font-bold">সম্ভাব্য ব্যালেন্স (Expected):</span>
                        <span className="font-black text-slate-800 text-sm">
                          {formatTaka(centsToTaka(closingPreview?.expectedClosingBalanceCents ?? 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input actual counted amount */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 block">প্রকৃত ক্যাশ পরিমাণ (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={actualBalance}
                        onChange={(e) => setActualBalance(e.target.value)}
                        required
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary outline-none font-sans font-extrabold text-slate-800"
                      />
                      <span className="text-[9px] text-slate-400 font-medium block">
                        ড্রয়ারে গুনতি করে পাওয়া ক্যাশের সঠিক পরিমাণ
                      </span>
                    </div>

                    {/* Discrepancy Display Badge */}
                    <div className="flex flex-col justify-center bg-slate-50 rounded-lg border border-slate-150 px-4 py-2">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">হিসাবে অমিল / ঘাটতি</span>
                      <span
                        className={`text-sm font-black font-sans ${
                          discrepancyCents === 0
                            ? 'text-emerald-700'
                            : discrepancyCents < 0
                            ? 'text-rose-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {discrepancyCents === 0
                          ? '৳০'
                          : discrepancyCents < 0
                          ? `-${formatTaka(centsToTaka(Math.abs(discrepancyCents)))} (ঘাটতি)`
                          : `+${formatTaka(centsToTaka(discrepancyCents))} (উদ্বৃত্ত)`}
                      </span>
                      {discrepancyCents !== 0 && (
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">
                          ঘাটতি বা উদ্বৃত্তের সঠিক ব্যাখ্যা নোটে উল্লেখ করুন
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes / Explanation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">মন্তব্য / নোটিশ</label>
                    <textarea
                      placeholder="হিসাবে যদি কোনো অমিল বা ঘাটতি থাকে, তার ব্যাখ্যা এখানে লিখুন..."
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-primary outline-none font-medium"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={recordClosing.isPending}
                    className="h-10 w-full bg-primary text-white font-bold rounded-lg text-xs hover:bg-primary/95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {recordClosing.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>দিনের সমাপ্তি হিসাব চূড়ান্ত করুন</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
