'use client';

import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { useAdminTenantsQuery, useToggleTenantMutation } from '../api/admin-api';
import { Tenant } from '../types';

export function TenantManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: tenants, isLoading } = useAdminTenantsQuery(search, statusFilter);
  const toggleTenantMutation = useToggleTenantMutation();

  const handleStatusChange = async (tenantId: string, nextStatus: Tenant['status']) => {
    try {
      await toggleTenantMutation.mutateAsync({ tenantId, nextStatus });
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const getPlanNameBangla = (plan: Tenant['currentPlan']) => {
    switch (plan) {
      case 'free': return 'ফ্রি ট্রায়াল (Free)';
      case 'basic': return 'বেসিক স্টোর (Basic)';
      case 'premium': return 'প্রিমিয়াম বিআইজেড (Premium)';
      default: return plan;
    }
  };

  const getTypeBangla = (type: Tenant['type']) => {
    switch (type) {
      case 'grocery': return 'মুদি দোকান (Grocery)';
      case 'clothing': return 'পোশাক-আশাক (Clothing)';
      case 'restaurant': return 'রেস্টুরেন্ট (Restaurant)';
      case 'hardware': return 'হার্ডওয়্যার (Hardware)';
      case 'wholesale': return 'পাইকারি বিক্রেতা (Wholesale)';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">মার্চেন্ট ও টেন্যান্ট ম্যানেজমেন্ট (Tenant Directory)</h2>
        <p className="text-xs text-slate-500 mt-1">সিস্টেমে নিবন্ধিত সকল মার্চেন্ট দোকানের অ্যাকাউন্ট নিয়ন্ত্রণ, অ্যাক্টিভেশন ও সাবস্ক্রিপশন ট্র্যাকিং</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="মার্চেন্ট, মালিক বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-6 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full"
            >
              <option value="all">সকল স্ট্যাটাস (All)</option>
              <option value="active">সক্রিয় মার্চেন্ট (Active)</option>
              <option value="trial">পরীক্ষামূলক (Trial)</option>
              <option value="suspended">সাময়িক স্থগিত (Suspended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : !tenants || tenants.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-semibold">কোনো মার্চেন্ট অ্যাকাউন্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="p-4">মার্চেন্ট বিবরণী (Merchant Info)</th>
                  <th className="p-4">ব্যবসার ধরন (Type)</th>
                  <th className="p-4">চলতি প্ল্যান (Plan Details)</th>
                  <th className="p-4">নিবন্ধিত ব্যবহারকারী (Users)</th>
                  <th className="p-4">স্ট্যাটাস (Status)</th>
                  <th className="p-4 text-right">অ্যাকশন (Account Controls)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Merchant Details */}
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{t.merchantName}</div>
                      <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>মালিক: <span className="font-semibold text-slate-600">{t.ownerName}</span></span>
                        <span>•</span>
                        <span>ফোন: <span className="font-semibold text-slate-600">{t.phone}</span></span>
                      </div>
                    </td>

                    {/* Business Type */}
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-[10px] font-semibold">
                        {getTypeBangla(t.type)}
                      </span>
                    </td>

                    {/* Plan & Expiry */}
                    <td className="p-4 space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.currentPlan === 'premium'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : t.currentPlan === 'basic'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getPlanNameBangla(t.currentPlan)}
                      </span>
                      <div className="text-[9px] text-slate-400">
                        মেয়াদ শেষ: <span className="font-semibold text-slate-500">{t.subscriptionExpiry}</span>
                      </div>
                    </td>

                    {/* Users count */}
                    <td className="p-4">
                      <span className="font-mono bg-indigo-50/50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100/50 font-bold">
                        {t.usersCount} জন
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : t.status === 'trial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {t.status === 'active' ? (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" /> সক্রিয় (Active)
                          </>
                        ) : t.status === 'trial' ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" /> ট্রায়াল (Trial)
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5" /> স্থগিত (Suspended)
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="p-4 text-right">
                      {toggleTenantMutation.isPending && toggleTenantMutation.variables?.tenantId === t.id ? (
                        <span className="text-[10px] text-slate-400">আপডেট হচ্ছে...</span>
                      ) : (
                        <div className="inline-flex gap-1">
                          {t.status === 'suspended' ? (
                            <button
                              onClick={() => handleStatusChange(t.id, 'active')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-colors font-bold text-[10px]"
                            >
                              অ্যাক্টিভ করুন (Activate)
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(t.id, 'suspended')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-colors font-bold text-[10px] flex items-center gap-0.5"
                            >
                              <AlertTriangle className="h-3 w-3" /> স্থগিত করুন (Suspend)
                            </button>
                          )}
                          {t.status === 'trial' && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'active')}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 transition-colors font-bold text-[10px]"
                            >
                              পেইড এ আপগ্রেড
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
