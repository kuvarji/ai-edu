import { create } from 'zustand';

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
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  darkMode: boolean;
  sidebarOpen: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoggedIn: false,
  darkMode: true,
  sidebarOpen: true,
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
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
}));
