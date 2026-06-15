import { create } from 'zustand';
import type { RealtimeNotification } from '@/lib/realtime/types';

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  items: RealtimeNotification[];
  addNotification: (notification: RealtimeNotification) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],

  addNotification: (notification) => {
    set((state) => {
      const exists = state.items.some((n) => n.id === notification.id);
      if (exists) return state;
      const items = [notification, ...state.items].slice(0, MAX_NOTIFICATIONS);
      return { items };
    });
  },

  markAllRead: () => {
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    }));
  },

  markRead: (id) => {
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  clearAll: () => set({ items: [] }),

  unreadCount: () => get().items.filter((n) => !n.read).length,
}));
