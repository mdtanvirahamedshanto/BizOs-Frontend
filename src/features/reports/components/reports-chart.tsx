'use client';

import React from 'react';

interface ReportsChartProps {
  data: { label: string; sales: number; cost: number; expense: number }[];
}

export function ReportsChart({ data }: ReportsChartProps) {
  // Chart dimensions config
  const width = 500;
  const height = 200;
  const padding = 35;

  const maxVal = Math.max(...data.map((d) => Math.max(d.sales, d.cost, d.expense)), 1000);

  // SVG Area path generation helpers
  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (data.length - 1);
  const getY = (val: number) => height - padding - (val * (height - 2 * padding)) / maxVal;

  const salesPoints = data.map((d, i) => `${getX(i)},${getY(d.sales)}`).join(' ');
  const expensePoints = data.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');

  const salesAreaPoints = `${padding},${height - padding} ${salesPoints} ${width - padding},${height - padding}`;
  const expenseAreaPoints = `${padding},${height - padding} ${expensePoints} ${width - padding},${height - padding}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
      {/* 1. Sales & Expense Area Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800">বিক্রয় বনাম খরচ (Sales vs Expenses)</h4>
          <p className="text-[9px] text-slate-400 font-medium">Daily Area Analysis</p>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] overflow-visible">
            {/* Grid Lines */}
            {Array.from({ length: 5 }).map((_, idx) => {
              const yVal = getY((maxVal / 4) * idx);
              return (
                <g key={idx}>
                  <line
                    x1={padding}
                    y1={yVal}
                    x2={width - padding}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 6}
                    y={yVal + 3}
                    textAnchor="end"
                    className="fill-slate-400 font-sans font-semibold text-[8px]"
                  >
                    {Math.round((maxVal / 4) * idx)}
                  </text>
                </g>
              );
            })}

            {/* Area gradients fill */}
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Fills */}
            <polygon points={salesAreaPoints} fill="url(#salesGrad)" />
            <polygon points={expenseAreaPoints} fill="url(#expenseGrad)" />

            {/* Lines */}
            <polyline points={salesPoints} fill="none" stroke="#6366f1" strokeWidth="2" />
            <polyline points={expensePoints} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />

            {/* Point dots */}
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={getX(i)} cy={getY(d.sales)} r="3.5" className="fill-white stroke-primary stroke-[1.5]" />
                <circle cx={getX(i)} cy={getY(d.expense)} r="3.5" className="fill-white stroke-rose-500 stroke-[1.5]" />
                <text
                  x={getX(i)}
                  y={height - padding + 12}
                  textAnchor="middle"
                  className="fill-slate-400 font-bold text-[8px]"
                >
                  {d.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            <span>বিক্রয় (Sales)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
            <span>খরচ (Expenses)</span>
          </div>
        </div>
      </div>

      {/* 2. Sales vs Cost of Goods Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800">বিক্রয় বনাম ক্রয়মূল্য (Sales vs Cost)</h4>
          <p className="text-[9px] text-slate-400 font-medium">Daily Bar Comparisons</p>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] overflow-visible">
            {/* Grid Lines */}
            {Array.from({ length: 5 }).map((_, idx) => {
              const yVal = getY((maxVal / 4) * idx);
              return (
                <g key={idx}>
                  <line
                    x1={padding}
                    y1={yVal}
                    x2={width - padding}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 6}
                    y={yVal + 3}
                    textAnchor="end"
                    className="fill-slate-400 font-sans font-semibold text-[8px]"
                  >
                    {Math.round((maxVal / 4) * idx)}
                  </text>
                </g>
              );
            })}

            {/* Render Bars */}
            {data.map((d, i) => {
              const barWidth = 12;
              const gap = 3;
              const xCenter = getX(i);
              
              const xSales = xCenter - barWidth - gap/2;
              const xCost = xCenter + gap/2;

              const ySales = getY(d.sales);
              const yCost = getY(d.cost);

              const hSales = height - padding - ySales;
              const hCost = height - padding - yCost;

              return (
                <g key={i}>
                  {/* Sales bar */}
                  <rect
                    x={xSales}
                    y={ySales}
                    width={barWidth}
                    height={Math.max(2, hSales)}
                    rx="2"
                    className="fill-primary"
                  />
                  {/* Cost price bar */}
                  <rect
                    x={xCost}
                    y={yCost}
                    width={barWidth}
                    height={Math.max(2, hCost)}
                    rx="2"
                    className="fill-amber-500"
                  />
                  {/* Axis Label */}
                  <text
                    x={xCenter}
                    y={height - padding + 12}
                    textAnchor="middle"
                    className="fill-slate-400 font-bold text-[8px]"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            <span>বিক্রয়মূল্য (Sales Price)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span>ক্রয়মূল্য (COGS Cost)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
