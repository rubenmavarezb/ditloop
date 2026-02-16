import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Theme mode preference. */
export type ThemeMode = 'system' | 'dark' | 'light';

/** Theme store state and actions. */
export interface ThemeState {
  /** User's theme preference. */
  mode: ThemeMode;
  /** Set theme mode. */
  setMode: (mode: ThemeMode) => void;
}

/** Zustand store for theme preference, persisted to localStorage. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'ditloop-theme' },
  ),
);
