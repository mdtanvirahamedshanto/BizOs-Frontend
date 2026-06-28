'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { shop, users } from '@/lib/api';
import { useTenantStore } from '@/stores/use-tenant';
import { Loader2, Store, Users, FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/auth-provider';
import { BillingTab } from '@/features/settings/components/billing-tab';

export default function SettingsPage() {
  const businessId = useTenantStore((s) => s.activeBusinessId);
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'receipt' | 'subscription'>('profile');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Shop state form
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopStreet, setShopStreet] = useState('');
  const [shopCity, setShopCity] = useState('');

  // Receipt state form
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [taxId, setTaxId] = useState('');
  const [receiptMessage, setReceiptMessage] = useState('');

  // Team invitation form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');

  // 1. Fetch active shop details
  const { data: shopDetails, isLoading: loadingShop, refetch: refetchShop } = useQuery({
    queryKey: ['settings', 'shop', businessId],
    queryFn: () => shop.getShop(businessId || ''),
    enabled: !!businessId,
  });

  // Populate shop states
  useEffect(() => {
    if (shopDetails) {
      setShopName(shopDetails.name || '');
      setShopPhone(shopDetails.phone || '');
      setShopEmail(shopDetails.email || '');
      setShopStreet(shopDetails.address?.street || '');
      setShopCity(shopDetails.address?.city || '');
      
      setReceiptHeader(shopDetails.settings?.receiptHeader || '');
      setReceiptFooter(shopDetails.settings?.receiptFooter || '');
      setTaxId(shopDetails.settings?.taxId || '');
      setReceiptMessage((shopDetails.settings as any)?.receiptMessage || '');
    }
  }, [shopDetails]);

  // 2. Fetch users & roles
  const { data: teamMembers, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['settings', 'users', businessId],
    queryFn: () => users.listUsers(),
    enabled: activeTab === 'team',
  });

  const { data: roles } = useQuery({
    queryKey: ['settings', 'roles', businessId],
    queryFn: () => users.listRoles(),
    enabled: activeTab === 'team',
  });

  // 3. Mutations
  const updateShopMutation = useMutation({
    mutationFn: (data: any) => shop.updateShop(businessId || '', data),
    onSuccess: () => {
      refetchShop();
      showSuccess('দোকান প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
    },
    onError: (err: any) => {
      alert(err.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => shop.updateShopSettings(businessId || '', data),
    onSuccess: () => {
      refetchShop();
      showSuccess('ক্যাশ মেমো সেটিংস সফলভাবে আপডেট করা হয়েছে।');
    },
    onError: (err: any) => {
      alert(err.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
    }
  });

  const inviteUserMutation = useMutation({
    mutationFn: users.inviteUser,
    onSuccess: () => {
      refetchUsers();
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
      setInviteRoleId('');
      showSuccess('টিম মেম্বারকে সফলভাবে যুক্ত করা হয়েছে। ডিফল্ট পাসওয়ার্ড: password123');
    },
    onError: (err: any) => {
      alert(err.message || 'টিম মেম্বার যোগ করতে ব্যর্থ হয়েছে।');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: users.deleteUser,
    onSuccess: () => {
      refetchUsers();
      showSuccess('টিম মেম্বারকে সফলভাবে ডিলিট করা হয়েছে।');
    },
    onError: (err: any) => {
      alert(err.message || 'মেম্বার ডিলিট করতে ব্যর্থ হয়েছে।');
    }
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopMutation.mutate({
      name: shopName,
      phone: shopPhone,
      email: shopEmail,
      address: {
        street: shopStreet,
        city: shopCity,
        country: 'Bangladesh',
      }
    });
  };

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      settings: {
        receiptHeader,
        receiptFooter,
        taxId,
        receiptMessage,
      } as any
    });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteRoleId) {
      alert('অনুগ্রহ করে একটি রোল নির্বাচন করুন।');
      return;
    }
    inviteUserMutation.mutate({
      name: inviteName,
      email: inviteEmail,
      phone: invitePhone || undefined,
      roleId: inviteRoleId,
    });
  };

  if (loadingShop) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="settings:write">
      <div className="space-y-6 text-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              সেটিংস ও প্রোফাইল
            </h1>
            <p className="text-xs font-semibold text-slate-500 leading-none">
              দোকান প্রোফাইল, ক্যাশ মেমো বিলিং টেমপ্লেট এবং টিম মেম্বারদের রোল অ্যাক্সেস সেটিংস পরিচালনা করুন
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'bg-primary text-white' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>প্রোফাইল সেটিংস</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'team' ? 'bg-primary text-white' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>টিম ও অ্যাক্সেস</span>
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'receipt' ? 'bg-primary text-white' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>ক্যাশ মেমো সেটিংস</span>
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'subscription' ? 'bg-primary text-white' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>সাবস্ক্রিপশন ও বিলিং</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="rounded-lg bg-emerald-50 border-l-4 border-emerald-500 p-3 text-[11px] font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main tab workspaces */}
        <div className="h-full">
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">
                দোকান বিবরণ ও প্রোফাইল
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4 font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="shop-name-input" className="block text-[10px] text-slate-500 uppercase">দোকানের নাম *</label>
                    <input
                      id="shop-name-input"
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="shop-phone-input" className="block text-[10px] text-slate-500 uppercase">ফোন নম্বর</label>
                    <input
                      id="shop-phone-input"
                      type="text"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="shop-email-input" className="block text-[10px] text-slate-500 uppercase">ইমেইল এড্রেস</label>
                  <input
                    id="shop-email-input"
                    type="email"
                    value={shopEmail}
                    onChange={(e) => setShopEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="shop-street-input" className="block text-[10px] text-slate-500 uppercase">রাস্তা / এলাকা</label>
                    <input
                      id="shop-street-input"
                      type="text"
                      value={shopStreet}
                      onChange={(e) => setShopStreet(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="shop-city-input" className="block text-[10px] text-slate-500 uppercase">শহর / থানা</label>
                    <input
                      id="shop-city-input"
                      type="text"
                      value={shopCity}
                      onChange={(e) => setShopCity(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateShopMutation.isPending}
                  className="h-10 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {updateShopMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>সেভ করুন</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
              {/* Team members list */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                  টিম মেম্বার তালিকা
                </h3>
                
                {loadingUsers ? (
                  <div className="text-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                  </div>
                ) : teamMembers?.length === 0 ? (
                  <p className="text-center py-8 text-slate-450 font-bold">কোনো অতিরিক্ত মেম্বার পাওয়া যায়নি।</p>
                ) : (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden font-medium">
                    {teamMembers?.map((member) => {
                      const roleName = member.userRoles?.[0]?.role?.name || 'Cashier';
                      return (
                        <div key={member.id} className="p-3.5 bg-slate-50/20 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{member.email} • {member.phone || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-black uppercase ${
                              roleName === 'Owner' || roleName === 'SuperAdmin'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : roleName === 'Manager'
                                ? 'bg-sky-50 text-sky-700 border border-sky-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {roleName === 'Owner' ? 'মালিক' : roleName === 'Manager' ? 'ম্যানেজার' : 'ক্যাশিয়ার'}
                            </span>
                            {roleName !== 'Owner' && (
                              <button
                                onClick={() => {
                                  if (confirm('আপনি কি নিশ্চিত যে এই মেম্বারকে বাদ দিতে চান?')) {
                                    deleteUserMutation.mutate(member.id);
                                  }
                                }}
                                disabled={deleteUserMutation.isPending}
                                className="p-1 text-slate-400 hover:text-red-655 rounded hover:bg-red-50 border border-slate-150 transition-all cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Invite team form */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" />
                  <span>নতুন মেম্বার যুক্ত করুন</span>
                </h3>
                <form onSubmit={handleInviteSubmit} className="space-y-3 font-semibold">
                  <div className="space-y-1">
                    <label htmlFor="invite-name" className="block text-[10px] text-slate-500 uppercase">মেম্বার নাম *</label>
                    <input
                      id="invite-name"
                      type="text"
                      required
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="invite-email" className="block text-[10px] text-slate-500 uppercase">ইমেইল এড্রেস *</label>
                    <input
                      id="invite-email"
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="invite-phone" className="block text-[10px] text-slate-500 uppercase">মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <input
                      id="invite-phone"
                      type="text"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="invite-role" className="block text-[10px] text-slate-500 uppercase">মেম্বার রোল (Role) *</label>
                    <select
                      id="invite-role"
                      required
                      value={inviteRoleId}
                      onChange={(e) => setInviteRoleId(e.target.value)}
                      className="h-9 w-full bg-white rounded-lg border border-slate-200 px-2.5 outline-none focus:border-primary text-xs"
                    >
                      <option value="">রোল সিলেক্ট করুন</option>
                      {roles?.filter(r => r.name !== 'SuperAdmin' && r.name !== 'Owner').map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name === 'Manager' ? 'ম্যানেজার (Manager)' : 'ক্যাশিয়ার (Staff/Cashier)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={inviteUserMutation.isPending}
                    className="h-9 w-full bg-primary text-white rounded-lg font-bold hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {inviteUserMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>যোগ করুন</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">
                ক্যাশ মেমো সেটিংস (Receipt Customization)
              </h3>
              <form onSubmit={handleReceiptSubmit} className="space-y-4 font-semibold">
                <div className="space-y-1">
                  <label htmlFor="receipt-header-input" className="block text-[10px] text-slate-500 uppercase">মেমো হেডার (Receipt Header)</label>
                  <input
                    id="receipt-header-input"
                    type="text"
                    placeholder="যেমন: বিক্রয় মেমো"
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="receipt-footer-input" className="block text-[10px] text-slate-500 uppercase">মেমো ফুটার (Receipt Footer)</label>
                  <input
                    id="receipt-footer-input"
                    type="text"
                    placeholder="যেমন: ধন্যবাদ আবার আসবেন"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="receipt-tax-input" className="block text-[10px] text-slate-500 uppercase">ট্যাক্স / মূসক আইডি (BIN/Tax ID)</label>
                    <input
                      id="receipt-tax-input"
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="receipt-message-input" className="block text-[10px] text-slate-500 uppercase">ধন্যবাদ বার্তা (Thank you message)</label>
                    <input
                      id="receipt-message-input"
                      type="text"
                      value={receiptMessage}
                      onChange={(e) => setReceiptMessage(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="h-10 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>আপডেট করুন</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'subscription' && (
            <BillingTab />
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
