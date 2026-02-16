import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useNavigate } from 'react-router-dom';

/** Listen for deep link events from Tauri and navigate accordingly. */
export function useDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    const unlistenNav = listen<string>('deep-link:navigate', (event) => {
      navigate(event.payload);
    });

    return () => {
      unlistenNav.then((fn) => fn());
    };
  }, [navigate]);
}
