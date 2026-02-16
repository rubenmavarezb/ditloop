import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createLauncherRoutes } from './launcher.js';
import type { LauncherRouteDeps } from './launcher.js';

function createMockDeps(): LauncherRouteDeps {
  return {
    aiLauncher: {
      detectAvailable: vi.fn(() => [
        {
          definition: { name: 'Claude Code', binary: 'claude' },
          version: '1.2.0',
        },
        {
          definition: { name: 'GitHub Copilot', binary: 'gh' },
          version: '2.0.0',
        },
      ]),
      launch: vi.fn(() =>
        Promise.resolve({ exitCode: 0, stdout: 'done', stderr: '' }),
      ),
    } as unknown as LauncherRouteDeps['aiLauncher'],
    workspaceManager: {
      get: vi.fn(() => undefined),
    } as unknown as LauncherRouteDeps['workspaceManager'],
  };
}

describe('Launcher API routes', () => {
  let deps: LauncherRouteDeps;
  let app: Hono;

  beforeEach(() => {
    deps = createMockDeps();
    app = new Hono();
    app.route('/', createLauncherRoutes(deps));
  });

  describe('GET /launch/available', () => {
    it('should return available CLIs', async () => {
      const res = await app.request('/launch/available');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.clis).toHaveLength(2);
      expect(json.clis[0].name).toBe('Claude Code');
      expect(json.clis[0].binary).toBe('claude');
      expect(json.clis[0].version).toBe('1.2.0');
      expect(json.clis[1].name).toBe('GitHub Copilot');
    });
  });

  describe('POST /launch', () => {
    it('should return 400 for missing cliId', async () => {
      const res = await app.request('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });

    it('should return 400 for missing workspaceId', async () => {
      const res = await app.request('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliId: 'claude' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });

    it('should return 404 for unknown workspace', async () => {
      vi.mocked(deps.workspaceManager.get).mockReturnValue(undefined);

      const res = await app.request('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliId: 'claude', workspaceId: 'unknown' }),
      });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Workspace not found');
    });

    it('should return 500 when launcher throws', async () => {
      vi.mocked(deps.workspaceManager.get).mockReturnValue({
        id: 'ws-1',
        name: 'test-ws',
        path: '/tmp/ws',
      } as never);
      vi.mocked(deps.aiLauncher.launch).mockRejectedValue(
        new Error('CLI not found'),
      );

      const res = await app.request('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliId: 'claude', workspaceId: 'ws-1' }),
      });
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('CLI not found');
    });

    it('should return launch result on success', async () => {
      vi.mocked(deps.workspaceManager.get).mockReturnValue({
        id: 'ws-1',
        name: 'test-ws',
        path: '/tmp/ws',
      } as never);

      const res = await app.request('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliId: 'claude', workspaceId: 'ws-1' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.exitCode).toBe(0);
      expect(json.stdout).toBe('done');
      expect(json.stderr).toBe('');
    });
  });
});
