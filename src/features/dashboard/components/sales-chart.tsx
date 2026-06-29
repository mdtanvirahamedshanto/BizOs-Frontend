import React, { useMemo } from 'react';
import { ChartDataPoint } from '../api/dashboard-api';

interface SalesChartProps {
  data: ChartDataPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Chart dimensions config
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate scaling boundaries
  const maxVal = useMemo(() => {
    const allValues = data.flatMap((d) => [d.sales, d.expenses]);
    const max = Math.max(...allValues, 1000); // fallback minimum max value
    return Math.ceil(max * 1.1); // add 10% buffer top padding
  }, [data]);

  // Compute coordinate points
  const points = useMemo(() => {
    if (data.length === 0) return { salesPoints: [], expensePoints: [] };

    const n = data.length;
    const xStep = n > 1 ? chartWidth / (n - 1) : 0;

    const salesPoints = data.map((d, i) => {
      const x = n === 1 ? paddingLeft + chartWidth / 2 : paddingLeft + i * xStep;
      const y = paddingTop + chartHeight - (d.sales / maxVal) * chartHeight;
      return { x, y, val: d.sales, label: d.label };
    });

    const expensePoints = data.map((d, i) => {
      const x = n === 1 ? paddingLeft + chartWidth / 2 : paddingLeft + i * xStep;
      const y = paddingTop + chartHeight - (d.expenses / maxVal) * chartHeight;
      return { x, y, val: d.expenses };
    });

    return { salesPoints, expensePoints };
  }, [data, chartWidth, chartHeight, maxVal]);

  const { salesPoints, expensePoints } = points;

  // Formulate SVG path strings
  const salesPathString = useMemo(() => {
    if (salesPoints.length === 0) return '';
    return salesPoints.reduce(
      (path, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`),
      ''
    );
  }, [salesPoints]);

  const salesAreaPathString = useMemo(() => {
    if (salesPoints.length === 0) return '';
    const startPoint = `M ${salesPoints[0].x} ${paddingTop + chartHeight}`;
    const curvePoints = salesPoints.reduce((path, pt) => `${path} L ${pt.x} ${pt.y}`, '');
    const endPoint = `L ${salesPoints[salesPoints.length - 1].x} ${paddingTop + chartHeight} Z`;
    return `${startPoint} ${curvePoints} ${endPoint}`;
  }, [salesPoints, chartHeight]);

  const expensePathString = useMemo(() => {
    if (expensePoints.length === 0) return '';
    return expensePoints.reduce(
      (path, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`),
      ''
    );
  }, [expensePoints]);

  // Generate grid values for Y axis (4 segments)
  const yGridLines = useMemo(() => {
    return Array.from({ length: 4 }).map((_, idx) => {
      const val = (maxVal / 3) * idx;
      const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
      return { y, val: Math.round(val) };
    });
  }, [maxVal, paddingTop, chartHeight]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">বিক্রি ও খরচের চার্ট</h3>
          <p className="text-[10px] text-slate-400 font-medium">Sales & Expense Trends</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-slate-600">বিক্রি (Sales)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="text-slate-600">খরচ (Expenses)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas wrapper */}
      <div className="w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[500px] h-auto"
          role="img"
          aria-label="বিক্রি ও খরচের ট্রেন্ড চার্ট (Sales & Expense Trends Chart)"
        >
          <title>বিক্রি ও খরচের ট্রেন্ড চার্ট (Sales & Expense Trends Chart)</title>
          <defs>
            {/* Sales gradient overlay */}
            <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y Axis labels */}
          {yGridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={svgWidth - paddingRight}
                y2={line.y}
                className="stroke-slate-100 stroke-1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                className="fill-slate-400 text-[9px] font-semibold text-right"
                textAnchor="end"
              >
                ৳{line.val >= 1000 ? `${(line.val / 1000).toFixed(1)}k` : line.val}
              </text>
            </g>
          ))}

          {/* Area Chart: Sales Gradient Fill */}
          {salesAreaPathString && (
            <path d={salesAreaPathString} fill="url(#sales-gradient)" />
          )}

          {/* Line Chart: Sales Path Stroke */}
          {salesPathString && (
            <path
              d={salesPathString}
              fill="none"
              className="stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Line Chart: Expense Path Stroke */}
          {expensePathString && (
            <path
              d={expensePathString}
              fill="none"
              className="stroke-rose-400"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          )}

          {/* Data Points Indicators (Hover/Interact dots simulation) */}
          {salesPoints.map((pt, idx) => (
            <g key={`dots-${idx}`} className="group cursor-pointer">
              {/* Sales dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-white stroke-primary"
                strokeWidth="2.5"
              />
              {/* Tooltip trigger or label indicators */}
              <text
                x={pt.x}
                y={pt.y - 10}
                className="hidden group-hover:block fill-slate-800 text-[9px] font-bold"
                textAnchor="middle"
              >
                ৳{pt.val}
              </text>
            </g>
          ))}

          {/* Bottom X-Axis Labels */}
          {salesPoints.map((pt, idx) => (
            <text
              key={`x-label-${idx}`}
              x={pt.x}
              y={svgHeight - 8}
              className="fill-slate-400 text-[9px] font-bold"
              textAnchor="middle"
            >
              {pt.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
