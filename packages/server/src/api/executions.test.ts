import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createExecutionRoutes } from './executions.js';
import type { ExecutionRouteDeps } from './executions.js';

function createMockDeps(): ExecutionRouteDeps {
  return {
    executionEngine: {} as ExecutionRouteDeps['executionEngine'],
    workspaceManager: {
      get: vi.fn(() => undefined),
    } as unknown as ExecutionRouteDeps['workspaceManager'],
    executionMonitor: {
      listExecutions: vi.fn(() => []),
      getExecution: vi.fn(() => undefined),
      getStats: vi.fn(() => ({
        total: 5,
        running: 1,
        completed: 3,
        failed: 1,
        queued: 0,
        cancelled: 0,
        providerUsage: { claude: 3, copilot: 2 },
      })),
      submitExecution: vi.fn(() => Promise.resolve('exec-1')),
      cancelExecution: vi.fn(() => false),
    } as unknown as ExecutionRouteDeps['executionMonitor'],
    eventBus: {
      on: vi.fn(),
      off: vi.fn(),
    } as unknown as ExecutionRouteDeps['eventBus'],
  };
}

describe('Execution API routes', () => {
  let deps: ExecutionRouteDeps;
  let app: Hono;

  beforeEach(() => {
    deps = createMockDeps();
    app = new Hono();
    app.route('/', createExecutionRoutes(deps));
  });

  describe('GET /executions', () => {
    it('should return empty list', async () => {
      const res = await app.request('/executions');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.executions).toEqual([]);
    });

    it('should filter by workspace', async () => {
      const executions = [
        { id: '1', workspace: 'ws-a', status: 'running', taskId: 't1', output: [] },
        { id: '2', workspace: 'ws-b', status: 'completed', taskId: 't2', output: [] },
        { id: '3', workspace: 'ws-a', status: 'completed', taskId: 't3', output: [] },
      ];
      vi.mocked(deps.executionMonitor.listExecutions).mockReturnValue(executions as never);

      const res = await app.request('/executions?workspace=ws-a');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.executions).toHaveLength(2);
      expect(json.executions.every((e: { workspace: string }) => e.workspace === 'ws-a')).toBe(true);
    });
  });

  describe('GET /executions/stats', () => {
    it('should return stats object', async () => {
      const res = await app.request('/executions/stats');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.total).toBe(5);
      expect(json.running).toBe(1);
      expect(json.completed).toBe(3);
      expect(json.providerUsage).toEqual({ claude: 3, copilot: 2 });
    });
  });

  describe('GET /executions/:id', () => {
    it('should return 404 for unknown ID', async () => {
      const res = await app.request('/executions/nonexistent');
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Execution not found');
    });

    it('should return execution when found', async () => {
      const execution = { id: 'exec-1', taskId: 't1', status: 'running', workspace: 'ws-1', output: [] };
      vi.mocked(deps.executionMonitor.getExecution).mockReturnValue(execution as never);

      const res = await app.request('/executions/exec-1');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe('exec-1');
    });
  });

  describe('POST /execute', () => {
    it('should return 400 for missing workspaceId', async () => {
      const res = await app.request('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task-1' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });

    it('should return 400 for missing taskId', async () => {
      const res = await app.request('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1' }),
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('required');
    });

    it('should return 404 for unknown workspace', async () => {
      vi.mocked(deps.workspaceManager.get).mockReturnValue(undefined);

      const res = await app.request('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'unknown', taskId: 'task-1' }),
      });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Workspace not found');
    });

    it('should return 202 with execution ID on success', async () => {
      vi.mocked(deps.workspaceManager.get).mockReturnValue({
        id: 'ws-1',
        name: 'test-ws',
        path: '/tmp/ws',
      } as never);
      vi.mocked(deps.executionMonitor.submitExecution).mockResolvedValue('exec-123');

      const res = await app.request('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'ws-1', taskId: 'task-1' }),
      });
      expect(res.status).toBe(202);
      const json = await res.json();
      expect(json.id).toBe('exec-123');
      expect(json.status).toBe('queued');
    });
  });

  describe('POST /executions/:id/cancel', () => {
    it('should return 404 for unknown execution', async () => {
      vi.mocked(deps.executionMonitor.cancelExecution).mockReturnValue(false);

      const res = await app.request('/executions/nonexistent/cancel', { method: 'POST' });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain('not found');
    });

    it('should return success when cancelled', async () => {
      vi.mocked(deps.executionMonitor.cancelExecution).mockReturnValue(true);

      const res = await app.request('/executions/exec-1/cancel', { method: 'POST' });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('cancelled');
      expect(json.id).toBe('exec-1');
    });
  });
});
