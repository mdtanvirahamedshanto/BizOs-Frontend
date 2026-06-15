'use client';

import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useSyncManager } from '@/features/pwa/hooks/use-sync-manager';
import { OfflineBanner } from '@/features/pwa/components/offline-banner';
import { InstallPrompt } from '@/features/pwa/components/install-prompt';

interface ProvidersProps {
  children: React.ReactNode;
}

function PwaInitializer() {
  // Listen and sync outbox tasks when connection becomes online
  useSyncManager();
  return null;
}

export function Providers({ children }: ProvidersProps) {
  // Register the PWA service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
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
      <PwaInitializer />
      {children}
      <OfflineBanner />
      <InstallPrompt />
    </QueryClientProvider>
  );
}
