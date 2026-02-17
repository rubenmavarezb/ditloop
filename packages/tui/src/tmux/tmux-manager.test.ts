import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TmuxManager } from './tmux-manager.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));

import { execFile as execFileCb } from 'node:child_process';

function mockExecFile(stdout = '', stderr = '') {
  (execFileCb as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (_cmd: string, _args: string[], cb: (err: Error | null, result: { stdout: string; stderr: string }) => void) => {
      cb(null, { stdout, stderr });
    },
  );
}

function mockExecFileError() {
  (execFileCb as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (_cmd: string, _args: string[], cb: (err: Error | null) => void) => {
      cb(new Error('command failed'));
    },
  );
}

describe('TmuxManager', () => {
  let manager: TmuxManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new TmuxManager();
  });

  it('isTmuxAvailable returns true when tmux exists', async () => {
    mockExecFile('tmux 3.4');
    expect(await manager.isTmuxAvailable()).toBe(true);
  });

  it('isTmuxAvailable returns false when tmux missing', async () => {
    mockExecFileError();
    expect(await manager.isTmuxAvailable()).toBe(false);
  });

  it('isInsideTmux checks TMUX env var', () => {
    const original = process.env['TMUX'];
    process.env['TMUX'] = '/tmp/tmux-1000/default,1234,0';
    expect(manager.isInsideTmux()).toBe(true);
    delete process.env['TMUX'];
    expect(manager.isInsideTmux()).toBe(false);
    if (original) process.env['TMUX'] = original;
  });

  it('getVersion parses tmux version', async () => {
    mockExecFile('tmux 3.4\n');
    expect(await manager.getVersion()).toBe('3.4');
  });

  it('getVersion returns undefined on error', async () => {
    mockExecFileError();
    expect(await manager.getVersion()).toBeUndefined();
  });

  it('createSession builds correct args', async () => {
    mockExecFile();
    await manager.createSession('test-session', '/tmp');
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['new-session', '-d', '-s', 'test-session', '-c', '/tmp'],
      expect.any(Function),
    );
  });

  it('createPane builds split-window args for right pane', async () => {
    mockExecFile('%1\n');
    const id = await manager.createPane({ position: 'right', size: 25 });
    expect(id).toBe('%1');
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['split-window', '-P', '-F', '#{pane_id}', '-h', '-l', '25%'],
      expect.any(Function),
    );
  });

  it('createPane builds split-window args for left pane', async () => {
    mockExecFile('%2\n');
    await manager.createPane({ position: 'left', size: 30 });
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['split-window', '-P', '-F', '#{pane_id}', '-h', '-b', '-l', '30%'],
      expect.any(Function),
    );
  });

  it('sendKeys sends to correct pane', async () => {
    mockExecFile();
    await manager.sendKeys('%0', 'ls -la');
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['send-keys', '-t', '%0', 'ls -la', 'Enter'],
      expect.any(Function),
    );
  });

  it('resizePane sends resize command', async () => {
    mockExecFile();
    await manager.resizePane('%0', 'x', 80);
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['resize-pane', '-t', '%0', '-x', '80'],
      expect.any(Function),
    );
  });

  it('listPanes parses output', async () => {
    mockExecFile('%0:0:80:24:1:bash\n%1:1:40:24:0:vim\n');
    const panes = await manager.listPanes();
    expect(panes).toHaveLength(2);
    expect(panes[0]).toEqual({ id: '%0', index: 0, width: 80, height: 24, active: true, title: 'bash' });
    expect(panes[1]).toEqual({ id: '%1', index: 1, width: 40, height: 24, active: false, title: 'vim' });
  });

  it('killSession calls correct command', async () => {
    mockExecFile();
    await manager.killSession('my-session');
    expect(execFileCb).toHaveBeenCalledWith(
      'tmux',
      ['kill-session', '-t', 'my-session'],
      expect.any(Function),
    );
  });

  it('sessionExists returns true for existing session', async () => {
    mockExecFile();
    expect(await manager.sessionExists('test')).toBe(true);
  });

  it('sessionExists returns false for missing session', async () => {
    mockExecFileError();
    expect(await manager.sessionExists('nope')).toBe(false);
  });
});
