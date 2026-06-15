'use client';

import { create } from 'zustand';
import { db } from '@/lib/db';

interface PwaState {
  online: boolean;
  installPromptEvent: any | null;
  isInstalled: boolean;
  outboxCount: number;
  setOnline: (status: boolean) => void;
  setInstallPromptEvent: (event: any) => void;
  setIsInstalled: (status: boolean) => void;
  updateOutboxCount: () => Promise<void>;
}

export const usePwaStore = create<PwaState>((set) => ({
  online: typeof window !== 'undefined' ? navigator.onLine : true,
  installPromptEvent: null,
  isInstalled: false,
  outboxCount: 0,
  
  setOnline: (status) => set({ online: status }),
  setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
  setIsInstalled: (status) => set({ isInstalled: status }),
  
  updateOutboxCount: async () => {
    if (db) {
      const count = await db.outbox.count();
      set({ outboxCount: count });
    }
  }
}));
