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

    const unlistenConnect = listen<string>('deep-link:connect', (event) => {
      try {
        const url = new URL(event.payload);
        const serverUrl = url.searchParams.get('url');
        const token = url.searchParams.get('token');
        if (serverUrl && token) {
          // Store params and redirect to connection setup
          sessionStorage.setItem('dl-url', serverUrl);
          sessionStorage.setItem('dl-token', token);
          navigate('/');
        }
      } catch {
        // Invalid URL
      }
    });

    return () => {
      unlistenNav.then((fn) => fn());
      unlistenConnect.then((fn) => fn());
    };
  }, [navigate]);
}
