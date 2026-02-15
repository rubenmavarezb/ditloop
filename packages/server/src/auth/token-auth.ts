import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type { Context, Next } from 'hono';

/** Default path for the server authentication token. */
const TOKEN_PATH = join(homedir(), '.ditloop', 'server-token');

/**
 * Read the server token from disk. Auto-generates one if it doesn't exist.
 *
 * @returns The authentication token string
 */
export function getOrCreateToken(): string {
  if (existsSync(TOKEN_PATH)) {
    return readFileSync(TOKEN_PATH, 'utf-8').trim();
  }

  const dir = dirname(TOKEN_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const token = randomBytes(32).toString('hex');
  writeFileSync(TOKEN_PATH, token, { mode: 0o600 });
  return token;
}

/**
 * Create a Hono middleware that validates Bearer token authentication.
 * Skips auth for the /api/health endpoint.
 *
 * @param token - The expected authentication token
 * @returns Hono middleware function
 */
export function tokenAuthMiddleware(token: string) {
  return async (c: Context, next: Next) => {
    // Skip auth for health check
    if (c.req.path === '/api/health') {
      return next();
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Missing Authorization header' }, 401);
    }

    const [scheme, value] = authHeader.split(' ');
    if (scheme !== 'Bearer' || value !== token) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    return next();
  };
}
