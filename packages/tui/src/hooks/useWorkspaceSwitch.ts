import { useState, useCallback } from 'react';
import type { TmuxManager } from '../tmux/tmux-manager.js';
import type { IpcServer } from '../ipc/ipc-server.js';

/** Options for the workspace switch hook. */
export interface WorkspaceSwitchOptions {
  /** TmuxManager instance. */
  tmux: TmuxManager;
  /** IPC server for broadcasting changes. */
  ipc: IpcServer;
  /** Pane ID of the center terminal. */
  terminalPaneId: string;
}

/**
 * Hook for switching the active workspace in a tmux-managed DitLoop session.
 *
 * @param options - Dependencies for workspace switching
 * @returns switchWorkspace function, current workspace, and switching state
 */
export function useWorkspaceSwitch(options: WorkspaceSwitchOptions) {
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const switchWorkspace = useCallback(async (workspacePath: string, profileName?: string) => {
    setSwitching(true);
    try {
      await options.tmux.sendKeys(options.terminalPaneId, `cd ${workspacePath}`);
      await options.tmux.sendKeys(options.terminalPaneId, 'clear');
      options.ipc.broadcast({
        type: 'workspace-changed',
        payload: { path: workspacePath, profile: profileName },
      });
      setCurrentWorkspace(workspacePath);
    } finally {
      setSwitching(false);
    }
  }, [options]);

  return { switchWorkspace, currentWorkspace, switching };
}
