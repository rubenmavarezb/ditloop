import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTauri } from '../lib/tauri.js';

/** Listen for deep link events from Tauri and navigate accordingly. */
export function useDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTauri()) return;

    let cleanup: (() => void) | undefined;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('deep-link:navigate', (event) => {
        navigate(event.payload);
      }).then((fn) => { cleanup = fn; });
    });

    return () => { cleanup?.(); };
  }, [navigate]);
}
