'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { usePwaStore } from '../stores/use-pwa-store';
import { processOutboxQueue, registerBackgroundSync } from '@/lib/offline/sync-engine';
import { syncReferenceDataToIndexedDb } from '@/lib/offline/cache-sync';
import { useNotificationStore } from '@/stores/use-notifications';

export function useSyncManager() {
  const queryClient = useQueryClient();
  const { setOnline, updateOutboxCount } = usePwaStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const processSyncQueue = useCallback(async () => {
    if (!db || isSyncingRef.current || !navigator.onLine) return;

    isSyncingRef.current = true;

    try {
      const { synced, failed } = await processOutboxQueue();
      await updateOutboxCount();

      if (synced > 0) {
        await syncReferenceDataToIndexedDb();
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        queryClient.invalidateQueries({ queryKey: ['sales'] });

        addNotification({
          id: `sync-${Date.now()}`,
          type: 'sync.completed',
          title: 'অফলাইন সিঙ্ক সম্পন্ন',
          body: `${synced}টি অফলাইন লেনদেন সার্ভারে আপলোড হয়েছে।`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }

      if (failed > 0) {
        console.warn(`[PWA Sync] ${failed} transaction(s) could not be synced.`);
      }
    } catch (e) {
      console.error('[PWA Sync] Sync loop error:', e);
    } finally {
      isSyncingRef.current = false;
    }
  }, [queryClient, updateOutboxCount, addNotification]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setOnline(true);
      registerBackgroundSync();
      processSyncQueue();
      void syncReferenceDataToIndexedDb();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OUTBOX') {
        processSyncQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    updateOutboxCount();
    if (navigator.onLine) {
      registerBackgroundSync();
      processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
    };
  }, [setOnline, processSyncQueue, updateOutboxCount]);

  return { processSyncQueue };
}
