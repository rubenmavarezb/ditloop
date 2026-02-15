import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tokenAuthMiddleware } from './token-auth.js';

// Mock the filesystem for getOrCreateToken
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

describe('tokenAuthMiddleware', () => {
  const TEST_TOKEN = 'test-token-123';
  let middleware: ReturnType<typeof tokenAuthMiddleware>;

  beforeEach(() => {
    middleware = tokenAuthMiddleware(TEST_TOKEN);
  });

  it('should skip auth for /api/health', async () => {
    let nextCalled = false;
    const c = {
      req: {
        path: '/api/health',
        header: vi.fn(),
      },
    } as any;

    const result = await middleware(c, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });

  it('should reject missing Authorization header', async () => {
    const jsonFn = vi.fn().mockReturnValue('response');
    const c = {
      req: {
        path: '/api/workspaces',
        header: vi.fn().mockReturnValue(undefined),
      },
      json: jsonFn,
    } as any;

    await middleware(c, async () => {});
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Missing Authorization header' }, 401);
  });

  it('should reject invalid token', async () => {
    const jsonFn = vi.fn().mockReturnValue('response');
    const c = {
      req: {
        path: '/api/workspaces',
        header: vi.fn().mockReturnValue('Bearer wrong-token'),
      },
      json: jsonFn,
    } as any;

    await middleware(c, async () => {});
    expect(jsonFn).toHaveBeenCalledWith({ error: 'Invalid token' }, 401);
  });

  it('should allow valid Bearer token', async () => {
    let nextCalled = false;
    const c = {
      req: {
        path: '/api/workspaces',
        header: vi.fn().mockReturnValue(`Bearer ${TEST_TOKEN}`),
      },
    } as any;

    await middleware(c, async () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
  });
});
