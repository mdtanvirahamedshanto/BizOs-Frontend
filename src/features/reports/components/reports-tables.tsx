'use client';

import React from 'react';
import { ProfitReportRow, ExpenseReportRow, InventoryReportRow, DueReportRow } from '../types';
import { formatTaka } from '@/features/dashboard/components/kpi-cards';

interface ReportsTablesProps {
  activeSection: 'profit' | 'expense' | 'inventory' | 'dues';
  profitRows: ProfitReportRow[];
  expenseRows: ExpenseReportRow[];
  inventoryRows: InventoryReportRow[];
  dueRows: DueReportRow[];
}

export function ReportsTables({ activeSection, profitRows, expenseRows, inventoryRows, dueRows }: ReportsTablesProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs overflow-hidden">
      {/* Dynamic Header Titles */}
      <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {activeSection === 'profit' && 'লাভ-ক্ষতি বিবরণী রিপোর্ট'}
            {activeSection === 'expense' && 'ব্যয় বা খরচ সমূহ'}
            {activeSection === 'inventory' && 'ইনভেন্টরি স্টক মূল্যায়ন রিপোর্ট'}
            {activeSection === 'dues' && 'বকেয়া ও আদায়যোগ্য বিবরণী'}
          </h3>
          <p className="text-[9px] text-slate-400 font-medium">
            {activeSection === 'profit' && 'Profitability Margins & Sales Logs'}
            {activeSection === 'expense' && 'Expenses Lists & Payout Channels'}
            {activeSection === 'inventory' && 'Inventory Stock Levels & Retail Valuations'}
            {activeSection === 'dues' && 'Outstanding Customer Credits Ledger'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* 1. Profit Table */}
        {activeSection === 'profit' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5">তারিখ ও সময়</th>
                <th className="py-2.5">বিবরণ (Description)</th>
                <th className="py-2.5 text-right">বিক্রয়মূল্য (Sales)</th>
                <th className="py-2.5 text-right">ক্রয়মূল্য (COGS)</th>
                <th className="py-2.5 text-right">মোট লাভ (Profit)</th>
                <th className="py-2.5 text-center">লাভের হার (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {profitRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-semibold text-slate-500">{row.timestamp}</td>
                  <td className="py-3 font-bold text-slate-800">{row.description}</td>
                  <td className="py-3 text-right font-sans font-extrabold">{formatTaka(row.salesAmount)}</td>
                  <td className="py-3 text-right font-sans text-slate-500">{formatTaka(row.costPrice)}</td>
                  <td className="py-3 text-right font-sans text-emerald-700 font-extrabold">{formatTaka(row.grossProfit)}</td>
                  <td className="py-3 text-center font-sans font-bold text-slate-600">{row.marginPercentage}%</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-slate-100 font-black text-slate-900 bg-slate-50/50">
                <td className="py-3 pl-2" colSpan={2}>সর্বমোট হিসাব (Total Summary):</td>
                <td className="py-3 text-right font-sans text-primary">
                  {formatTaka(profitRows.reduce((sum, r) => sum + r.salesAmount, 0))}
                </td>
                <td className="py-3 text-right font-sans text-slate-600">
                  {formatTaka(profitRows.reduce((sum, r) => sum + r.costPrice, 0))}
                </td>
                <td className="py-3 text-right font-sans text-emerald-700">
                  {formatTaka(profitRows.reduce((sum, r) => sum + r.grossProfit, 0))}
                </td>
                <td className="py-3 text-center font-sans">
                  {Math.round(
                    (profitRows.reduce((sum, r) => sum + r.grossProfit, 0) /
                      (profitRows.reduce((sum, r) => sum + r.salesAmount, 0) || 1)) *
                      100
                  )}%
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* 2. Expense Table */}
        {activeSection === 'expense' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5">তারিখ ও সময়</th>
                <th className="py-2.5">ব্যয়ের খাত (Category)</th>
                <th className="py-2.5">বিবরণ / নোট</th>
                <th className="py-2.5 text-center">পেমেন্ট মেথড</th>
                <th className="py-2.5 text-right pr-2">পরিমাণ (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {expenseRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-semibold text-slate-500">{row.timestamp}</td>
                  <td className="py-3 font-black text-slate-800">{row.category}</td>
                  <td className="py-3 text-slate-650">{row.description}</td>
                  <td className="py-3 text-center">
                    <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                      {row.paymentMode === 'bkash' ? 'বিকাশ' : row.paymentMode === 'nagad' ? 'নগদ' : row.paymentMode === 'bank' ? 'ব্যাংক' : 'ক্যাশ'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans font-extrabold text-rose-600 pr-2">{formatTaka(row.amount)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-slate-100 font-black text-slate-900 bg-slate-50/50">
                <td className="py-3 pl-2" colSpan={4}>সর্বমোট খরচ (Total Expenses):</td>
                <td className="py-3 text-right font-sans text-rose-600 pr-2">
                  {formatTaka(expenseRows.reduce((sum, r) => sum + r.amount, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* 3. Inventory Table */}
        {activeSection === 'inventory' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5">প্রোডাক্ট নাম</th>
                <th className="py-2.5">SKU Code</th>
                <th className="py-2.5 text-right">ক্রয়মূল্য (৳)</th>
                <th className="py-2.5 text-right">বিক্রয়মূল্য (৳)</th>
                <th className="py-2.5 text-center">মজুদ স্টক</th>
                <th className="py-2.5 text-right">স্টক মূল্য (Cost)</th>
                <th className="py-2.5 text-right pr-2">স্টক মূল্য (Retail)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {inventoryRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-bold text-slate-800">{row.productName}</td>
                  <td className="py-3 font-mono font-semibold text-slate-400">{row.sku}</td>
                  <td className="py-3 text-right font-sans">{formatTaka(row.costPrice)}</td>
                  <td className="py-3 text-right font-sans">{formatTaka(row.price)}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      row.stockCount <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.stockCount} {row.unit}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans font-extrabold text-slate-800">{formatTaka(row.stockValueCost)}</td>
                  <td className="py-3 text-right font-sans font-extrabold text-primary pr-2">{formatTaka(row.stockValueRetail)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-slate-100 font-black text-slate-900 bg-slate-50/50">
                <td className="py-3 pl-2" colSpan={5}>সর্বমোট ইনভেন্টরি মূল্য (Total Valuations):</td>
                <td className="py-3 text-right font-sans text-slate-800">
                  {formatTaka(inventoryRows.reduce((sum, r) => sum + r.stockValueCost, 0))}
                </td>
                <td className="py-3 text-right font-sans text-primary pr-2">
                  {formatTaka(inventoryRows.reduce((sum, r) => sum + r.stockValueRetail, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* 4. Due Table */}
        {activeSection === 'dues' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5">কাস্টমার নাম</th>
                <th className="py-2.5">মোবাইল নম্বর</th>
                <th className="py-2.5">মন্তব্য / বিবরণ</th>
                <th className="py-2.5 text-center">সর্বশেষ পরিশোধ তারিখ</th>
                <th className="py-2.5 text-right pr-2">মোট বকেয়া পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {dueRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-bold text-slate-800">{row.customerName}</td>
                  <td className="py-3 font-semibold text-slate-500">{row.phone}</td>
                  <td className="py-3 text-slate-400 font-medium">{row.notes || 'N/A'}</td>
                  <td className="py-3 text-center text-slate-500">{row.lastPaymentDate || 'পরিশোধ করা হয়নি'}</td>
                  <td className="py-3 text-right font-sans font-extrabold text-rose-600 pr-2">{formatTaka(row.dueAmount)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-slate-100 font-black text-slate-900 bg-slate-50/50">
                <td className="py-3 pl-2" colSpan={4}>সর্বমোট আদায়যোগ্য বকেয়া (Total Dues):</td>
                <td className="py-3 text-right font-sans text-rose-600 pr-2">
                  {formatTaka(dueRows.reduce((sum, r) => sum + r.dueAmount, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
