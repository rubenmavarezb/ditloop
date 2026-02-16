import { Box, Text } from 'ink';

/** Props for the HelpOverlay. */
export interface HelpOverlayProps {
  /** Whether the overlay is visible. */
  visible: boolean;
  /** Overlay width. */
  width: number;
}

/** All keyboard shortcuts. */
const SHORTCUTS: Array<[string, string]> = [
  ['Tab / Shift+Tab', 'Cycle panel focus'],
  ['h / l', 'Focus left / right panel'],
  ['j / k', 'Scroll up / down in panel'],
  ['1-7', 'Jump to panel by number'],
  ['+/-', 'Resize focused panel'],
  ['=', 'Reset layout'],
  ['/', 'Open fuzzy finder'],
  ['Enter', 'Activate selection'],
  ['Escape', 'Back / close overlay'],
  ['Ctrl+B', 'Toggle sidebar'],
  ['?', 'Toggle this help'],
  ['q', 'Quit'],
];

/**
 * Full-screen help overlay showing all keyboard shortcuts.
 *
 * @param props - Visibility and sizing
 */
export function HelpOverlay({ visible, width }: HelpOverlayProps) {
  if (!visible) return null;

  return (
    <Box
      flexDirection="column"
      width={width}
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
    >
      <Text bold color="cyan">{'  Keyboard Shortcuts'}</Text>
      <Text>{''}</Text>
      {SHORTCUTS.map(([key, desc]) => (
        <Box key={key}>
          <Box width={20}>
            <Text color="yellow">{key}</Text>
          </Box>
          <Text>{desc}</Text>
        </Box>
      ))}
      <Text>{''}</Text>
      <Text dimColor>{'Press ? to close'}</Text>
    </Box>
  );
}
