import { create } from 'zustand';

export type UserRole = 'Owner' | 'Manager' | 'Cashier';

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  businessId?: string;
}

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: UserInfo, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  hydrateSession: () => void;
}

// Cookie helpers since standard document.cookie is client-only
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Strict; Secure`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure`;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, accessToken, refreshToken) => {
    // Write tokens to cookies so the Next.js Edge Middleware can inspect them instantly
    setCookie('bizos_token', accessToken, 1); // 1 day
    setCookie('bizos_refresh_token', refreshToken, 7); // 7 days
    setCookie('bizos_user_info', JSON.stringify(user), 7);

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    // Purge cookies
    deleteCookie('bizos_token');
    deleteCookie('bizos_refresh_token');
    deleteCookie('bizos_user_info');

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setAccessToken: (token) => {
    setCookie('bizos_token', token, 1);
    set({ accessToken: token });
  },

  hydrateSession: () => {
    if (typeof window === 'undefined') return;

    try {
      const token = getCookie('bizos_token');
      const userInfoStr = getCookie('bizos_user_info');
      
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
