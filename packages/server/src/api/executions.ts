import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { EventBus, ExecutionEngine, AiLauncher, WorkspaceManager } from '@ditloop/core';
import type { ExecutionMonitor } from '../execution/execution-monitor.js';

/** Options for creating execution routes. */
export interface ExecutionRouteDeps {
  executionEngine: ExecutionEngine;
  aiLauncher: AiLauncher;
  workspaceManager: WorkspaceManager;
  executionMonitor: ExecutionMonitor;
  eventBus: EventBus;
}

/**
 * Create execution API routes with SSE streaming.
 *
 * @param deps - Injected dependencies
 * @returns Hono router with execution endpoints
 */
export function createExecutionRoutes(deps: ExecutionRouteDeps) {
  const app = new Hono();

  /** GET /executions — list all executions with optional filters. */
  app.get('/executions', (c) => {
    const workspace = c.req.query('workspace');
    const status = c.req.query('status');

    let executions = deps.executionMonitor.listExecutions();

    if (workspace) {
      executions = executions.filter((e) => e.workspace === workspace);
    }
    if (status) {
      executions = executions.filter((e) => e.status === status);
    }

    return c.json({ executions });
  });

  /** GET /executions/stats — execution metrics. */
  app.get('/executions/stats', (c) => {
    const stats = deps.executionMonitor.getStats();
    return c.json(stats);
  });

  /** GET /executions/:id — execution detail. */
  app.get('/executions/:id', (c) => {
    const execution = deps.executionMonitor.getExecution(c.req.param('id'));
    if (!execution) {
      return c.json({ error: 'Execution not found' }, 404);
    }
    return c.json(execution);
  });

  /** GET /executions/:id/stream — SSE stream of execution output. */
  app.get('/executions/:id/stream', (c) => {
    const id = c.req.param('id');
    const execution = deps.executionMonitor.getExecution(id);
    if (!execution) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    return streamSSE(c, async (stream) => {
      // Send buffered output first
      for (const line of execution.output) {
        await stream.writeSSE({ data: JSON.stringify(line), event: 'output' });
      }

      if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
        await stream.writeSSE({
          data: JSON.stringify({ status: execution.status, exitCode: execution.exitCode }),
          event: 'done',
        });
        return;
      }

      // Subscribe to live output
      const outputHandler = (payload: { taskId: string; stream: string; data: string }) => {
        if (payload.taskId === id) {
          stream.writeSSE({ data: JSON.stringify(payload), event: 'output' }).catch(() => {});
        }
      };

      const completedHandler = (payload: { taskId: string; exitCode: number }) => {
        if (payload.taskId === id) {
          stream.writeSSE({
            data: JSON.stringify({ status: 'completed', exitCode: payload.exitCode }),
            event: 'done',
          }).catch(() => {});
          cleanup();
        }
      };

      const errorHandler = (payload: { taskId: string; error: string }) => {
        if (payload.taskId === id) {
          stream.writeSSE({
            data: JSON.stringify({ status: 'failed', error: payload.error }),
            event: 'done',
          }).catch(() => {});
          cleanup();
        }
      };

      const cleanup = () => {
        deps.eventBus.off('execution:output', outputHandler);
        deps.eventBus.off('execution:completed', completedHandler);
        deps.eventBus.off('execution:error', errorHandler);
      };

      deps.eventBus.on('execution:output', outputHandler);
      deps.eventBus.on('execution:completed', completedHandler);
      deps.eventBus.on('execution:error', errorHandler);

      stream.onAbort(() => cleanup());

      // Keep alive until done or disconnected
      while (true) {
        const current = deps.executionMonitor.getExecution(id);
        if (!current || current.status === 'completed' || current.status === 'failed' || current.status === 'cancelled') {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });
  });

  /** POST /executions/:id/cancel — cancel a running execution. */
  app.post('/executions/:id/cancel', (c) => {
    const id = c.req.param('id');
    const cancelled = deps.executionMonitor.cancelExecution(id);
    if (!cancelled) {
      return c.json({ error: 'Execution not found or not running' }, 404);
    }
    return c.json({ status: 'cancelled', id });
  });

  /** POST /execute — start a new execution. */
  app.post('/execute', async (c) => {
    const body = await c.req.json<{
      workspaceId: string;
      taskId: string;
      provider?: string;
      model?: string;
    }>();

    if (!body.workspaceId || !body.taskId) {
      return c.json({ error: 'workspaceId and taskId are required' }, 400);
    }

    const ws = deps.workspaceManager.get(body.workspaceId);
    if (!ws) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    try {
      const executionId = await deps.executionMonitor.submitExecution({
        taskId: body.taskId,
        workspace: ws.id,
        workspacePath: ws.path,
        provider: body.provider,
        model: body.model,
      });

      return c.json({ id: executionId, status: 'queued' }, 202);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ error: message }, 500);
    }
  });

  /** POST /launch — launch AI CLI non-interactively. */
  app.post('/launch', async (c) => {
    const body = await c.req.json<{
      cliId: string;
      workspaceId: string;
      taskId?: string;
      roleId?: string;
      extraArgs?: string[];
    }>();

    if (!body.cliId || !body.workspaceId) {
      return c.json({ error: 'cliId and workspaceId are required' }, 400);
    }

    const ws = deps.workspaceManager.get(body.workspaceId);
    if (!ws) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    try {
      const result = await deps.aiLauncher.launch(body.cliId, {
        workspacePath: ws.path,
        workspaceName: ws.name,
        taskId: body.taskId,
        roleId: body.roleId,
        interactive: false,
        extraArgs: body.extraArgs,
      });

      return c.json({
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ error: message }, 500);
    }
  });

  return app;
}
