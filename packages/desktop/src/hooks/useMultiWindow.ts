import { useCallback } from 'react';

/** Hook for multi-window management via Tauri. */
export function useMultiWindow() {
  /** Open a new window focused on a specific workspace path. */
  const openWorkspaceWindow = useCallback(async (workspacePath: string) => {
    const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
    const label = `workspace-${workspacePath.replace(/[^a-zA-Z0-9]/g, '-')}`.slice(0, 50);

    const existing = await WebviewWindow.getByLabel(label);
    if (existing) {
      await existing.setFocus();
      return;
    }

    const webview = new WebviewWindow(label, {
      url: `/workspace/${encodeURIComponent(workspacePath)}`,
      title: `DitLoop — ${workspacePath.split('/').pop()}`,
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      center: true,
      decorations: false,
    });

    webview.once('tauri://error', (e) => {
      console.error('Failed to create window:', e);
    });
  }, []);

  /** Open a new blank window. */
  const openNewWindow = useCallback(async () => {
    const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
    const label = `ditloop-${Date.now()}`;

    new WebviewWindow(label, {
      url: '/',
      title: 'DitLoop',
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      center: true,
      decorations: false,
    });
  }, []);

  return { openWorkspaceWindow, openNewWindow };
}
