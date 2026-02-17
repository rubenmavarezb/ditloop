import { useState, useEffect, useRef } from 'react';
import { Box } from 'ink';
import { ThemeProvider } from '@ditloop/ui';
import { SidebarPanel } from './sidebar-panel.js';
import { SourceControlPanel } from './source-control-panel.js';
import { StatusPanel } from './status-panel.js';
import { IpcClient } from '../ipc/ipc-client.js';
import type { IpcMessage } from '../ipc/ipc-server.js';

/** Panel types that can be rendered in tmux panes. */
export type PanelType = 'sidebar' | 'source-control' | 'git' | 'status';

/** Props for the PanelRenderer component. */
export interface PanelRendererProps {
  /** Which panel to render. */
  type: PanelType;
  /** IPC socket path for communication. */
  ipcPath: string;
}

/** A single workspace entry received via IPC. */
export interface WorkspaceData {
  name: string;
  branch?: string;
  email?: string;
  platform?: string;
  active?: boolean;
}

/**
 * Renders a specific panel designed for narrow tmux panes.
 * Connects to IPC server for workspace event updates.
 * Handles SIGWINCH resize events automatically.
 */
export function PanelRenderer({ type, ipcPath }: PanelRendererProps) {
  const [width, setWidth] = useState(process.stdout.columns ?? 30);
  const [height, setHeight] = useState(process.stdout.rows ?? 24);
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const clientRef = useRef<IpcClient | null>(null);

  useEffect(() => {
    const onResize = () => {
      setWidth(process.stdout.columns ?? 30);
      setHeight(process.stdout.rows ?? 24);
    };
    process.stdout.on('resize', onResize);
    return () => { process.stdout.off('resize', onResize); };
  }, []);

  useEffect(() => {
    if (!ipcPath) return;

    const client = new IpcClient(ipcPath);
    clientRef.current = client;

    client.connect()
      .then(() => {
        client.onMessage((msg: IpcMessage) => {
          if (msg.type === 'workspace-changed') {
            const payload = msg.payload;
            if (Array.isArray(payload['workspaces'])) {
              setWorkspaces(payload['workspaces'] as WorkspaceData[]);
            }
          }
        });
      })
      .catch(() => {
        // IPC server may not be ready yet; panel works without it
      });

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [ipcPath]);

  const isSourceControl = type === 'source-control' || type === 'git';
  const activeWs = workspaces.find((ws) => ws.active) ?? workspaces[0];

  return (
    <ThemeProvider>
      <Box width={width} height={height}>
        {type === 'sidebar' && (
          <SidebarPanel
            width={width}
            height={height}
            workspaces={workspaces}
          />
        )}
        {isSourceControl && (
          <SourceControlPanel
            width={width}
            height={height}
            branch={activeWs?.branch}
          />
        )}
        {type === 'status' && (
          <StatusPanel
            width={width}
            branch={activeWs?.branch}
            workspace={activeWs?.name}
            identity={activeWs?.email ? activeWs.name : undefined}
            email={activeWs?.email}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
