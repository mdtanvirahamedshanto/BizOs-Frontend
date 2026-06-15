import { create } from 'zustand';

type AppTheme = 'light' | 'dark' | 'system';

interface UiState {
  sidebarOpen: boolean;
  theme: AppTheme;
  activeModalId: string | null;
  modalMetadata: Record<string, any> | null;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: AppTheme) => void;
  openModal: (modalId: string, metadata?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  theme: 'light',
  activeModalId: null,
  modalMetadata: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }
    set({ theme });
  },

  openModal: (modalId, metadata = {}) => set({ activeModalId: modalId, modalMetadata: metadata }),
  
  closeModal: () => set({ activeModalId: null, modalMetadata: null }),
}));
