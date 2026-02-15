import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerStatus } from './server.js';

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

describe('server commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getServerStatus returns not running when no PID file', () => {
    const status = getServerStatus();
    expect(status.running).toBe(false);
    expect(status.pid).toBeUndefined();
  });
});
