import { useEffect, useCallback } from 'react';
import { isTauri } from '../lib/tauri.js';

/** Notification type matching Rust enum. */
type NotificationType =
  | 'approval_requested'
  | 'execution_completed'
  | 'execution_failed'
  | 'execution_started';

/**
 * Request notification permission and provide a notify() function for OS notifications.
 *
 * In the local-first architecture, notifications are triggered by desktop hooks
 * (e.g., useGitStatus detecting changes) rather than a WebSocket connection.
 */
export function useNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !isTauri()) return;

    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('request_notification_permission').catch(() => {});
    });
  }, [enabled]);

  const notify = useCallback(
    (type: NotificationType, title: string, body: string) => {
      if (!enabled || !isTauri()) return;

      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke('send_notification', {
          notificationType: type,
          title,
          body,
        }).catch(() => {});
      });
    },
    [enabled],
  );

  return { notify };
}
