'use client';

import React from 'react';
import { ExpenseList } from '@/features/expenses/components/expense-list';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">খরচ ব্যবস্থাপনা</h1>
        <p className="text-xs font-semibold text-slate-500">
          দৈনিক অপারেশনাল খরচ রেকর্ড, ক্যাটাগরি ট্র্যাকিং ও রিপোর্টিং
        </p>
      </div>
      <ExpenseList />
    </div>
  );
}
