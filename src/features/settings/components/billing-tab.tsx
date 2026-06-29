'use client';

import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useBillingOverviewQuery, useSubscribeMutation, useManualSubscribeMutation, useCancelSubscriptionMutation } from '../api/use-billing';
import { useAdminPlansQuery } from '@/features/admin/api/admin-api'; // Using admin plans query for list of plans
import { Clock } from 'lucide-react';

export function BillingTab() {
  const { data: overview, isLoading: loadingOverview } = useBillingOverviewQuery();
  const { data: plans, isLoading: loadingPlans } = useAdminPlansQuery();
  const subscribeMutation = useSubscribeMutation();
  const manualSubscribeMutation = useManualSubscribeMutation();
  const cancelMutation = useCancelSubscriptionMutation();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState('bkash');
  const [senderAccount, setSenderAccount] = React.useState('');
  const [transactionId, setTransactionId] = React.useState('');

  if (loadingOverview || loadingPlans) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeSub = overview?.activeSubscription;
  const pendingRequest = overview?.pendingRequest;
  const currentPlanEnum = overview?.currentPlanEnum || 'FREE';

  const handleSubscribeClick = (planId: string) => {
    if (planId === 'free') {
      if (confirm('আপনি কি এই প্ল্যানটি সাবস্ক্রাইব করতে চান?')) {
        subscribeMutation.mutate({ planId, billingCycle: 'monthly' }, {
          onSuccess: () => alert('সফলভাবে সাবস্ক্রাইব করা হয়েছে!'),
          onError: () => alert('সাবস্ক্রাইব করতে ব্যর্থ হয়েছে।')
        });
      }
    } else {
      setSelectedPlanId(planId);
      setIsModalOpen(true);
    }
  };

  const handleManualSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !transactionId) return;

    try {
      await manualSubscribeMutation.mutateAsync({
        planId: selectedPlanId,
        billingCycle: 'monthly',
        paymentMethod,
        senderAccount,
        transactionId
      });
      alert('পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে সাবস্ক্রিপশন চালু হবে।');
      setIsModalOpen(false);
    } catch (err) {
      alert('রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCancel = async () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি আপনার বর্তমান সাবস্ক্রিপশন বাতিল করতে চান?')) {
      try {
        await cancelMutation.mutateAsync();
        alert('সাবস্ক্রিপশন বাতিল করা হয়েছে।');
      } catch (err) {
        alert('বাতিল করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">বর্তমান সাবস্ক্রিপশন</h3>
            <p className="text-[10px] text-slate-500 mt-1">আপনার বর্তমান প্ল্যান এবং বিলিং স্ট্যাটাস</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase border border-indigo-100">
            {currentPlanEnum} Plan
          </div>
        </div>

        {pendingRequest ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> আপনার সাবস্ক্রিপশন রিকোয়েস্ট পেন্ডিং আছে
              </p>
              <p className="text-[10px] text-amber-600 mt-1">
                অ্যাডমিন অ্যাপ্রুভ করলে আপনার সাবস্ক্রিপশন চালু হবে। (ট্রানজেকশন আইডি: {pendingRequest.transactionId})
              </p>
            </div>
          </div>
        ) : activeSub ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> আপনার সাবস্ক্রিপশন অ্যাক্টিভ আছে
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">
                মেয়াদ শেষ হবে: {new Date(activeSub.endDate || '').toLocaleDateString('bn-BD')}
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              {cancelMutation.isPending ? 'বাতিল হচ্ছে...' : 'ক্যান্সেল সাবস্ক্রিপশন'}
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" /> আপনি বর্তমানে ফ্রি প্ল্যানে আছেন
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              উন্নত ফিচার পেতে একটি প্রিমিয়াম প্ল্যান আপগ্রেড করুন।
            </p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <h3 className="text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">উপলব্ধ প্ল্যানসমূহ</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrent = (plan.id === 'free' && currentPlanEnum === 'FREE') || 
                            (plan.id === 'basic' && currentPlanEnum === 'STARTER') || 
                            (plan.id === 'premium' && (currentPlanEnum === 'PROFESSIONAL' || currentPlanEnum === 'ENTERPRISE'));
          
          return (
            <div 
              key={plan.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between ${
                isCurrent ? 'border-primary ring-2 ring-primary/10' : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" /> {plan.name}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">৳{plan.priceMonthly}</span>
                    <span className="text-[10px] text-slate-500">/ মাস</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    পণ্য লিমিট: {plan.maxProductsLimit === 'unlimited' ? 'সীমাহীন' : plan.maxProductsLimit}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ট্রানজেকশন লিমিট: {plan.maxTransactionsLimit === 'unlimited' ? 'সীমাহীন' : plan.maxTransactionsLimit}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-auto">
                <button
                  disabled={isCurrent || subscribeMutation.isPending || !!pendingRequest}
                  onClick={() => handleSubscribeClick(plan.id)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    isCurrent || !!pendingRequest
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {isCurrent ? 'বর্তমান প্ল্যান' : 'সাবস্ক্রাইব করুন'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">পেমেন্ট রিকোয়েস্ট</h3>
            <p className="text-xs text-slate-500 mb-4">অনুগ্রহ করে নিচের যে কোন একটি মাধ্যমে পেমেন্ট করে ট্রানজেকশন আইডি দিন।</p>
            <form onSubmit={handleManualSubscribeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                <select 
                  className="w-full text-sm border-slate-200 rounded-lg p-2 border" 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="bkash">bKash (017XXXXXX)</option>
                  <option value="nagad">Nagad (017XXXXXX)</option>
                  <option value="bank">Bank Transfer (DBBL 123.xxx.xxx)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">সেন্ডার একাউন্ট / নম্বর</label>
                <input 
                  type="text" 
                  className="w-full text-sm border-slate-200 rounded-lg p-2 border"
                  placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" 
                  value={senderAccount}
                  onChange={e => setSenderAccount(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ট্রানজেকশন আইডি (TxnID)</label>
                <input 
                  type="text" 
                  className="w-full text-sm border-slate-200 rounded-lg p-2 border"
                  placeholder="উদাহরণ: 8H7C..." 
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">বাতিল</button>
                <button type="submit" disabled={manualSubscribeMutation.isPending} className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90">
                  {manualSubscribeMutation.isPending ? 'পাঠানো হচ্ছে...' : 'সাবমিট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
