import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the Panel component. */
export interface PanelProps {
  /** Optional title displayed at the top-left of the border. */
  title?: string;
  /** Optional badge text displayed after the title. */
  badge?: string;
  /** Panel content. */
  children?: ReactNode;
  /** Width of the panel. Defaults to 100%. */
  width?: number | string;
  /** Height of the panel. */
  height?: number | string;
  /** Padding inside the panel. Defaults to 1. */
  padding?: number;
}

/**
 * Bordered box container with optional title and badge.
 * Uses Ink's Box with border styling and theme colors.
 *
 * @param props - Panel configuration
 */
export function Panel({
  title,
  badge,
  children,
  width = '100%',
  height,
  padding = 1,
}: PanelProps) {
  const theme = useTheme();

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.border}
      width={width as number}
      height={height as number}
      paddingX={padding}
    >
      {(title || badge) && (
        <Box gap={1}>
          {title && (
            <Text bold color={theme.accent}>
              {title}
            </Text>
          )}
          {badge && (
            <Text color={theme.textDim}>[{badge}]</Text>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
}
