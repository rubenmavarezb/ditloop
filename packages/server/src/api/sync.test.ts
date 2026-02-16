import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createSyncRoutes } from './sync.js';
import type { SyncRouteDeps } from './sync.js';

function createMockDeps(): SyncRouteDeps {
  return {
    syncEngine: {
      getCurrentVersion: vi.fn(() => 42),
      getFullState: vi.fn(() => ({
        version: 42,
        timestamp: 1700000000000,
        workspaces: [{ id: 'ws-1', name: 'test' }],
        executions: [],
        approvals: [],
      })),
      getDeltasSince: vi.fn((version: number) => {
        if (version >= 42) return [];
        return [
          { version: 41, event: 'workspace:activated', data: { id: 'ws-1' }, timestamp: 1700000000000 },
          { version: 42, event: 'execution:started', data: { taskId: 't1' }, timestamp: 1700000001000 },
        ];
      }),
      processOfflineQueue: vi.fn(() => ({
        accepted: 2,
        rejected: 0,
        conflicts: [],
        newVersion: 44,
      })),
    } as unknown as SyncRouteDeps['syncEngine'],
  };
}

describe('Sync API routes', () => {
  let deps: SyncRouteDeps;
  let app: Hono;

  beforeEach(() => {
    deps = createMockDeps();
    app = new Hono();
    app.route('/', createSyncRoutes(deps));
  });

  describe('GET /sync/version', () => {
    it('should return version and timestamp', async () => {
      const res = await app.request('/sync/version');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.version).toBe(42);
      expect(json.timestamp).toBeGreaterThan(0);
    });
  });

  describe('GET /sync/state', () => {
    it('should return full state when no since param', async () => {
      const res = await app.request('/sync/state');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.type).toBe('full');
      expect(json.state).toBeDefined();
      expect(json.state.version).toBe(42);
      expect(json.state.workspaces).toHaveLength(1);
    });

    it('should return deltas when since param is provided', async () => {
      const res = await app.request('/sync/state?since=0');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.type).toBe('delta');
      expect(json.since).toBe(0);
      expect(json.deltas).toHaveLength(2);
      expect(json.currentVersion).toBe(42);
    });

    it('should return empty deltas when client is up to date', async () => {
      vi.mocked(deps.syncEngine.getDeltasSince).mockReturnValue([]);

      const res = await app.request('/sync/state?since=42');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.type).toBe('delta');
      expect(json.deltas).toHaveLength(0);
    });

    it('should return 400 for invalid since param', async () => {
      const res = await app.request('/sync/state?since=abc');
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('non-negative integer');
    });

    it('should return full state when version is too old', async () => {
      vi.mocked(deps.syncEngine.getDeltasSince).mockReturnValue(undefined as never);

      const res = await app.request('/sync/state?since=0');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.type).toBe('full');
      expect(json.state).toBeDefined();
    });
  });

  describe('POST /sync/offline-queue', () => {
    it('should process events', async () => {
      const res = await app.request('/sync/offline-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            { clientId: 'c1', event: 'workspace:activated', data: { id: 'ws-1' }, clientTimestamp: 1700000000000, clientVersion: 1 },
            { clientId: 'c1', event: 'execution:started', data: { taskId: 't1' }, clientTimestamp: 1700000001000, clientVersion: 2 },
          ],
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.accepted).toBe(2);
      expect(json.rejected).toBe(0);
      expect(json.newVersion).toBe(44);
    });

    it('should return 400 for missing events array', async () => {
      const res = await app.request('/sync/offline-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('array');
    });

    it('should return 400 when events is not an array', async () => {
      const res = await app.request('/sync/offline-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: 'not-an-array' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('array');
    });
  });
});
