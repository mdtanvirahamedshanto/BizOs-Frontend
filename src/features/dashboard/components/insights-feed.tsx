import React from 'react';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { BusinessInsight } from '../api/dashboard-api';

interface InsightsFeedProps {
  insights: BusinessInsight[];
}

export function InsightsFeed({ insights }: InsightsFeedProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">ব্যবসার প্রয়োজনীয় টিপস ও অ্যালার্ট</h3>
        <p className="text-[10px] text-slate-400 font-medium">BizOS Automated Smart Insights</p>
      </div>

      <div className="space-y-3">
        {insights.map((ins) => {
          // Determine icon & colors based on type
          const isAlert = ins.type === 'alert';
          const isSuccess = ins.type === 'success';
          
          return (
            <div 
              key={ins.id} 
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:bg-slate-50/50 ${
                isAlert 
                  ? 'bg-red-50/50 border-red-100 text-slate-700' 
                  : isSuccess 
                  ? 'bg-emerald-50/50 border-emerald-100 text-slate-700'
                  : 'bg-indigo-50/50 border-indigo-100 text-slate-700'
              }`}
            >
              <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${
                isAlert 
                  ? 'bg-red-100 border-red-200 text-red-600' 
                  : isSuccess 
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                  : 'bg-indigo-100 border-indigo-200 text-indigo-600'
              }`}>
                {isAlert ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : isSuccess ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 leading-tight mb-0.5">
                  {ins.banglaText}
                </p>
                <p className="text-[9px] text-slate-400 font-medium leading-none">
                  {ins.englishText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
