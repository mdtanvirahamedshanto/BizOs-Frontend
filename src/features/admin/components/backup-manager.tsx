'use client';

import React, { useState } from 'react';
import {
  Database,
  DownloadCloud,
  Trash2,
  Plus,
  HardDriveDownload,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useBackupsQuery,
  useCreateBackupMutation,
  useDeleteBackupMutation,
  downloadBackupFile,
} from '../api/platform-api';

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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BackupManager() {
  const backups = useBackupsQuery();
  const createBackup = useCreateBackupMutation();
  const deleteBackup = useDeleteBackupMutation();

  const [downloading, setDownloading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreate = async () => {
    setFeedback(null);
    try {
      const result = await createBackup.mutateAsync();
      setFeedback({
        type: 'success',
        message: `ব্যাকআপ সম্পন্ন: ${result.name} (${formatBytes(result.sizeBytes)}, ${(result.durationMs / 1000).toFixed(1)}s)`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error)?.message || 'ব্যাকআপ ব্যর্থ হয়েছে।' });
    }
  };

  const handleDownload = async (name: string) => {
    setDownloading(name);
    setFeedback(null);
    try {
      await downloadBackupFile(name);
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error)?.message || 'ডাউনলোড ব্যর্থ হয়েছে।' });
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`এই ব্যাকআপ ফাইলটি স্থায়ীভাবে মুছে ফেলবেন?\n\n${name}`)) return;
    setFeedback(null);
    try {
      await deleteBackup.mutateAsync(name);
      setFeedback({ type: 'success', message: 'ব্যাকআপ মুছে ফেলা হয়েছে।' });
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error)?.message || 'মুছে ফেলা ব্যর্থ হয়েছে।' });
    }
  };

  const list = backups.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            ডাটাবেস ব্যাকআপ (Database Backup)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            সম্পূর্ণ PostgreSQL ডাটাবেসের নিরাপদ ব্যাকআপ তৈরি, ডাউনলোড ও পরিচালনা
          </p>
        </div>
        <button
          onClick={() => void handleCreate()}
          disabled={createBackup.isPending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {createBackup.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              ব্যাকআপ চলছে...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              নতুন ব্যাকআপ নিন
            </>
          )}
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <ShieldCheck className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <HardDriveDownload className="h-5 w-5 shrink-0 text-slate-400" />
          <div className="text-[11px] leading-relaxed text-slate-500">
            <p className="font-bold text-slate-600">ব্যাকআপ সম্পর্কে</p>
            <p>
              প্রতিটি ব্যাকআপ <span className="font-mono">pg_dump</span> দিয়ে সম্পূর্ণ ডাটাবেসের একটি SQL স্ন্যাপশট তৈরি করে
              সার্ভারে সংরক্ষণ করে। পুরোনো ব্যাকআপ স্বয়ংক্রিয়ভাবে রিটেনশন লিমিট অনুযায়ী মুছে যায়। গুরুত্বপূর্ণ ব্যাকআপ
              নিরাপদ স্থানে ডাউনলোড করে রাখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Backup list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            সংরক্ষিত ব্যাকআপ ({list.length})
          </span>
        </div>

        {backups.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : backups.isError ? (
          <div className="p-10 text-center text-xs font-semibold text-rose-600">
            {(backups.error as Error)?.message || 'ব্যাকআপ লোড করা যায়নি। প্ল্যাটফর্ম অ্যাডমিন অ্যাক্সেস প্রয়োজন।'}
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            এখনো কোনো ব্যাকআপ নেই। &quot;নতুন ব্যাকআপ নিন&quot; চাপুন।
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((b) => (
              <li key={b.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-bold text-slate-700">{b.name}</p>
                    <p className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(b.createdAt)} · {formatBytes(b.sizeBytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleDownload(b.name)}
                    disabled={downloading === b.name}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {downloading === b.name ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <DownloadCloud className="h-3.5 w-3.5" />
                    )}
                    ডাউনলোড
                  </button>
                  <button
                    onClick={() => void handleDelete(b.name)}
                    disabled={deleteBackup.isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    মুছুন
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
