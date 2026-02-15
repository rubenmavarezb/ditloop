import { Box } from 'ink';
import type { ReactNode } from 'react';

/** Props for the SplitView component. */
export interface SplitViewProps {
  /** Left (or top) pane content. */
  left: ReactNode;
  /** Right (or bottom) pane content. */
  right: ReactNode;
  /** Split ratio as [left%, right%]. Defaults to [30, 70]. */
  ratio?: [number, number];
  /** Split direction. Defaults to 'horizontal'. */
  direction?: 'horizontal' | 'vertical';
  /** Total height of the split view. */
  height?: number | string;
}

/**
 * Two-pane layout with configurable split ratio and direction.
 * Uses Ink's flexbox to distribute space between panes.
 *
 * @param props - Split view configuration
 */
export function SplitView({
  left,
  right,
  ratio = [30, 70],
  direction = 'horizontal',
  height,
}: SplitViewProps) {
  const isHorizontal = direction === 'horizontal';

  return (
    <Box
      flexDirection={isHorizontal ? 'row' : 'column'}
      width="100%"
      height={height as number}
    >
      <Box
        width={isHorizontal ? `${ratio[0]}%` : '100%'}
        height={!isHorizontal ? `${ratio[0]}%` : '100%'}
        flexShrink={0}
      >
        {left}
      </Box>
      <Box
        width={isHorizontal ? `${ratio[1]}%` : '100%'}
        height={!isHorizontal ? `${ratio[1]}%` : '100%'}
        flexGrow={1}
      >
        {right}
      </Box>
    </Box>
  );
}
