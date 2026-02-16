import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useNavigate } from 'react-router-dom';

/** Send tray count updates and handle tray navigation events. */
export function useTray(activeExecutions: number, pendingApprovals: number) {
  useEffect(() => {
    invoke('update_tray_counts', {
      activeExecutions,
      pendingApprovals,
    }).catch(() => {
      // Tray may not be available in dev mode
    });
  }, [activeExecutions, pendingApprovals]);

  const navigate = useNavigate();

  useEffect(() => {
    const unlisten = listen<string>('tray:navigate', (event) => {
      navigate(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [navigate]);
}
