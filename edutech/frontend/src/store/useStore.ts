import { create } from 'zustand';
import { getToken, setToken, removeToken, authApi } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin';
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  subscription: 'free' | 'pro' | 'premium';
  phone?: string;
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  darkMode: boolean;
  sidebarOpen: boolean;
  loading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  initializeAuth: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoggedIn: false,
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('app_darkMode') !== 'false' : true,
  sidebarOpen: true,
  loading: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false,
  login: (user, token) => {
    if (token) {
      setToken(token);
    }
    set({ user, isLoggedIn: true });
  },
  logout: () => {
    removeToken();
    set({ user: null, isLoggedIn: false });
  },
  setUser: (user) => set({ user }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  addXP: (amount) =>
    set((s) => {
      if (!s.user) return s;
      const newXP = s.user.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return { user: { ...s.user, xp: newXP, level: newLevel } };
    }),
  incrementStreak: () =>
    set((s) => {
      if (!s.user) return s;
      return { user: { ...s.user, streak: s.user.streak + 1 } };
    }),
  initializeAuth: async () => {
    const token = getToken();
    if (!token) return;
    set({ loading: true });
    try {
      const profile = await authApi.getMe();
      set({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar: profile.avatar,
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
          badges: profile.badges || [],
          subscription: (profile.subscription as 'free' | 'pro' | 'premium') || 'free',
          phone: profile.phone || '',
        },
        isLoggedIn: true,
        loading: false,
      });
    } catch {
      removeToken();
      set({ user: null, isLoggedIn: false, loading: false });
    }
  },
}));
