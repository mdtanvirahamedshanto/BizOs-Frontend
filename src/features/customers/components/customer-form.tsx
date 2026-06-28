'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, MapPin, FileText, Landmark, Users, Loader2 } from 'lucide-react';
import { customerSchema, CustomerInput } from '../types';
import { useCreateCustomerMutation, useUpdateCustomerMutation, Customer } from '../api/customers-api';

interface CustomerFormProps {
  customer?: Customer; // If provided, we are in Edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const isEdit = !!customer;
  
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomerMutation();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomerMutation();

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
      guardianName: (customer as any)?.guardianName || '',
      initialDue: customer?.dueAmount || 0,
    },
  });

  const onSubmit = (data: CustomerInput) => {
    if (isEdit && customer) {
      updateCustomer({ id: customer.id, input: data }, { onSuccess: () => onSuccess() });
    } else {
      createCustomer(data, { onSuccess: () => onSuccess() });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="border-b border-slate-100 pb-2 mb-3">
        <h3 className="text-sm font-bold text-slate-800">
          {isEdit ? 'গ্রাহকের তথ্য পরিবর্তন করুন' : 'নতুন গ্রাহক যোগ করুন'}
        </h3>
        <p className="text-[10px] text-slate-400 font-medium">
          {isEdit ? 'Edit Customer Details' : 'Add New Customer Profile'}
        </p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="customer-name" className="block text-xs font-semibold text-slate-700 mb-1">
          গ্রাহকের নাম <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="customer-name"
            type="text"
            placeholder="যেমন: মোঃ আনিসুর রহমান"
            {...register('name')}
            className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
              errors.name
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.name.message}</p>
        )}
      </div>

      {/* Mobile Phone */}
      <div>
        <label htmlFor="customer-phone" className="block text-xs font-semibold text-slate-700 mb-1">
          মোবাইল নম্বর <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Phone className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="customer-phone"
            type="tel"
            inputMode="tel"
            placeholder="017xxxxxxxx"
            {...register('phone')}
            className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
              errors.phone
                ? 'border-destructive focus:ring-1 focus:ring-destructive'
                : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.phone && (
          <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.phone.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="customer-address" className="block text-xs font-semibold text-slate-700 mb-1">
          ঠিকানা
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MapPin className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="customer-address"
            type="text"
            placeholder="যেমন: হাউজ নং ১২, রোড নং ৩, সেক্টর ৪, ঢাকা"
            {...register('address')}
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Guardian / Wali */}
      <div>
        <label htmlFor="customer-guardian" className="block text-xs font-semibold text-slate-700 mb-1">
          অলী / অভিভাবকের নাম
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="customer-guardian"
            type="text"
            placeholder="যেমন: মোঃ রহিম (পিতা / স্বামী)"
            {...register('guardianName')}
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Initial Due (Only shown during Creation) */}
      {!isEdit && (
        <div>
          <label htmlFor="customer-due" className="block text-xs font-semibold text-slate-700 mb-1">
            প্রারম্ভিক বকেয়া / পূর্বের বাকি (৳)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Landmark className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="customer-due"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              {...register('initialDue', { valueAsNumber: true })}
              className={`h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition-all ${
                errors.initialDue
                  ? 'border-destructive focus:ring-1 focus:ring-destructive'
                  : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>
          {errors.initialDue && (
            <p className="text-[10px] text-destructive mt-1 font-semibold">
              {errors.initialDue.message}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="customer-notes" className="block text-xs font-semibold text-slate-700 mb-1">
          অতিরিক্ত নোট / তথ্য
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-3 left-3">
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <textarea
            id="customer-notes"
            rows={2}
            placeholder="গ্রাহক সম্পর্কে যেকোনো নোট এখানে লিখুন..."
            {...register('notes')}
            className="w-full rounded-lg border pl-9 pr-3 py-2 text-xs border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          বাতিল করুন
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 disabled:bg-primary/50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>লোডিং...</span>
            </>
          ) : (
            <span>{isEdit ? 'তথ্য আপডেট করুন' : 'গ্রাহক সংরক্ষণ করুন'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
