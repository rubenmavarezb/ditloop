import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CLI_DEFINITIONS, detectAvailableClis, buildLaunchCommand } from './cli-launcher.js';
import type { LaunchContext } from './context-builder.js';

vi.mock('node:child_process', () => ({ execFile: vi.fn() }));
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(''),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

import { execFile as execFileCb } from 'node:child_process';

describe('cli-launcher', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('CLI_DEFINITIONS has 4 entries', () => {
    expect(CLI_DEFINITIONS).toHaveLength(4);
  });

  it('detectAvailableClis finds available CLIs', async () => {
    (execFileCb as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_cmd: string, _args: string[], cb: (err: Error | null, r: { stdout: string }) => void) => {
        const bin = _args[0];
        if (bin === 'claude') cb(null, { stdout: '/usr/local/bin/claude\n' });
        else cb(new Error('not found'), { stdout: '' });
      },
    );
    const available = await detectAvailableClis();
    expect(available.map((c) => c.id)).toContain('claude');
  });

  it('buildLaunchCommand adds env vars for generic CLI', async () => {
    const ctx: LaunchContext = { workspacePath: '/test', workspaceName: 'test' };
    const cli = CLI_DEFINITIONS.find((c) => c.id === 'generic')!;
    const result = await buildLaunchCommand(cli, ctx, '/tmp');
    expect(result.env['DITLOOP_WORKSPACE']).toBe('/test');
    expect(result.env['DITLOOP_WORKSPACE_NAME']).toBe('test');
  });
});
