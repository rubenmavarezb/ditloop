import { useState, useEffect } from 'react';
import { Box } from 'ink';
import { SidebarPanel } from './sidebar-panel.js';
import { GitPanel } from './git-panel.js';
import { StatusPanel } from './status-panel.js';

/** Panel types that can be rendered in tmux panes. */
export type PanelType = 'sidebar' | 'git' | 'status';

/** Props for the PanelRenderer component. */
export interface PanelRendererProps {
  /** Which panel to render. */
  type: PanelType;
  /** IPC socket path for communication. */
  ipcPath: string;
}

/**
 * Renders a specific panel designed for narrow tmux panes.
 * Handles SIGWINCH resize events automatically.
 */
export function PanelRenderer({ type }: PanelRendererProps) {
  const [width, setWidth] = useState(process.stdout.columns ?? 30);
  const [height, setHeight] = useState(process.stdout.rows ?? 24);

  useEffect(() => {
    const onResize = () => {
      setWidth(process.stdout.columns ?? 30);
      setHeight(process.stdout.rows ?? 24);
    };
    process.stdout.on('resize', onResize);
    return () => { process.stdout.off('resize', onResize); };
  }, []);

  return (
    <Box width={width} height={height}>
      {type === 'sidebar' && <SidebarPanel width={width} height={height} />}
      {type === 'git' && <GitPanel width={width} height={height} />}
      {type === 'status' && <StatusPanel width={width} />}
    </Box>
  );
}
