import { Hono } from 'hono';
import type { StateSyncEngine, OfflineEvent } from '../sync/index.js';

/** Dependencies for sync API routes. */
export interface SyncRouteDeps {
  syncEngine: StateSyncEngine;
}

/**
 * Create sync API routes for delta-based state synchronization.
 *
 * @param deps - Injected dependencies (StateSyncEngine)
 * @returns Hono router with sync endpoints
 */
export function createSyncRoutes(deps: SyncRouteDeps) {
  const app = new Hono();

  /** GET /sync/version — return current server version. */
  app.get('/sync/version', (c) => {
    return c.json({
      version: deps.syncEngine.getCurrentVersion(),
      timestamp: Date.now(),
    });
  });

  /** GET /sync/state?since=<version> — return deltas or full state. */
  app.get('/sync/state', (c) => {
    const sinceParam = c.req.query('since');

    if (sinceParam === undefined || sinceParam === '') {
      // No version specified — return full state
      return c.json({
        type: 'full' as const,
        state: deps.syncEngine.getFullState(),
      });
    }

    const since = parseInt(sinceParam, 10);
    if (isNaN(since) || since < 0) {
      return c.json({ error: 'since must be a non-negative integer' }, 400);
    }

    const deltas = deps.syncEngine.getDeltasSince(since);

    if (deltas === undefined) {
      // Version too old — return full state
      return c.json({
        type: 'full' as const,
        state: deps.syncEngine.getFullState(),
      });
    }

    return c.json({
      type: 'delta' as const,
      since,
      deltas,
      currentVersion: deps.syncEngine.getCurrentVersion(),
    });
  });

  /** POST /sync/offline-queue — process offline events from a client. */
  app.post('/sync/offline-queue', async (c) => {
    const body = await c.req.json<{ events?: OfflineEvent[] }>();

    if (!body.events || !Array.isArray(body.events)) {
      return c.json({ error: 'events must be an array' }, 400);
    }

    const result = deps.syncEngine.processOfflineQueue(body.events);
    return c.json(result);
  });

  return app;
}
