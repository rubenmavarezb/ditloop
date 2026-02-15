import { Hono } from 'hono';
import type { WorkspaceManager } from '@ditloop/core';
import type { ContextLoader } from '@ditloop/core';

/** Options for creating workspace routes. */
export interface WorkspaceRouteDeps {
  workspaceManager: WorkspaceManager;
  contextLoader: ContextLoader;
}

/**
 * Create workspace API routes.
 *
 * @param deps - Injected dependencies (WorkspaceManager, ContextLoader)
 * @returns Hono router with workspace endpoints
 */
export function createWorkspaceRoutes(deps: WorkspaceRouteDeps) {
  const app = new Hono();

  /** GET /workspaces — list all workspaces. */
  app.get('/workspaces', (c) => {
    const workspaces = deps.workspaceManager.list().map((ws) => ({
      id: ws.id,
      name: ws.name,
      type: ws.type,
      path: ws.path,
      profile: ws.profile,
      aidf: ws.aidf,
      projectCount: ws.projects.length,
    }));
    return c.json({ workspaces });
  });

  /** GET /workspaces/:id — workspace detail. */
  app.get('/workspaces/:id', (c) => {
    const ws = deps.workspaceManager.get(c.req.param('id'));
    if (!ws) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    return c.json({
      id: ws.id,
      name: ws.name,
      type: ws.type,
      path: ws.path,
      profile: ws.profile,
      aidf: ws.aidf,
      projects: ws.projects,
    });
  });

  /** GET /workspaces/:id/aidf — AIDF context for a workspace. */
  app.get('/workspaces/:id/aidf', (c) => {
    const ws = deps.workspaceManager.get(c.req.param('id'));
    if (!ws) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    if (!ws.aidf) {
      return c.json({ error: 'AIDF not enabled for this workspace' }, 400);
    }

    const context = deps.contextLoader.load(ws.path);
    return c.json({
      workspaceId: ws.id,
      capabilities: {
        present: context.capabilities.present,
        features: Array.from(context.capabilities.features),
        hasAgentsFile: context.capabilities.hasAgentsFile,
      },
      tasks: context.tasks,
      roles: context.roles,
      skills: context.skills,
      plans: context.plans,
    });
  });

  return app;
}
