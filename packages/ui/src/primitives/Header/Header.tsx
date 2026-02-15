import { Box, Text } from 'ink';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb.js';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the Header component. */
export interface HeaderProps {
  /** Breadcrumb segments for the left side. */
  segments: string[];
  /** Optional info text for the right side. */
  rightText?: string;
}

/**
 * Top bar composing a Breadcrumb on the left and optional info on the right.
 *
 * @param props - Header configuration
 */
export function Header({ segments, rightText }: HeaderProps) {
  const theme = useTheme();

  return (
    <Box justifyContent="space-between" width="100%">
      <Breadcrumb segments={segments} />
      {rightText && <Text color={theme.textDim}>{rightText}</Text>}
    </Box>
  );
}
