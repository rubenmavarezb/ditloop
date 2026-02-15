import { createContext } from 'react';
import type { ReactNode } from 'react';
import { defaultColors } from './colors.js';
import type { ThemeColors } from './colors.js';

/** React context holding the current theme colors. */
export const ThemeContext = createContext<ThemeColors>(defaultColors);

/** Props for ThemeProvider. */
export interface ThemeProviderProps {
  /** Optional custom color overrides. Merges with defaultColors. */
  colors?: Partial<ThemeColors>;
  children: ReactNode;
}

/**
 * Provides theme colors to all descendant components via React context.
 *
 * @param props - Theme provider props with optional color overrides
 */
export function ThemeProvider({ colors, children }: ThemeProviderProps) {
  const merged = colors ? { ...defaultColors, ...colors } : defaultColors;
  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
}
