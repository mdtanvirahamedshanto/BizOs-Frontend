import { tokenStore } from '@/lib/api/client';
import {
  type DashboardRefreshPayload,
  type RealtimeNotification,
} from './types';

type NotificationHandler = (notification: RealtimeNotification) => void;
type DashboardRefreshHandler = (payload: DashboardRefreshPayload) => void;

class RealtimeSocketManager {
  private notificationHandlers = new Set<NotificationHandler>();
  private dashboardHandlers = new Set<DashboardRefreshHandler>();

  connect(accessToken: string): void {
    // Socket notifications removed
  }

  disconnect(): void {
    // Socket notifications removed
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
    return false;
  }

  refreshToken(): void {
    // No-op
  }
}

export const realtimeSocketManager = new RealtimeSocketManager();
