import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkTmuxAvailable } from './toggle-mode.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
  spawn: vi.fn(),
}));

import { execFile as execFileCb } from 'node:child_process';

describe('toggle-mode', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('checkTmuxAvailable returns true when tmux found', async () => {
    (execFileCb as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_cmd: string, _args: string[], cb: (err: Error | null, result: { stdout: string }) => void) => {
        cb(null, { stdout: '/usr/bin/tmux\n' });
      },
    );
    expect(await checkTmuxAvailable()).toBe(true);
  });

  it('checkTmuxAvailable returns false when tmux missing', async () => {
    (execFileCb as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_cmd: string, _args: string[], cb: (err: Error | null) => void) => {
        cb(new Error('not found'));
      },
    );
    expect(await checkTmuxAvailable()).toBe(false);
  });
});
