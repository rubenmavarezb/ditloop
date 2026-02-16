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

    const ws = ditloopWs;
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'approval:requested':
            notify('approval_requested', 'Approval Needed', data.payload?.name ?? 'New approval request');
            break;
          case 'execution:completed':
            notify('execution_completed', 'Execution Complete', data.payload?.name ?? 'Task completed');
            break;
          case 'execution:failed':
            notify('execution_failed', 'Execution Failed', data.payload?.name ?? 'Task failed');
            break;
          case 'execution:started':
            notify('execution_started', 'Execution Started', data.payload?.name ?? 'Task started');
            break;
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onMessage(handler);

    return () => {
      // DitLoopWebSocket doesn't expose removeListener, so this is a no-op
      // In a real implementation, we'd add removeListener support
    };
  }, [enabled, notify]);

  return { notify };
}
