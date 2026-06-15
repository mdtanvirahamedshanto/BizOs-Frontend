export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

export interface DashboardRefreshPayload {
  source: string;
  entityId?: string;
  timestamp: string;
}

export const DASHBOARD_SOCKET_NAMESPACE = '/dashboard';
export const NOTIFICATIONS_SOCKET_NAMESPACE = '/notifications';
