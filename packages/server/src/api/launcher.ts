import { Hono } from 'hono';
import type { AiLauncher, WorkspaceManager } from '@ditloop/core';

/** Options for creating launcher routes. */
export interface LauncherRouteDeps {
  aiLauncher: AiLauncher;
  workspaceManager: WorkspaceManager;
}

/**
 * Create AI launcher API routes.
 *
 * @param deps - Injected dependencies (AiLauncher, WorkspaceManager)
 * @returns Hono router with launcher endpoints
 */
export function createLauncherRoutes(deps: LauncherRouteDeps) {
  const app = new Hono();

  /** GET /launch/available — list detected AI CLIs. */
  app.get('/launch/available', (c) => {
    const available = deps.aiLauncher.detectAvailable(true);
    return c.json({
      clis: available.map((cli) => ({
        name: cli.definition.name,
        version: cli.version,
        binary: cli.definition.binary,
      })),
    });
  });

  /** POST /launch — trigger AI CLI in non-interactive mode. */
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
