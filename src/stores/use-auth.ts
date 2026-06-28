import { create } from 'zustand';
import { AUTH_COOKIES, deleteAuthCookie, getAuthCookie, setAuthCookie } from '@/lib/auth/cookies';

export type UserRole = 'SuperAdmin' | 'Owner' | 'Manager' | 'Cashier';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId: string;
  permissions: string[];
}

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  establishSession: (user: UserInfo, accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  hydrateSession: () => void;
}

function persistUserCookie(user: UserInfo) {
  setAuthCookie(AUTH_COOKIES.userInfo, JSON.stringify(user), 7);
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  establishSession: (user, accessToken, refreshToken) => {
    setAuthCookie(AUTH_COOKIES.accessToken, accessToken, 1);
    setAuthCookie(AUTH_COOKIES.refreshToken, refreshToken, 7);
    persistUserCookie(user);

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => {
    persistUserCookie(user);
    set({ user });
  },

  logout: () => {
    deleteAuthCookie(AUTH_COOKIES.accessToken);
    deleteAuthCookie(AUTH_COOKIES.refreshToken);
    deleteAuthCookie(AUTH_COOKIES.userInfo);

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setAccessToken: (token) => {
    setAuthCookie(AUTH_COOKIES.accessToken, token, 1);
    set({ accessToken: token });
  },

  hydrateSession: () => {
    if (typeof window === 'undefined') return;

    try {
      const token = getAuthCookie(AUTH_COOKIES.accessToken);
      const userInfoStr = getAuthCookie(AUTH_COOKIES.userInfo);

      if (token && userInfoStr) {
        const user = JSON.parse(userInfoStr) as UserInfo;
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
