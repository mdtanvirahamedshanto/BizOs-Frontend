'use client';

import React, { useState, useEffect } from 'react';
import {
  useSuppliersQuery,
  useSupplierLedgerQuery,
  useSupplierPaymentsHistoryQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useRecordSupplierSettlementMutation,
} from '../api/suppliers-api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierInputSchema, SupplierInput, settlementRecordSchema, SettlementRecordInput } from '../types';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';
import { useCursorPagination } from '@/lib/crm/pagination';
import { CursorPagination } from '@/components/ui/cursor-pagination';
import {
  Search,
  Plus,
  Truck,
  CreditCard,
  Loader2,
  ArrowUpRight,
  Calendar,
  FileText,
  UserPlus,
  Edit,
  Trash2,
} from 'lucide-react';

export function SupplierKhata() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'dues' | 'all'>('dues');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [ledgerTab, setLedgerTab] = useState<'ledger' | 'payments'>('ledger');

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierInput & { id: string } | null>(null);
  const [showSettlementForm, setShowSettlementForm] = useState(false);

  const { cursor, reset, next, prev, hasPrev } = useCursorPagination();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    reset();
  }, [debouncedSearch, filterTab, reset]);

  const { data: suppliers, meta, isLoading: isSuppliersLoading } = useSuppliersQuery(
    debouncedSearch,
    filterTab === 'dues' ? 'dues' : 'all',
    cursor,
    20,
  );

  const { data: ledger, isLoading: isLedgerLoading } = useSupplierLedgerQuery(selectedSupplierId);
  const { data: payments, isLoading: isPaymentsLoading } = useSupplierPaymentsHistoryQuery(selectedSupplierId);

  const selectedSupplier = suppliers?.find((s) => s.id === selectedSupplierId);

  const {
    register: registerSupplier,
    handleSubmit: handleSubmitSupplier,
    reset: resetSupplier,
    formState: { errors: supplierErrors },
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierInputSchema),
    defaultValues: {
      name: '',
      phone: '',
      companyName: '',
      address: '',
      initialDue: 0,
      notes: '',
    },
  });

  const { mutate: createSupplier, isPending: isCreatingSupplier } = useCreateSupplierMutation();
  const { mutate: updateSupplier, isPending: isUpdatingSupplier } = useUpdateSupplierMutation();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplierMutation();

  const {
    register: registerSettle,
    handleSubmit: handleSubmitSettle,
    reset: resetSettle,
    formState: { errors: settleErrors },
  } = useForm<SettlementRecordInput>({
    resolver: zodResolver(settlementRecordSchema),
    defaultValues: {
      amount: undefined,
      paymentMode: 'cash',
      notes: '',
      transactionId: '',
    },
  });

  const { mutate: recordSettlement, isPending: isRecordingSettle } = useRecordSupplierSettlementMutation();

  const openCreateForm = () => {
    setEditingSupplier(null);
    resetSupplier();
    setShowSupplierForm(true);
    setSelectedSupplierId(null);
  };

  const openEditForm = () => {
    if (!selectedSupplier) return;
    setEditingSupplier({
      id: selectedSupplier.id,
      name: selectedSupplier.name,
      phone: selectedSupplier.phone,
      companyName: selectedSupplier.companyName,
      address: selectedSupplier.address,
      notes: selectedSupplier.notes,
      initialDue: 0,
    });
    resetSupplier({
      name: selectedSupplier.name,
      phone: selectedSupplier.phone,
      companyName: selectedSupplier.companyName,
      address: selectedSupplier.address ?? '',
      notes: selectedSupplier.notes ?? '',
      initialDue: 0,
    });
    setShowSupplierForm(true);
  };

  const handleSelectSupplier = (id: string) => {
    setSelectedSupplierId(id);
    setShowSettlementForm(false);
    setShowSupplierForm(false);
    resetSettle();
  };

  const onRegisterSupplier = (data: SupplierInput) => {
    if (editingSupplier) {
      updateSupplier(
        { id: editingSupplier.id, input: data },
        {
          onSuccess: () => {
            setShowSupplierForm(false);
            setEditingSupplier(null);
          },
          onError: (err) => alert(err.message),
        },
      );
      return;
    }

    createSupplier(data, {
      onSuccess: (newSupp) => {
        setShowSupplierForm(false);
        resetSupplier();
        setSelectedSupplierId(newSupp.id);
      },
      onError: (err) => alert(err.message || 'মহাজন যুক্ত করতে সমস্যা হয়েছে।'),
    });
  };

  const onSubmitSettlement = (data: SettlementRecordInput) => {
    if (!selectedSupplierId) return;

    recordSettlement(
      { supplierId: selectedSupplierId, input: data },
      {
        onSuccess: () => {
          setShowSettlementForm(false);
          resetSettle();
        },
        onError: (err) => alert(err.message || 'পরিশোধ রেকর্ড করতে সমস্যা হয়েছে।'),
      },
    );
  };

  const handleDelete = () => {
    if (!selectedSupplierId) return;
    if (!confirm('এই মহাজন মুছে ফেলতে চান?')) return;

    deleteSupplier(selectedSupplierId, {
      onSuccess: () => setSelectedSupplierId(null),
      onError: (err) => alert(err.message),
    });
  };

  const activeLedger = ledgerTab === 'ledger' ? ledger : payments;
  const isActiveLedgerLoading = ledgerTab === 'ledger' ? isLedgerLoading : isPaymentsLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 h-full">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">মহাজন তালিকা (পাওনা খাতা)</h3>
            <p className="text-[10px] text-slate-400 font-medium">Search & Track Supplier Accounts Payable</p>
          </div>
          <button
            onClick={openCreateForm}
            className="h-8 px-2.5 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/95 transition-all flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>নতুন মহাজন</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setFilterTab('dues')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'dues' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            পাওনা সহ
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            সব মহাজন
          </button>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="নাম বা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
          {isSuppliersLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">মহাজন তালিকা লোড হচ্ছে...</p>
            </div>
          ) : !suppliers || suppliers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">কোনো মহাজন পাওয়া যায়নি।</div>
          ) : (
            suppliers.map((supp) => {
              const isSelected = selectedSupplierId === supp.id;
              return (
                <button
                  key={supp.id}
                  onClick={() => handleSelectSupplier(supp.id)}
                  className={`w-full p-3 border rounded-xl text-left transition-all flex flex-col gap-1.5 ${
                    isSelected ? 'bg-primary/5 border-primary shadow-xs' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{supp.companyName}</span>
                    <span className="text-xs font-sans font-extrabold text-slate-800">{formatTaka(supp.dueAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>{supp.name} ({supp.phone})</span>
                    {supp.dueAmount > 0 && (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">পাওনা আছে</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <CursorPagination
          meta={meta}
          hasPrev={hasPrev}
          onPrev={prev}
          onNext={() => next(meta?.nextCursor)}
          itemLabel="মহাজন"
          currentCount={suppliers?.length ?? 0}
        />
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4 min-h-[400px]">
        {showSupplierForm ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-primary" />
                <span>{editingSupplier ? 'মহাজন সম্পাদনা' : 'নতুন মহাজন যুক্ত করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSupplierForm(false);
                  setEditingSupplier(null);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-650"
              >
                বাতিল করুন
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier(onRegisterSupplier)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    {...registerSupplier('companyName')}
                    className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
                  />
                  {supplierErrors.companyName && (
                    <p className="text-[9px] text-destructive font-semibold">{supplierErrors.companyName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">প্রতিনিধির নাম *</label>
                  <input
                    type="text"
                    {...registerSupplier('name')}
                    className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
                  />
                  {supplierErrors.name && (
                    <p className="text-[9px] text-destructive font-semibold">{supplierErrors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700">মোবাইল *</label>
                  <input
                    type="text"
                    {...registerSupplier('phone')}
                    className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
                  />
                  {supplierErrors.phone && (
                    <p className="text-[9px] text-destructive font-semibold">{supplierErrors.phone.message}</p>
                  )}
                </div>
                {!editingSupplier && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">প্রারম্ভিক পাওনা (৳)</label>
                    <input
                      type="number"
                      {...registerSupplier('initialDue', { valueAsNumber: true })}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="ঠিকানা"
                {...registerSupplier('address')}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="মন্তব্য"
                {...registerSupplier('notes')}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-primary"
              />

              <button
                type="submit"
                disabled={isCreatingSupplier || isUpdatingSupplier}
                className="h-10 w-full bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/95 flex items-center justify-center gap-1.5"
              >
                {(isCreatingSupplier || isUpdatingSupplier) ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <span>{editingSupplier ? 'আপডেট করুন' : 'মহাজন রেজিস্টার করুন'}</span>
                )}
              </button>
            </form>
          </div>
        ) : !selectedSupplier ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
            <Truck className="h-10 w-10 text-slate-200 mb-2" />
            <p className="text-xs font-bold">কোনো মহাজন নির্বাচন করা হয়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{selectedSupplier.companyName}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {selectedSupplier.name} ({selectedSupplier.phone}) • {selectedSupplier.address || 'ঠিকানা নেই'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={openEditForm} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">সর্বমোট দেনা</span>
                  <span className="text-sm font-black text-amber-600 font-sans">{formatTaka(selectedSupplier.dueAmount)}</span>
                </div>
                {selectedSupplier.dueAmount > 0 && !showSettlementForm && (
                  <button
                    onClick={() => setShowSettlementForm(true)}
                    className="h-9 px-3.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 flex items-center gap-1"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>টাকা পরিশোধ</span>
                  </button>
                )}
              </div>
            </div>

            {showSettlementForm && (
              <form onSubmit={handleSubmitSettle(onSubmitSettlement)} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>টাকা পরিশোধ রেকর্ড করুন</span>
                  </h4>
                  <button type="button" onClick={() => setShowSettlementForm(false)} className="text-[10px] font-bold text-slate-400">
                    বন্ধ করুন
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">পরিমাণ (৳)</label>
                    <input
                      type="number"
                      {...registerSettle('amount', { valueAsNumber: true })}
                      className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary"
                    />
                    {settleErrors.amount && (
                      <p className="text-[9px] text-destructive font-semibold">{settleErrors.amount.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">পেমেন্ট মোড</label>
                    <select
                      {...registerSettle('paymentMode')}
                      className="h-9 w-full rounded-lg border bg-white border-slate-200 px-2 text-xs outline-none focus:border-primary"
                    >
                      <option value="cash">নগদ</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="bank">ব্যাংক</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="TrxID/Ref..."
                  {...registerSettle('transactionId')}
                  className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary font-mono"
                />
                <input
                  type="text"
                  placeholder="মন্তব্য"
                  {...registerSettle('notes')}
                  className="h-9 w-full rounded-lg border bg-white border-slate-200 px-3 text-xs outline-none focus:border-primary"
                />

                <button
                  type="submit"
                  disabled={isRecordingSettle}
                  className="h-10 w-full bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/95 flex items-center justify-center gap-1.5"
                >
                  {isRecordingSettle ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>পরিশোধ সম্পন্ন করুন</span>
                  )}
                </button>
              </form>
            )}

            <div className="flex border-b border-slate-100 gap-2">
              <button
                onClick={() => setLedgerTab('ledger')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-t-lg ${
                  ledgerTab === 'ledger' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
                }`}
              >
                লেনদেন ইতিহাস
              </button>
              <button
                onClick={() => setLedgerTab('payments')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-t-lg ${
                  ledgerTab === 'payments' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
                }`}
              >
                পেমেন্ট ইতিহাস
              </button>
            </div>

            <div className="space-y-2">
              {isActiveLedgerLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto mb-1" />
                </div>
              ) : !activeLedger || activeLedger.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-[10px] italic">কোনো লেনদেন রেকর্ড নেই।</p>
              ) : (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                  {activeLedger.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50/20 hover:bg-slate-50/50 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                              item.type === 'settlement'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}
                          >
                            {item.type === 'settlement' ? 'পেমেন্ট' : 'ক্রয়'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" />
                            {item.timestamp.substring(0, 16)}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-700 truncate">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-sans font-black text-[13px] ${
                          item.type === 'settlement' ? 'text-emerald-700' : 'text-amber-600'
                        }`}>
                          {item.type === 'settlement' ? '-' : '+'} {formatTaka(item.amount)}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold font-sans">
                          ব্যালেন্স: {formatTaka(item.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
