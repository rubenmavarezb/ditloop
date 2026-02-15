import { Hono } from 'hono';
import type { ApprovalEngine, Action } from '@ditloop/core';

/** Pending approval tracking entry. */
export interface PendingApproval {
  id: string;
  action: string;
  detail: string;
  workspace: string;
  receivedAt: number;
}

/** Options for creating approval routes. */
export interface ApprovalRouteDeps {
  getApprovalEngine: () => ApprovalEngine | undefined;
}

/** Timeout for auto-rejecting pending approvals (5 minutes). */
const APPROVAL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Create approval API routes with first-response-wins semantics.
 *
 * @param deps - Injected dependencies (ApprovalEngine getter)
 * @returns Hono router with approval endpoints
 */
export function createApprovalRoutes(deps: ApprovalRouteDeps) {
  const app = new Hono();
  const answeredIds = new Set<string>();

  /** GET /approvals — list pending approvals. */
  app.get('/approvals', (c) => {
    const engine = deps.getApprovalEngine();
    if (!engine) {
      return c.json({ approvals: [] });
    }

    const pending = engine.pendingActions
      .filter((a) => a.status === 'pending')
      .map((a) => ({
        id: a.id,
        type: a.action.type,
        detail: JSON.stringify(a.action),
        status: a.status,
      }));

    return c.json({ approvals: pending });
  });

  /** POST /approvals/:id — submit approval response. */
  app.post('/approvals/:id', async (c) => {
    const engine = deps.getApprovalEngine();
    if (!engine) {
      return c.json({ error: 'No active approval engine' }, 404);
    }

    const id = c.req.param('id');

    // First-response-wins: reject duplicates
    if (answeredIds.has(id)) {
      return c.json({ error: 'Approval already answered' }, 409);
    }

    const body = await c.req.json<{
      response: 'approve' | 'reject' | 'edit';
      reason?: string;
      editedAction?: Action;
    }>();

    if (!body.response || !['approve', 'reject', 'edit'].includes(body.response)) {
      return c.json({ error: 'response must be approve, reject, or edit' }, 400);
    }

    try {
      answeredIds.add(id);

      // Auto-cleanup after timeout
      setTimeout(() => answeredIds.delete(id), APPROVAL_TIMEOUT_MS);

      switch (body.response) {
        case 'approve':
          engine.approveOne(id);
          break;
        case 'reject':
          engine.reject(id, body.reason);
          break;
        case 'edit':
          if (!body.editedAction) {
            answeredIds.delete(id);
            return c.json({ error: 'editedAction required for edit response' }, 400);
          }
          engine.edit(id, body.editedAction);
          break;
      }

      return c.json({ status: 'accepted', id, response: body.response });
    } catch (error) {
      answeredIds.delete(id);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ error: message }, 404);
    }
  });

  return app;
}
