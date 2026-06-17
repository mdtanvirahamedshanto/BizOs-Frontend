import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/lib/api';
import type {
  PlatformHealth,
  PlatformStats,
  BackupFileInfo,
  BackupCreateResult,
} from '@/lib/api';

const KEYS = {
  health: ['platform', 'health'] as const,
  stats: ['platform', 'stats'] as const,
  backups: ['platform', 'backups'] as const,
};

/** Live system health (DB/Redis/process). Polls every 5s. */
export function usePlatformHealthQuery() {
  return useQuery<PlatformHealth>({
    queryKey: KEYS.health,
    queryFn: () => platform.getHealth(),
    refetchInterval: 5000,
    retry: 1,
  });
}

/** Platform-wide usage statistics across all shops. */
export function usePlatformStatsQuery() {
  return useQuery<PlatformStats>({
    queryKey: KEYS.stats,
    queryFn: () => platform.getStats(),
    refetchInterval: 30000,
    retry: 1,
  });
}

/** List of database backup files. */
export function useBackupsQuery() {
  return useQuery<BackupFileInfo[]>({
    queryKey: KEYS.backups,
    queryFn: () => platform.listBackups(),
    retry: 1,
  });
}

/** Trigger a new database backup. */
export function useCreateBackupMutation() {
  const qc = useQueryClient();
  return useMutation<BackupCreateResult, Error, void>({
    mutationFn: () => platform.createBackup(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.backups });
    },
  });
}

/** Delete a backup file. */
export function useDeleteBackupMutation() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) => platform.deleteBackup(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.backups });
    },
  });
}

/** Download a backup file to the browser. */
export async function downloadBackupFile(name: string): Promise<void> {
  const blob = await platform.downloadBackup(name);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
