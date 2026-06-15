'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/use-auth';
import { useNotificationStore } from '@/stores/use-notifications';
import { realtimeSocketManager } from '@/lib/realtime/socket-manager';
import { invalidateQueriesForDashboardRefresh } from '@/lib/realtime/invalidation-map';

/**
 * Connects Socket.IO namespaces after authentication and wires live invalidations.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      realtimeSocketManager.disconnect();
      return;
    }

    realtimeSocketManager.connect(accessToken);

    const unsubDashboard = realtimeSocketManager.onDashboardRefresh(({ source, entityId }) => {
      invalidateQueriesForDashboardRefresh(queryClient, source, entityId);
    });

    const unsubNotifications = realtimeSocketManager.onNotification((notification) => {
      addNotification(notification);

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192.svg',
        });
      }
    });

    return () => {
      unsubDashboard();
      unsubNotifications();
      realtimeSocketManager.disconnect();
    };
  }, [isAuthenticated, accessToken, queryClient, addNotification]);

  return <>{children}</>;
}
