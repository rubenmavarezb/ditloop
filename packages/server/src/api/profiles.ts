import { Hono } from 'hono';
import type { ProfileManager } from '@ditloop/core';

/** Options for creating profile routes. */
export interface ProfileRouteDeps {
  profileManager: ProfileManager;
}

/**
 * Create profile API routes.
 *
 * @param deps - Injected dependencies (ProfileManager)
 * @returns Hono router with profile endpoints
 */
export function createProfileRoutes(deps: ProfileRouteDeps) {
  const app = new Hono();

  /** GET /profiles — list all profiles. */
  app.get('/profiles', (c) => {
    const profiles = deps.profileManager.list();
    const entries = Object.entries(profiles).map(([key, profile]) => ({
      key,
      name: profile.name,
      email: profile.email,
      sshHost: profile.sshHost,
      platform: profile.platform,
    }));
    return c.json({ profiles: entries });
  });

  /** GET /profiles/current — get active git identity. */
  app.get('/profiles/current', async (c) => {
    const current = await deps.profileManager.getCurrent();
    return c.json({ email: current ?? null });
  });

  return app;
}
