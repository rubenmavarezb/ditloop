import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the FocusablePanel component. */
export interface FocusablePanelProps {
  /** Panel title text. */
  title: string;
  /** Optional badge text displayed after the title. */
  badge?: string;
  /** Whether the panel is currently focused. */
  focused: boolean;
  /** Optional panel number shown as prefix in the title (e.g., [1]). */
  panelNumber?: number;
  /** Panel content. */
  children?: ReactNode;
  /** Panel width. */
  width?: number | string;
  /** Panel height. */
  height?: number | string;
}

/**
 * Panel wrapper that applies focused/unfocused border styling.
 * When focused, uses the borderFocused or accent theme color.
 * When unfocused, uses the default border color.
 * Shows panel number in title like "[1] Git Status".
 *
 * @param props - Focusable panel configuration
 */
export function FocusablePanel({
  title,
  badge,
  focused,
  panelNumber,
  children,
  width,
  height,
}: FocusablePanelProps) {
  const theme = useTheme();
  const borderColor = focused
    ? (theme.borderFocused ?? theme.accent)
    : theme.border;

  const displayTitle = panelNumber != null ? `[${panelNumber}] ${title}` : title;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      width={width as number}
      height={height as number}
      paddingX={1}
    >
      <Box gap={1}>
        <Text bold color={focused ? borderColor : theme.accent}>
          {displayTitle}
        </Text>
        {badge && (
          <Text color={theme.textDim}>[{badge}]</Text>
        )}
      </Box>
      {children}
    </Box>
  );
}
