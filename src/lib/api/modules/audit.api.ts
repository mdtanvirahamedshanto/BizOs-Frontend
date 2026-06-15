// =============================================================================
// BizOS API SDK — Audit Log Module
// =============================================================================

import { apiClient, buildParams } from '../client';
import { PaginatedResponse, PaginationParams } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  shopId: string;
  userId: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface AuditQueryParams extends PaginationParams {
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * List audit logs with optional filters (admin/owner access only)
 */
export async function listAuditLogs(
  params?: AuditQueryParams,
): Promise<PaginatedResponse<AuditLog>> {
  const res = await apiClient.get<PaginatedResponse<AuditLog>>('/audit', {
    params: buildParams(params as Record<string, string | number | boolean | Date | undefined | null>),
  });
  return res.data;
}
