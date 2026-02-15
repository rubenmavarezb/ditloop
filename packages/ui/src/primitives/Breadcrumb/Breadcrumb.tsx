import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the Breadcrumb component. */
export interface BreadcrumbProps {
  /** Path segments to display, e.g. ['ditloop', 'Pivotree', '#042']. */
  segments: string[];
}

/**
 * Navigation breadcrumb displaying path segments separated by chevrons.
 * Renders as: ◉ segment1 ❯ segment2 ❯ segment3
 *
 * @param props - Breadcrumb segments
 */
export function Breadcrumb({ segments }: BreadcrumbProps) {
  const theme = useTheme();

  return (
    <Box gap={1}>
      <Text color={theme.accent}>◉</Text>
      {segments.map((segment, i) => (
        <Box key={i} gap={1}>
          {i > 0 && <Text color={theme.textDim}>❯</Text>}
          <Text color={i === segments.length - 1 ? theme.text : theme.textDim} bold={i === segments.length - 1}>
            {segment}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
