import { useState, useEffect, useCallback } from 'react';

/** Update status for the app. */
interface UpdateInfo {
  available: boolean;
  version: string | null;
  downloading: boolean;
  progress: number;
}

/** Hook to check for app updates and manage the update lifecycle. */
export function useUpdater() {
  const [update, setUpdate] = useState<UpdateInfo>({
    available: false,
    version: null,
    downloading: false,
    progress: 0,
  });

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = useCallback(async () => {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      if (result) {
        setUpdate((prev) => ({
          ...prev,
          available: true,
          version: result.version,
        }));
      }
    } catch {
      // Updater may not be configured in dev mode
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const result = await check();
      if (!result) return;

      setUpdate((prev) => ({ ...prev, downloading: true }));

      await result.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          setUpdate((prev) => ({ ...prev, progress: 0 }));
        } else if (event.event === 'Progress') {
          setUpdate((prev) => ({
            ...prev,
            progress: prev.progress + (event.data.chunkLength ?? 0),
          }));
        } else if (event.event === 'Finished') {
          setUpdate((prev) => ({ ...prev, progress: 100 }));
        }
      });

      // Restart after install
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch {
      setUpdate((prev) => ({ ...prev, downloading: false }));
    }
  }, []);

  return { update, checkForUpdate, downloadAndInstall };
}
