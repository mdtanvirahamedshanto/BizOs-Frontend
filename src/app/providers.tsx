'use client';

import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/components/auth/auth-provider';
import { RealtimeProvider } from '@/components/realtime/realtime-provider';
import { useSyncManager } from '@/features/pwa/hooks/use-sync-manager';
import { OfflineBanner } from '@/features/pwa/components/offline-banner';
import { InstallPrompt } from '@/features/pwa/components/install-prompt';
import { useAuthStore } from '@/stores/use-auth';
import { syncReferenceDataToIndexedDb } from '@/lib/offline/cache-sync';

interface ProvidersProps {
  children: React.ReactNode;
}

function PwaInitializer() {
  useSyncManager();
  return null;
}

function OfflineCacheInitializer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !navigator.onLine) return;
    void syncReferenceDataToIndexedDb();
  }, [isAuthenticated]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((err) => {
            console.error('[PWA] ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <PwaInitializer />
          <OfflineCacheInitializer />
          {children}
          <OfflineBanner />
          <InstallPrompt />
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
