import type { OutboxTransaction } from '@/lib/db';

export type ConflictResolution = 'retry' | 'drop' | 'fail';

/**
 * Resolves sync conflicts using last-write-wins with server authority on HTTP 409.
 */
export function resolveSyncConflict(
  txn: OutboxTransaction,
  error: { status?: number; message?: string },
): ConflictResolution {
  if (error.status === 409) {
    // Server already has a newer version — drop duplicate offline write
    return 'drop';
  }

  if (txn.retryCount >= 5) {
    return 'fail';
  }

  return 'retry';
}

export function mergeEntityVersions(
  localUpdatedAt: number,
  serverUpdatedAt: number,
): 'local' | 'server' {
  return serverUpdatedAt >= localUpdatedAt ? 'server' : 'local';
}
