import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiTerminalManager } from './multi-terminal.js';
import type { TmuxManager } from './tmux-manager.js';

describe('MultiTerminalManager', () => {
  let mockTmux: TmuxManager;
  let manager: MultiTerminalManager;
  let paneCounter: number;

  beforeEach(() => {
    paneCounter = 0;
    mockTmux = {
      createPane: vi.fn().mockImplementation(async () => `%${paneCounter++}`),
      killPane: vi.fn().mockResolvedValue(undefined),
      selectPane: vi.fn().mockResolvedValue(undefined),
    } as unknown as TmuxManager;
    manager = new MultiTerminalManager(mockTmux);
  });

  it('adds a terminal', async () => {
    const t = await manager.addTerminal('/home/user/project', 'project');
    expect(t.paneId).toBe('%0');
    expect(t.workspaceName).toBe('project');
    expect(t.active).toBe(true);
    expect(manager.getTerminals()).toHaveLength(1);
  });

  it('removes a terminal', async () => {
    await manager.addTerminal('/p1', 'p1');
    const t2 = await manager.addTerminal('/p2', 'p2');
    await manager.removeTerminal(t2.paneId);
    expect(manager.getTerminals()).toHaveLength(1);
    expect(mockTmux.killPane).toHaveBeenCalledWith(t2.paneId);
  });

  it('cycles focus forward', async () => {
    await manager.addTerminal('/p1', 'p1');
    await manager.addTerminal('/p2', 'p2');
    await manager.focusNext();
    expect(manager.getActiveTerminal()?.workspaceName).toBe('p2');
    await manager.focusNext();
    expect(manager.getActiveTerminal()?.workspaceName).toBe('p1');
  });

  it('cycles focus backward', async () => {
    await manager.addTerminal('/p1', 'p1');
    await manager.addTerminal('/p2', 'p2');
    await manager.focusPrev();
    expect(manager.getActiveTerminal()?.workspaceName).toBe('p2');
  });

  it('returns undefined for empty manager', () => {
    expect(manager.getActiveTerminal()).toBeUndefined();
  });
});
