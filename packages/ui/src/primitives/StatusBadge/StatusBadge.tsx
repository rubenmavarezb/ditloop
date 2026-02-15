import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';
import type { ThemeColors } from '../../theme/colors.js';

/** Available status variants for the badge. */
export type StatusVariant = 'active' | 'warning' | 'error' | 'idle';

/** Props for the StatusBadge component. */
export interface StatusBadgeProps {
  /** Status variant controlling the dot color. */
  variant: StatusVariant;
  /** Label text displayed next to the dot. */
  label: string;
}

const variantToColor: Record<StatusVariant, keyof ThemeColors> = {
  active: 'active',
  warning: 'warning',
  error: 'error',
  idle: 'idle',
};

/**
 * Colored dot indicator with a text label.
 *
 * @param props - Badge configuration with variant and label
 */
export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const theme = useTheme();
  const color = theme[variantToColor[variant]];

  return (
    <Box gap={1}>
      <Text color={color}>●</Text>
      <Text color={theme.text}>{label}</Text>
    </Box>
  );
}
