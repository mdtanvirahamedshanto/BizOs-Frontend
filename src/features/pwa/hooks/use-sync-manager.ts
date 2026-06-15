'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { apiClient } from '@/lib/api-client';
import { usePwaStore } from '../stores/use-pwa-store';

export function useSyncManager() {
  const queryClient = useQueryClient();
  const { online, setOnline, updateOutboxCount } = usePwaStore();
  const isSyncingRef = useRef(false);

  // Ask for browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.svg'
      });
    }
  };

  const processSyncQueue = useCallback(async () => {
    if (!db || isSyncingRef.current || !navigator.onLine) return;
    
    isSyncingRef.current = true;
    console.log('[PWA Sync] Started processing offline outbox queue.');

    try {
      // Find all pending/failed outbox transactions
      const transactions = await db.outbox
        .where('status')
        .anyOf(['pending', 'failed'])
        .toArray();

      if (transactions.length === 0) {
        isSyncingRef.current = false;
        return;
      }

      console.log(`[PWA Sync] Found ${transactions.length} transactions to process.`);

      for (const txn of transactions) {
        await db.outbox.update(txn.id, { status: 'processing' });
        
        try {
          // Process based on transaction types
          if (txn.type === 'sale_create') {
            await apiClient.post('/pos/checkout', txn.payload);
          } else if (txn.type === 'stock_adjustment') {
            await apiClient.post('/inventory/adjustments', txn.payload);
          } else if (txn.type === 'ledger_create') {
            await apiClient.post('/ledger/settlements', txn.payload);
          }

          // Delete from IndexedDB on successful upload
          await db.outbox.delete(txn.id);
          console.log(`[PWA Sync] Transaction ${txn.id} synced and cleared.`);
        } catch (error: any) {
          console.error(`[PWA Sync] Failed to sync transaction ${txn.id}:`, error);
          await db.outbox.update(txn.id, {
            status: 'failed',
            retryCount: txn.retryCount + 1,
            lastError: error.message || 'Network Sync Error'
          });
        }
        
        // Refresh local count state
        await updateOutboxCount();
      }

      // Invalidate target caches to pull latest online summaries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });

      sendBrowserNotification(
        'BizOS সিঙ্ক সফল',
        `আপনার অফলাইন কেনাবেচা ও ট্রানজেকশন সফলভাবে ক্লাউডে আপলোড করা হয়েছে।`
      );
    } catch (e) {
      console.error('[PWA Sync] Sync loop error:', e);
    } finally {
      isSyncingRef.current = false;
    }
  }, [queryClient, updateOutboxCount]);

  // Bind online/offline browser state listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('[PWA Status] Browser is ONLINE.');
      setOnline(true);
      processSyncQueue();
    };

    const handleOffline = () => {
      console.log('[PWA Status] Browser is OFFLINE.');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial verification check
    updateOutboxCount();
    if (navigator.onLine) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, processSyncQueue, updateOutboxCount]);

  return { processSyncQueue };
}
