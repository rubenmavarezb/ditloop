import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTauri } from '../lib/tauri.js';

/** Send tray count updates and handle tray navigation events. */
export function useTray(workspaceCount: number) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTauri()) return;

    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('update_tray_counts', { workspaceCount }).catch(() => {});
    });
  }, [workspaceCount]);

  useEffect(() => {
    if (!isTauri()) return;

    let cleanup: (() => void) | undefined;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('tray:navigate', (event) => {
        navigate(event.payload);
      }).then((fn) => { cleanup = fn; });
    });

    return () => { cleanup?.(); };
  }, [navigate]);
}
