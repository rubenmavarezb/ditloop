import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildContextString } from './context-builder.js';
import type { LaunchContext } from './context-builder.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('# Role content'),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

describe('context-builder', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('builds context with workspace info', async () => {
    const ctx: LaunchContext = { workspacePath: '/test', workspaceName: 'test-ws' };
    const result = await buildContextString(ctx);
    expect(result).toContain('test-ws');
    expect(result).toContain('/test');
  });

  it('includes git identity when provided', async () => {
    const ctx: LaunchContext = {
      workspacePath: '/test', workspaceName: 'test',
      gitIdentity: { name: 'Dev', email: 'dev@test.com' },
    };
    const result = await buildContextString(ctx);
    expect(result).toContain('dev@test.com');
  });

  it('includes AIDF content when paths provided', async () => {
    const ctx: LaunchContext = {
      workspacePath: '/test', workspaceName: 'test',
      aidf: { rolePath: '/test/.ai/role.md' },
    };
    const result = await buildContextString(ctx);
    expect(result).toContain('Role content');
  });
});
