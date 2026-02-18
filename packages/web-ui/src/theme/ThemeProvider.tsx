import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { themes, DEFAULT_THEME, type ThemeId, type ThemeDefinition } from './themes.js';
import type { ThemeTokens } from './tokens.js';

/** Theme context value exposed to consumers. */
export interface ThemeContextValue {
  /** Current active theme ID. */
  themeId: ThemeId;
  /** Current theme definition with all tokens. */
  theme: ThemeDefinition;
  /** Switch to a different theme. */
  setTheme: (id: ThemeId) => void;
  /** List of all available theme IDs. */
  availableThemes: ThemeId[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ditloop-theme';

/**
 * Read persisted theme from localStorage.
 *
 * @returns The stored ThemeId or the default theme
 */
function getPersistedTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in themes) {
      return stored as ThemeId;
    }
  } catch {
    // localStorage unavailable (SSR, privacy mode)
  }
  return DEFAULT_THEME;
}

/**
 * Apply theme tokens as CSS custom properties on the document root.
 *
 * @param tokens - Token map to apply
 */
function applyTokensToDOM(tokens: ThemeTokens): void {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(tokens)) {
    root.style.setProperty(prop, value);
  }
}

/** Props for the ThemeProvider component. */
interface ThemeProviderProps {
  children: ReactNode;
  /** Override the initial theme (otherwise reads from localStorage). */
  initialTheme?: ThemeId;
}

/**
 * Provides theme context and applies CSS custom properties to the document root.
 * Wrap your app with this to enable theming.
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [themeId, setThemeIdState] = useThemeState(initialTheme ?? getPersistedTheme());

  const theme = themes[themeId];

  // Apply tokens to DOM whenever theme changes
  useEffect(() => {
    applyTokensToDOM(theme.tokens);
    // Also set a data attribute for Tailwind-like conditional styling
    document.documentElement.dataset.theme = themeId;
  }, [theme, themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage unavailable
    }
  }, [setThemeIdState]);

  const availableThemes = useMemo(() => Object.keys(themes) as ThemeId[], []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, theme, setTheme, availableThemes }),
    [themeId, theme, setTheme, availableThemes],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Access the current theme context.
 *
 * @throws Error if used outside of ThemeProvider
 * @returns Theme context with current theme and setter
 */
export function useDitloopTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useDitloopTheme must be used within a ThemeProvider');
  }
  return ctx;
}

/** Simple state hook for theme ID. Separate to keep ThemeProvider clean. */
function useThemeState(initial: ThemeId): [ThemeId, (id: ThemeId) => void] {
  const [state, setState] = useState<ThemeId>(initial);
  return [state, setState];
}

// Re-export useState since we need it above
import { useState } from 'react';
