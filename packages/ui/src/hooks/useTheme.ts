import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider.js';
import type { ThemeColors } from '../theme/colors.js';

/**
 * Consume the current theme colors from the nearest ThemeProvider.
 *
 * @returns The current theme color tokens
 */
export function useTheme(): ThemeColors {
  return useContext(ThemeContext);
}
