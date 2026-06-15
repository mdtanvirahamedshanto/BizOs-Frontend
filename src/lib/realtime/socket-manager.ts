import { io, type Socket } from 'socket.io-client';
import { tokenStore } from '@/lib/api/client';
import {
  DASHBOARD_SOCKET_NAMESPACE,
  NOTIFICATIONS_SOCKET_NAMESPACE,
  type DashboardRefreshPayload,
  type RealtimeNotification,
} from './types';

function resolveSocketBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, '');
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

type NotificationHandler = (notification: RealtimeNotification) => void;
type DashboardRefreshHandler = (payload: DashboardRefreshPayload) => void;

class RealtimeSocketManager {
  private dashboardSocket: Socket | null = null;
  private notificationsSocket: Socket | null = null;
  private notificationHandlers = new Set<NotificationHandler>();
  private dashboardHandlers = new Set<DashboardRefreshHandler>();

  connect(accessToken: string): void {
    if (typeof window === 'undefined' || !accessToken) return;

    this.disconnect();

    const baseUrl = resolveSocketBaseUrl();
    const options = {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      timeout: 20000,
    };

    this.dashboardSocket = io(`${baseUrl}${DASHBOARD_SOCKET_NAMESPACE}`, options);
    this.notificationsSocket = io(`${baseUrl}${NOTIFICATIONS_SOCKET_NAMESPACE}`, options);

    this.dashboardSocket.on('dashboard:refresh', (payload: DashboardRefreshPayload) => {
      for (const handler of this.dashboardHandlers) {
        handler(payload);
      }
    });

    this.notificationsSocket.on(
      'notification:new',
      (payload: Omit<RealtimeNotification, 'id' | 'read'>) => {
        const notification: RealtimeNotification = {
          ...payload,
          id: `${payload.type}-${payload.timestamp}`,
          read: false,
        };
        for (const handler of this.notificationHandlers) {
          handler(notification);
        }
      },
    );
  }

  disconnect(): void {
    this.dashboardSocket?.removeAllListeners();
    this.dashboardSocket?.disconnect();
    this.dashboardSocket = null;

    this.notificationsSocket?.removeAllListeners();
    this.notificationsSocket?.disconnect();
    this.notificationsSocket = null;
  }

  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  onDashboardRefresh(handler: DashboardRefreshHandler): () => void {
    this.dashboardHandlers.add(handler);
    return () => this.dashboardHandlers.delete(handler);
  }

  isConnected(): boolean {
    return Boolean(this.dashboardSocket?.connected && this.notificationsSocket?.connected);
  }

  refreshToken(): void {
    const token = tokenStore.getAccessToken();
    if (!token) {
      this.disconnect();
      return;
    }
    if (!this.isConnected()) {
      this.connect(token);
    }
  }
}

export const realtimeSocketManager = new RealtimeSocketManager();
