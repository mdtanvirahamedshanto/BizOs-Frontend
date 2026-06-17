'use client';

import React from 'react';
import {
  Activity,
  Database,
  Server,
  Cpu,
  MemoryStick,
  Store,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { usePlatformHealthQuery, usePlatformStatsQuery } from '../api/platform-api';
import type { ServiceProbe } from '@/lib/api';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${Math.floor(seconds % 60)}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

function formatTaka(cents: number): string {
  return `৳${Math.round(cents / 100).toLocaleString('en-BD')}`;
}

function ServiceRow({ label, probe, icon: Icon }: { label: string; probe?: ServiceProbe; icon: React.ComponentType<{ className?: string }> }) {
  const ok = probe?.ok;
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {probe?.latencyMs != null ? `${probe.latencyMs} ms` : probe?.error || '—'}
          </p>
        </div>
      </div>
      {ok ? (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Online
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
          <XCircle className="h-4 w-4" /> Down
        </span>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'indigo',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';
}) {
  const tones: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-800">{value}</p>
      {sub && <p className="mt-1 text-[11px] font-semibold text-slate-400">{sub}</p>}
    </div>
  );
}

/** Tiny dependency-free SVG bar chart for daily trends. */
function MiniBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${Math.max(4, (v / max) * 100)}%`, backgroundColor: color }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

export function SystemManager() {
  const health = usePlatformHealthQuery();
  const stats = usePlatformStatsQuery();

  const h = health.data;
  const s = stats.data;
  const mem = h?.system.memory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            সিস্টেম স্ট্যাটাস ও ব্যবহার (System Status &amp; Usage)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            লাইভ সার্ভার হেলথ এবং সম্পূর্ণ প্ল্যাটফর্মের পরিসংখ্যান
          </p>
        </div>
        <button
          onClick={() => {
            void health.refetch();
            void stats.refetch();
          }}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${health.isFetching || stats.isFetching ? 'animate-spin' : ''}`} />
          রিফ্রেশ
        </button>
      </div>

      {/* Overall status banner */}
      <div
        className={`rounded-2xl border p-5 ${
          h?.status === 'healthy'
            ? 'border-emerald-200 bg-emerald-50'
            : h?.status === 'degraded'
              ? 'border-rose-200 bg-rose-50'
              : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                h?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : h ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            />
            <div>
              <p className="text-sm font-black text-slate-800">
                {health.isError
                  ? 'অ্যাক্সেস নেই / সার্ভার অফলাইন'
                  : h?.status === 'healthy'
                    ? 'সব সিস্টেম স্বাভাবিক (All Systems Operational)'
                    : h
                      ? 'কিছু সার্ভিসে সমস্যা (Degraded)'
                      : 'লোড হচ্ছে...'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {h && `uptime ${formatUptime(h.uptimeSeconds)} · ${h.system.environment} · node ${h.system.nodeVersion}`}
              </p>
            </div>
          </div>
          {health.isError && (
            <span className="text-[11px] font-semibold text-rose-600">
              {(health.error as Error)?.message || 'Platform admin access required'}
            </span>
          )}
        </div>
      </div>

      {/* Service probes + process metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <ServiceRow label="PostgreSQL Database" probe={h?.services.database} icon={Database} />
          <ServiceRow label="Redis Cache / Queue" probe={h?.services.redis} icon={Server} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="CPU Cores"
            value={h ? String(h.system.cpuCount) : '—'}
            sub={h ? `load ${h.system.loadAverage[0]?.toFixed(2) ?? '0'}` : undefined}
            icon={Cpu}
            tone="sky"
          />
          <StatCard
            label="System Memory"
            value={mem ? `${mem.systemUsedPct}%` : '—'}
            sub={mem ? `${formatBytes(mem.systemTotalBytes - mem.systemFreeBytes)} / ${formatBytes(mem.systemTotalBytes)}` : undefined}
            icon={MemoryStick}
            tone="amber"
          />
          <StatCard
            label="Heap Used"
            value={mem ? formatBytes(mem.heapUsedBytes) : '—'}
            sub={mem ? `of ${formatBytes(mem.heapTotalBytes)}` : undefined}
            icon={MemoryStick}
            tone="indigo"
          />
          <StatCard
            label="Process RSS"
            value={mem ? formatBytes(mem.rssBytes) : '—'}
            sub={h ? `pid ${h.system.pid}` : undefined}
            icon={Server}
            tone="emerald"
          />
        </div>
      </div>

      {/* Platform usage stats */}
      <div>
        <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">
          প্ল্যাটফর্ম ব্যবহার (Platform Usage)
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Shops"
            value={s ? s.shops.total.toLocaleString() : '—'}
            sub={s ? `${s.shops.active} active · ${s.shops.trial} trial` : undefined}
            icon={Store}
            tone="indigo"
          />
          <StatCard
            label="Users"
            value={s ? s.users.total.toLocaleString() : '—'}
            sub={s ? `${s.users.active} active` : undefined}
            icon={Users}
            tone="sky"
          />
          <StatCard
            label="Products"
            value={s ? s.catalog.products.toLocaleString() : '—'}
            sub={s ? `${s.catalog.lowStock} low stock` : undefined}
            icon={Package}
            tone="amber"
          />
          <StatCard
            label="Sales (Completed)"
            value={s ? s.sales.completed.toLocaleString() : '—'}
            sub={s ? `${formatTaka(s.sales.revenueCents)} revenue` : undefined}
            icon={ShoppingCart}
            tone="emerald"
          />
          <StatCard
            label="New Shops (7d)"
            value={s ? `+${s.shops.newLast7Days}` : '—'}
            sub={s ? `+${s.shops.newLast30Days} in 30d` : undefined}
            icon={Store}
            tone="indigo"
          />
          <StatCard
            label="Sales (7d)"
            value={s ? s.sales.last7DaysCount.toLocaleString() : '—'}
            sub={s ? formatTaka(s.sales.last7DaysRevenueCents) : undefined}
            icon={ShoppingCart}
            tone="emerald"
          />
          <StatCard
            label="Receivables (Khata)"
            value={s ? formatTaka(s.finance.khataReceivableCents) : '—'}
            sub={s ? `payable ${formatTaka(s.finance.khataPayableCents)}` : undefined}
            icon={AlertTriangle}
            tone="rose"
          />
          <StatCard
            label="Customers / Suppliers"
            value={s ? `${s.parties.customers.toLocaleString()}` : '—'}
            sub={s ? `${s.parties.suppliers} suppliers` : undefined}
            icon={Users}
            tone="sky"
          />
        </div>
      </div>

      {/* Trends + plan distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Signups (14d)</p>
          <p className="mt-1 text-lg font-black text-slate-800">
            {s ? s.trends.signups.reduce((a, b) => a + b.count, 0) : 0}
          </p>
          <div className="mt-3">
            <MiniBars data={s?.trends.signups.map((d) => d.count) ?? []} color="#6366f1" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sales (14d)</p>
          <p className="mt-1 text-lg font-black text-slate-800">
            {s ? s.trends.sales.reduce((a, b) => a + b.count, 0) : 0}
          </p>
          <div className="mt-3">
            <MiniBars data={s?.trends.sales.map((d) => d.count) ?? []} color="#10b981" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Plan Distribution</p>
          <div className="mt-3 space-y-2">
            {s
              ? (['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map((plan) => {
                  const count = s.shops.byPlan[plan];
                  const pct = s.shops.total > 0 ? Math.round((count / s.shops.total) * 100) : 0;
                  return (
                    <div key={plan}>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>{plan}</span>
                        <span>{count}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
