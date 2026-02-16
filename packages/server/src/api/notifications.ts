import { Hono } from 'hono';
import type { PushNotificationService, PushSubscriptionData } from '../notifications/index.js';
import type { NotificationPreferences } from '../notifications/preferences.js';

/** Dependencies for notification API routes. */
export interface NotificationRouteDeps {
  pushService: PushNotificationService;
  getPreferences: () => NotificationPreferences;
  setPreferences: (prefs: NotificationPreferences) => void;
}

/**
 * Create notification API routes for push subscription management.
 *
 * @param deps - Injected dependencies (PushNotificationService)
 * @returns Hono router with notification endpoints
 */
export function createNotificationRoutes(deps: NotificationRouteDeps) {
  const app = new Hono();

  /** GET /notifications/vapid-key — return the public VAPID key. */
  app.get('/notifications/vapid-key', (c) => {
    return c.json({ publicKey: deps.pushService.publicKey });
  });

  /** POST /notifications/subscribe — register a push subscription. */
  app.post('/notifications/subscribe', async (c) => {
    const body = await c.req.json<PushSubscriptionData>();

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return c.json({ error: 'Invalid subscription: endpoint, keys.p256dh, and keys.auth are required' }, 400);
    }

    const id = deps.pushService.subscribe(body);
    return c.json({ id }, 201);
  });

  /** DELETE /notifications/subscribe/:id — unsubscribe by ID. */
  app.delete('/notifications/subscribe/:id', (c) => {
    const id = c.req.param('id');
    const removed = deps.pushService.unsubscribe(id);

    if (!removed) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    return c.json({ status: 'unsubscribed', id });
  });

  /** GET /notifications/preferences — return current notification preferences. */
  app.get('/notifications/preferences', (c) => {
    return c.json(deps.getPreferences());
  });

  /** PUT /notifications/preferences — update notification preferences. */
  app.put('/notifications/preferences', async (c) => {
    const body = await c.req.json<Partial<NotificationPreferences>>();
    const current = deps.getPreferences();
    const updated: NotificationPreferences = {
      ...current,
      ...body,
      quietHours: { ...current.quietHours, ...body.quietHours },
      events: { ...current.events, ...body.events },
      workspaceOverrides: { ...current.workspaceOverrides, ...body.workspaceOverrides },
    };
    deps.setPreferences(updated);
    return c.json(updated);
  });

  return app;
}
