import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A single shortcut entry with a key and label. */
export interface Shortcut {
  /** Key to display, e.g. 'q', '↑↓', 'ctrl+b'. */
  key: string;
  /** Action description, e.g. 'quit', 'navigate'. */
  label: string;
}

/** Props for the ShortcutsBar component. */
export interface ShortcutsBarProps {
  /** List of keyboard shortcuts to display. */
  shortcuts: Shortcut[];
}

/**
 * Bottom bar displaying keyboard shortcut hints as [key] label pairs.
 *
 * @param props - Shortcuts to display
 */
export function ShortcutsBar({ shortcuts }: ShortcutsBarProps) {
  const theme = useTheme();

  return (
    <Box gap={2}>
      {shortcuts.map((s, i) => (
        <Box key={i} gap={1}>
          <Text color={theme.accent}>[{s.key}]</Text>
          <Text color={theme.textDim}>{s.label}</Text>
        </Box>
      ))}
    </Box>
  );
}
