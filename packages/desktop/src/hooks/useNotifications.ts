import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

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
    if (!enabled) return;

    invoke('request_notification_permission').catch(() => {
      // Permission may already be granted
    });
  }, [enabled]);

  const notify = useCallback(
    (type: NotificationType, title: string, body: string) => {
      if (!enabled) return;

      invoke('send_notification', {
        notificationType: type,
        title,
        body,
      }).catch(() => {
        // Notification may fail silently
      });
    },
    [enabled],
  );

  return { notify };
}
