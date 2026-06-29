'use client';

import React from 'react';
import { useSubscriptionRequestsQuery, useApproveSubscriptionRequestMutation, useRejectSubscriptionRequestMutation } from '../api/admin-api';
import { Check, X, Clock } from 'lucide-react';

export function SubscriptionRequests() {
  const { data: requests, isLoading } = useSubscriptionRequestsQuery();
  const approveMutation = useApproveSubscriptionRequestMutation();
  const rejectMutation = useRejectSubscriptionRequestMutation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">সাবস্ক্রিপশন রিকোয়েস্ট (Subscription Requests)</h2>
          <p className="text-xs text-slate-500 mt-1">পেন্ডিং ম্যানুয়াল সাবস্ক্রিপশন পেমেন্ট</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <Clock className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">কোনো পেন্ডিং রিকোয়েস্ট নেই</h3>
          <p className="text-xs text-slate-500 mt-1">সব পেমেন্ট রিকোয়েস্ট দেখা হয়েছে।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">সাবস্ক্রিপশন রিকোয়েস্ট (Subscription Requests)</h2>
        <p className="text-xs text-slate-500 mt-1">পেন্ডিং ম্যানুয়াল সাবস্ক্রিপশন পেমেন্ট</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
                <th className="py-3 px-4">দোকানের নাম (Shop)</th>
                <th className="py-3 px-4">প্ল্যান (Plan)</th>
                <th className="py-3 px-4">মেথড (Method)</th>
                <th className="py-3 px-4">একাউন্ট (Account)</th>
                <th className="py-3 px-4">TxnID</th>
                <th className="py-3 px-4">অ্যামাউন্ট (Amount)</th>
                <th className="py-3 px-4">সময় (Time)</th>
                <th className="py-3 px-4 text-right">অ্যাকশন (Action)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{req.shop?.name}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">{req.plan?.name}</td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      {req.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{req.senderAccount || '-'}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-800">{req.transactionId}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">৳{req.amountCents}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(req.requestedAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (confirm('অ্যাপ্রুভ করতে চান?')) {
                            approveMutation.mutate(req.id);
                          }
                        }}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('রিজেক্ট করতে চান?')) {
                            rejectMutation.mutate(req.id);
                          }
                        }}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
