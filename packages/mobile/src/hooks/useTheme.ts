import { useEffect } from 'react';
import { useThemeStore } from '../store/theme.js';

/**
 * Sync the theme mode to the document's class list.
 * Applies "dark" class to <html> based on user preference or system setting.
 */
export function useTheme(): void {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const isDark = mode === 'dark' || (mode === 'system' && mq.matches);
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);

      // Update theme-color meta tag
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', isDark ? '#0f172a' : '#f8fafc');
      }
    };

    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);
}
