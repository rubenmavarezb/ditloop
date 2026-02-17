import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionOrchestrator } from './session-orchestrator.js';
import type { TmuxManager } from './tmux-manager.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn((_cmd: string, _args: string[], cb: Function) => cb(null, { stdout: '', stderr: '' })),
}));

function createMockTmux(): TmuxManager {
  let paneCounter = 0;
  return {
    isTmuxAvailable: vi.fn().mockResolvedValue(true),
    isInsideTmux: vi.fn().mockReturnValue(false),
    getVersion: vi.fn().mockResolvedValue('3.4'),
    createSession: vi.fn().mockResolvedValue(undefined),
    attachSession: vi.fn().mockResolvedValue(undefined),
    sessionExists: vi.fn().mockResolvedValue(false),
    createPane: vi.fn().mockImplementation(async () => `%${++paneCounter}`),
    sendKeys: vi.fn().mockResolvedValue(undefined),
    resizePane: vi.fn().mockResolvedValue(undefined),
    selectPane: vi.fn().mockResolvedValue(undefined),
    killPane: vi.fn().mockResolvedValue(undefined),
    killSession: vi.fn().mockResolvedValue(undefined),
    listPanes: vi.fn().mockResolvedValue([]),
    setOption: vi.fn().mockResolvedValue(undefined),
  } as unknown as TmuxManager;
}

describe('SessionOrchestrator', () => {
  let mockTmux: TmuxManager;
  let orchestrator: SessionOrchestrator;

  beforeEach(() => {
    mockTmux = createMockTmux();
    orchestrator = new SessionOrchestrator(mockTmux);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
  });

  it('creates a tmux session with the given name', async () => {
    const result = await orchestrator.orchestrate({ sessionName: 'test-session', cwd: '/tmp' });

    expect(mockTmux.createSession).toHaveBeenCalledWith('test-session', '/tmp');
    expect(result.sessionName).toBe('test-session');
  });

  it('creates sidebar, git, and status panes', async () => {
    await orchestrator.orchestrate({ cwd: '/tmp' });

    expect(mockTmux.createPane).toHaveBeenCalledTimes(3);
    expect(mockTmux.createPane).toHaveBeenCalledWith({
      position: 'left',
      size: 25,
      cwd: '/tmp',
    });
    expect(mockTmux.createPane).toHaveBeenCalledWith({
      position: 'right',
      size: 25,
      cwd: '/tmp',
    });
    expect(mockTmux.createPane).toHaveBeenCalledWith({
      position: 'bottom',
      size: 3,
      cwd: '/tmp',
    });
  });

  it('sends --panel commands to sidebar, source-control, and status panes', async () => {
    const result = await orchestrator.orchestrate({ cwd: '/tmp' });

    expect(mockTmux.sendKeys).toHaveBeenCalledTimes(3);

    const sidebarCall = (mockTmux.sendKeys as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(sidebarCall[0]).toBe(result.paneIds.sidebar);
    expect(sidebarCall[1]).toContain('--panel sidebar');
    expect(sidebarCall[1]).toContain('--ipc');

    const gitCall = (mockTmux.sendKeys as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(gitCall[0]).toBe(result.paneIds.git);
    expect(gitCall[1]).toContain('--panel source-control');
    expect(gitCall[1]).toContain('--ipc');

    const statusCall = (mockTmux.sendKeys as ReturnType<typeof vi.fn>).mock.calls[2];
    expect(statusCall[0]).toBe(result.paneIds.status);
    expect(statusCall[1]).toContain('--panel status');
    expect(statusCall[1]).toContain('--ipc');
  });

  it('starts IPC server with a socket path', async () => {
    const result = await orchestrator.orchestrate();

    expect(result.socketPath).toContain('ditloop-');
    expect(result.socketPath).toContain('.sock');
    expect(result.ipcServer).toBeDefined();
  });

  it('focuses the terminal pane after setup', async () => {
    const result = await orchestrator.orchestrate();

    // selectPane is called: once before git split, once before status split, once for final focus
    const calls = (mockTmux.selectPane as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[calls.length - 1][0]).toBe(result.paneIds.terminal);
  });

  it('returns correct pane IDs', async () => {
    const result = await orchestrator.orchestrate();

    expect(result.paneIds.sidebar).toBe('%1');
    expect(result.paneIds.git).toBe('%2');
    expect(result.paneIds.status).toBe('%3');
    expect(result.paneIds.terminal).toBe('%0');
  });

  it('cleanup kills session and stops IPC', async () => {
    const result = await orchestrator.orchestrate({ sessionName: 'cleanup-test' });

    await orchestrator.cleanup(result);

    expect(mockTmux.killSession).toHaveBeenCalledWith('cleanup-test');
  });

  it('cleanup handles already-dead session gracefully', async () => {
    (mockTmux.killSession as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('no session'));

    const result = await orchestrator.orchestrate();
    await expect(orchestrator.cleanup(result)).resolves.not.toThrow();
  });

  it('binds Ctrl+1-5 layout shortcuts', async () => {
    const { execFile } = await import('node:child_process');
    await orchestrator.orchestrate();

    const bindCalls = (execFile as unknown as ReturnType<typeof vi.fn>).mock.calls
      .filter((c: unknown[]) => c[1] && (c[1] as string[])[0] === 'bind-key');
    expect(bindCalls).toHaveLength(5);
  });
});
