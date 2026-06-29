'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';

interface ReportsExportProps {
  activeSection: 'profit' | 'expense' | 'inventory' | 'dues';
  data: any[];
}

export function ReportsExport({ activeSection, data }: ReportsExportProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) {
      alert('এক্সপোর্ট করার জন্য কোনো ডাটা পাওয়া যায়নি।');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Bangla character compatibility in Excel
    const filename = `BizOS-Report-${activeSection}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeSection === 'profit') {
      csvContent += 'তারিখ ও সময়,বিবরণ,বিক্রয় মূল্য,ক্রয় মূল্য,মোট লাভ,লাভের হার (%)\n';
      data.forEach((row: any) => {
        csvContent += `"${row.timestamp}","${row.description}",${row.salesAmount},${row.costPrice},${row.grossProfit},${row.marginPercentage}\n`;
      });
    } else if (activeSection === 'expense') {
      csvContent += 'তারিখ ও সময়,ব্যয়ের খাত,বিবরণ/নোট,পেমেন্ট মেথড,পরিমাণ\n';
      data.forEach((row: any) => {
        csvContent += `"${row.timestamp}","${row.category}","${row.description}","${row.paymentMode}",${row.amount}\n`;
      });
    } else if (activeSection === 'inventory') {
      csvContent += 'প্রোডাক্ট নাম,SKU,ক্রয়মূল্য,বিক্রয়মূল্য,মজুদ স্টক,স্টক মূল্য (Cost),স্টক মূল্য (Retail)\n';
      data.forEach((row: any) => {
        csvContent += `"${row.productName}","${row.sku}",${row.costPrice},${row.price},${row.stockCount},${row.stockValueCost},${row.stockValueRetail}\n`;
      });
    } else if (activeSection === 'dues') {
      csvContent += 'কাস্টমার নাম,মোবাইল নম্বর,বিবরণ,সর্বশেষ পরিশোধ তারিখ,মোট বকেয়া পরিমাণ\n';
      data.forEach((row: any) => {
        csvContent += `"${row.customerName}","${row.phone}","${row.notes || ''}","${row.lastPaymentDate || ''}",${row.dueAmount}\n`;
      });
    }

    // Download Blob trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2 print:hidden shrink-0">
      <button
        onClick={handleExportCSV}
        className="h-9 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-white"
        title="Download spreadsheet CSV file"
      >
        <Download className="h-4 w-4 text-slate-400" />
        <span>এক্সেল ডাউনলোড (CSV)</span>
      </button>

      <button
        onClick={handlePrint}
        className="h-9 px-3 bg-primary text-white hover:bg-primary/95 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Print this report sheet"
      >
        <Printer className="h-4 w-4" />
        <span>রিপোর্ট প্রিন্ট</span>
      </button>
    </div>
  );
}
