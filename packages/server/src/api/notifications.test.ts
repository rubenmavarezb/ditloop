import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createNotificationRoutes } from './notifications.js';
import type { NotificationRouteDeps } from './notifications.js';
import type { NotificationPreferences } from '../notifications/preferences.js';

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
  events: { 'execution-completed': true, 'approval-requested': true },
  workspaceOverrides: {},
};

function createMockDeps(): NotificationRouteDeps {
  let prefs = { ...defaultPreferences };
  return {
    pushService: {
      publicKey: 'test-vapid-public-key',
      subscribe: vi.fn(() => 'sub-123'),
      unsubscribe: vi.fn(() => false),
    } as unknown as NotificationRouteDeps['pushService'],
    getPreferences: vi.fn(() => prefs),
    setPreferences: vi.fn((p: NotificationPreferences) => {
      prefs = p;
    }),
  };
}

describe('Notification API routes', () => {
  let deps: NotificationRouteDeps;
  let app: Hono;

  beforeEach(() => {
    deps = createMockDeps();
    app = new Hono();
    app.route('/', createNotificationRoutes(deps));
  });

  describe('GET /notifications/vapid-key', () => {
    it('should return public key', async () => {
      const res = await app.request('/notifications/vapid-key');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.publicKey).toBe('test-vapid-public-key');
    });
  });

  describe('POST /notifications/subscribe', () => {
    it('should return 201 with subscription ID', async () => {
      const res = await app.request('/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'https://push.example.com/sub/abc',
          keys: { p256dh: 'key1', auth: 'key2' },
        }),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('sub-123');
    });

    it('should return 400 for missing endpoint', async () => {
      const res = await app.request('/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keys: { p256dh: 'key1', auth: 'key2' },
        }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('endpoint');
    });

    it('should return 400 for missing keys', async () => {
      const res = await app.request('/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'https://push.example.com/sub/abc',
        }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });
  });

  describe('DELETE /notifications/subscribe/:id', () => {
    it('should return 404 for unknown ID', async () => {
      vi.mocked(deps.pushService.unsubscribe).mockReturnValue(false);

      const res = await app.request('/notifications/subscribe/nonexistent', {
        method: 'DELETE',
      });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('not found');
    });

    it('should return success when unsubscribed', async () => {
      vi.mocked(deps.pushService.unsubscribe).mockReturnValue(true);

      const res = await app.request('/notifications/subscribe/sub-123', {
        method: 'DELETE',
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('unsubscribed');
      expect(json.id).toBe('sub-123');
    });
  });

  describe('GET /notifications/preferences', () => {
    it('should return current preferences', async () => {
      const res = await app.request('/notifications/preferences');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.enabled).toBe(true);
      expect(json.quietHours).toBeDefined();
      expect(json.events).toBeDefined();
    });
  });

  describe('PUT /notifications/preferences', () => {
    it('should merge partial update', async () => {
      const res = await app.request('/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: false,
          events: { 'execution-failed': true },
        }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.enabled).toBe(false);
      // Merged events should include both old and new
      expect(json.events['execution-completed']).toBe(true);
      expect(json.events['execution-failed']).toBe(true);
      // quietHours should be preserved
      expect(json.quietHours.start).toBe('22:00');
    });
  });
});
