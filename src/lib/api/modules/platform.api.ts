// =============================================================================
// BizOS API SDK — Platform (Super-Admin) Module
// Cross-tenant control plane: system health, usage stats, database backups.
// All endpoints require platform-admin access (enforced server-side).
// =============================================================================

import { apiClient } from '../client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ServiceProbe {
  ok: boolean;
  latencyMs: number | null;
  error?: string;
}

export interface PlatformHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: ServiceProbe;
    redis: ServiceProbe;
  };
  system: {
    environment: string;
    nodeVersion: string;
    platform: string;
    pid: number;
    cpuCount: number;
    loadAverage: number[];
    memory: {
      rssBytes: number;
      heapUsedBytes: number;
      heapTotalBytes: number;
      systemTotalBytes: number;
      systemFreeBytes: number;
      systemUsedPct: number;
    };
  };
}

export interface PlatformStats {
  generatedAt: string;
  shops: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    cancelled: number;
    newLast7Days: number;
    newLast30Days: number;
    byPlan: { FREE: number; STARTER: number; PROFESSIONAL: number; ENTERPRISE: number };
  };
  users: { total: number; active: number };
  catalog: { products: number; lowStock: number };
  parties: { customers: number; suppliers: number };
  sales: {
    total: number;
    completed: number;
    revenueCents: number;
    last7DaysCount: number;
    last7DaysRevenueCents: number;
  };
  purchases: { total: number; totalCents: number };
  finance: { expensesCents: number; khataReceivableCents: number; khataPayableCents: number };
  trends: {
    signups: Array<{ day: string; count: number }>;
    sales: Array<{ day: string; count: number; revenueCents: number }>;
  };
}

export interface BackupFileInfo {
  name: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BackupCreateResult extends BackupFileInfo {
  durationMs: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** System health: DB/Redis probes + process/host metrics. */
export async function getHealth(): Promise<PlatformHealth> {
  const res = await apiClient.get<PlatformHealth>('/platform/health');
  return res.data;
}

/** Platform-wide usage statistics across all shops. */
export async function getStats(): Promise<PlatformStats> {
  const res = await apiClient.get<PlatformStats>('/platform/stats');
  return res.data;
}

/** List existing database backup files (newest first). */
export async function listBackups(): Promise<BackupFileInfo[]> {
  const res = await apiClient.get<BackupFileInfo[]>('/platform/backups');
  return res.data;
}

/** Trigger a new PostgreSQL backup (pg_dump). */
export async function createBackup(): Promise<BackupCreateResult> {
  const res = await apiClient.post<BackupCreateResult>('/platform/backups', {});
  return res.data;
}

/** Delete a backup file by name. */
export async function deleteBackup(name: string): Promise<void> {
  await apiClient.delete(`/platform/backups/${encodeURIComponent(name)}`);
}

/** Download a backup file as a Blob (for browser save). */
export async function downloadBackup(name: string): Promise<Blob> {
  const res = await apiClient.get(`/platform/backups/${encodeURIComponent(name)}/download`, {
    responseType: 'blob',
  });
  return res.data as unknown as Blob;
}
