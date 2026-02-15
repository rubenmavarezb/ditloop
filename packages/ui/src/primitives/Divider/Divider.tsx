import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the Divider component. */
export interface DividerProps {
  /** Width of the divider in characters. Defaults to 40. */
  width?: number;
  /** Optional label displayed in the center of the divider. */
  label?: string;
}

/**
 * Horizontal line divider using box-drawing characters.
 *
 * @param props - Divider configuration
 */
export function Divider({ width = 40, label }: DividerProps) {
  const theme = useTheme();

  if (label) {
    const labelLen = label.length + 2;
    const sideLen = Math.max(1, Math.floor((width - labelLen) / 2));
    const line = '─'.repeat(sideLen);
    return (
      <Box>
        <Text color={theme.border}>
          {line} {label} {line}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text color={theme.border}>{'─'.repeat(width)}</Text>
    </Box>
  );
}
