import type { TmuxManager } from './tmux-manager.js';

/** A terminal instance running in a tmux pane. */
export interface TerminalInstance {
  /** tmux pane identifier. */
  paneId: string;
  /** Absolute workspace path. */
  workspacePath: string;
  /** Display name of the workspace. */
  workspaceName: string;
  /** Whether this terminal is currently focused. */
  active: boolean;
}

/**
 * Manage multiple terminal panes, each cd'd to a different workspace.
 */
export class MultiTerminalManager {
  private terminals: TerminalInstance[] = [];
  private activeIndex = 0;

  /**
   * @param tmux - TmuxManager instance for pane operations
   */
  constructor(private readonly tmux: TmuxManager) {}

  /**
   * Add a new terminal pane for a workspace.
   *
   * @param workspacePath - Absolute path to the workspace
   * @param workspaceName - Display name
   * @returns The created terminal instance
   */
  async addTerminal(workspacePath: string, workspaceName: string): Promise<TerminalInstance> {
    const paneId = await this.tmux.createPane({ position: 'right', size: 50, cwd: workspacePath });
    const instance: TerminalInstance = { paneId, workspacePath, workspaceName, active: false };
    this.terminals.push(instance);
    if (this.terminals.length === 1) {
      instance.active = true;
      this.activeIndex = 0;
    }
    return instance;
  }

  /**
   * Remove a terminal pane.
   *
   * @param paneId - Pane identifier to remove
   */
  async removeTerminal(paneId: string): Promise<void> {
    const idx = this.terminals.findIndex((t) => t.paneId === paneId);
    if (idx === -1) return;
    await this.tmux.killPane(paneId);
    this.terminals.splice(idx, 1);
    if (this.terminals.length > 0) {
      this.activeIndex = Math.min(this.activeIndex, this.terminals.length - 1);
      this.terminals.forEach((t, i) => { t.active = i === this.activeIndex; });
      await this.tmux.selectPane(this.terminals[this.activeIndex].paneId);
    }
  }

  /**
   * Focus the next terminal pane in the list.
   */
  async focusNext(): Promise<void> {
    if (this.terminals.length === 0) return;
    this.terminals[this.activeIndex].active = false;
    this.activeIndex = (this.activeIndex + 1) % this.terminals.length;
    this.terminals[this.activeIndex].active = true;
    await this.tmux.selectPane(this.terminals[this.activeIndex].paneId);
  }

  /**
   * Focus the previous terminal pane in the list.
   */
  async focusPrev(): Promise<void> {
    if (this.terminals.length === 0) return;
    this.terminals[this.activeIndex].active = false;
    this.activeIndex = (this.activeIndex - 1 + this.terminals.length) % this.terminals.length;
    this.terminals[this.activeIndex].active = true;
    await this.tmux.selectPane(this.terminals[this.activeIndex].paneId);
  }

  /**
   * Get all active terminal instances.
   *
   * @returns Array of terminal instances
   */
  getTerminals(): TerminalInstance[] {
    return [...this.terminals];
  }

  /**
   * Get the currently focused terminal.
   *
   * @returns The active terminal, or undefined if none
   */
  getActiveTerminal(): TerminalInstance | undefined {
    return this.terminals[this.activeIndex];
  }
}
