import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ditloopWs } from '@ditloop/web-ui';

/** Notification type matching Rust enum. */
type NotificationType =
  | 'approval_requested'
  | 'execution_completed'
  | 'execution_failed'
  | 'execution_started';

/** Request notification permission and listen for WebSocket events to trigger OS notifications. */
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

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = ditloopWs.onMessage((message) => {
      switch (message.event) {
        case 'approval:requested':
          notify('approval_requested', 'Approval Needed', (message.data as Record<string, string>)?.name ?? 'New approval request');
          break;
        case 'execution:completed':
          notify('execution_completed', 'Execution Complete', (message.data as Record<string, string>)?.name ?? 'Task completed');
          break;
        case 'execution:failed':
          notify('execution_failed', 'Execution Failed', (message.data as Record<string, string>)?.name ?? 'Task failed');
          break;
        case 'execution:started':
          notify('execution_started', 'Execution Started', (message.data as Record<string, string>)?.name ?? 'Task started');
          break;
      }
    });

    return unsubscribe;
  }, [enabled, notify]);

  return { notify };
}
