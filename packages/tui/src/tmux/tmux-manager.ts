import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCb);

/** Options for creating a new tmux pane. */
export interface CreatePaneOptions {
  /** Split direction relative to the current pane. */
  position: 'left' | 'right' | 'top' | 'bottom';
  /** Size of the new pane as a percentage. */
  size: number;
  /** Working directory for the new pane. */
  cwd?: string;
  /** Command to run in the new pane. */
  command?: string;
}

/** Information about a tmux pane. */
export interface PaneInfo {
  /** Unique pane identifier (e.g. "%0"). */
  id: string;
  /** Zero-based pane index within the window. */
  index: number;
  /** Pane width in columns. */
  width: number;
  /** Pane height in rows. */
  height: number;
  /** Whether this pane is currently focused. */
  active: boolean;
  /** Pane title string. */
  title: string;
}

/** IDs for the standard DitLoop pane layout. */
export interface PaneIds {
  /** Sidebar pane identifier. */
  sidebar: string;
  /** Main terminal pane identifier. */
  terminal: string;
  /** Git panel pane identifier. */
  git: string;
  /** Status bar pane identifier. */
  status?: string;
}

/**
 * Manage tmux sessions, panes, and layouts via the tmux CLI.
 */
export class TmuxManager {
  /**
   * Check if the tmux CLI is available on the system.
   *
   * @returns true when tmux -V exits successfully
   */
  async isTmuxAvailable(): Promise<boolean> {
    try {
      await execFile('tmux', ['-V']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the current process is running inside a tmux session.
   *
   * @returns true when the TMUX environment variable is set
   */
  isInsideTmux(): boolean {
    return !!process.env['TMUX'];
  }

  /**
   * Get the tmux version string.
   *
   * @returns The version string, or undefined if tmux is not available
   */
  async getVersion(): Promise<string | undefined> {
    try {
      const { stdout } = await execFile('tmux', ['-V']);
      const match = stdout.trim().match(/tmux\s+(.+)/);
      return match ? match[1] : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Create a new tmux session.
   *
   * @param name - Session name
   * @param cwd - Working directory for the initial window
   */
  async createSession(name: string, cwd?: string): Promise<void> {
    const args = ['new-session', '-d', '-s', name];
    if (cwd) args.push('-c', cwd);
    await execFile('tmux', args);
  }

  /**
   * Attach to an existing tmux session.
   *
   * @param name - Session name to attach to
   */
  async attachSession(name: string): Promise<void> {
    await execFile('tmux', ['attach-session', '-t', name]);
  }

  /**
   * Check if a session with the given name exists.
   *
   * @param name - Session name to look up
   * @returns true when the session exists
   */
  async sessionExists(name: string): Promise<boolean> {
    try {
      await execFile('tmux', ['has-session', '-t', name]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new pane by splitting the current one.
   *
   * @param options - Pane creation options
   * @returns The pane ID of the newly created pane
   */
  async createPane(options: CreatePaneOptions): Promise<string> {
    const args = ['split-window', '-P', '-F', '#{pane_id}'];
    if (options.position === 'left' || options.position === 'right') args.push('-h');
    if (options.position === 'left' || options.position === 'top') args.push('-b');
    args.push('-l', `${options.size}%`);
    if (options.cwd) args.push('-c', options.cwd);
    const { stdout } = await execFile('tmux', args);
    const paneId = stdout.trim();
    if (options.command) await this.sendKeys(paneId, options.command);
    return paneId;
  }

  /**
   * Send keystrokes to a specific pane.
   *
   * @param paneId - Target pane identifier
   * @param keys - Keystrokes to send (followed by Enter)
   */
  async sendKeys(paneId: string, keys: string): Promise<void> {
    await execFile('tmux', ['send-keys', '-t', paneId, keys, 'Enter']);
  }

  /**
   * Resize a pane in the given direction.
   *
   * @param paneId - Target pane identifier
   * @param direction - Resize axis: 'x' for width, 'y' for height
   * @param size - New size in columns (x) or rows (y)
   */
  async resizePane(paneId: string, direction: 'x' | 'y', size: number): Promise<void> {
    const flag = direction === 'x' ? '-x' : '-y';
    await execFile('tmux', ['resize-pane', '-t', paneId, flag, String(size)]);
  }

  /**
   * Select (focus) a specific pane.
   *
   * @param paneId - Target pane identifier
   */
  async selectPane(paneId: string): Promise<void> {
    await execFile('tmux', ['select-pane', '-t', paneId]);
  }

  /**
   * Kill a specific pane.
   *
   * @param paneId - Pane identifier to kill
   */
  async killPane(paneId: string): Promise<void> {
    await execFile('tmux', ['kill-pane', '-t', paneId]);
  }

  /**
   * Kill the entire session.
   *
   * @param name - Session name to kill; omit for the current session
   */
  async killSession(name?: string): Promise<void> {
    const args = ['kill-session'];
    if (name) args.push('-t', name);
    await execFile('tmux', args);
  }

  /**
   * List all panes in the current session.
   *
   * @returns Array of pane information objects
   */
  async listPanes(): Promise<PaneInfo[]> {
    const format = '#{pane_id}:#{pane_index}:#{pane_width}:#{pane_height}:#{pane_active}:#{pane_title}';
    const { stdout } = await execFile('tmux', ['list-panes', '-F', format]);
    return stdout.trim().split('\n').filter(Boolean).map((line) => {
      const [id, indexStr, widthStr, heightStr, activeStr, ...titleParts] = line.split(':');
      return {
        id: id ?? '',
        index: parseInt(indexStr ?? '0', 10),
        width: parseInt(widthStr ?? '0', 10),
        height: parseInt(heightStr ?? '0', 10),
        active: activeStr === '1',
        title: titleParts.join(':'),
      };
    });
  }

  /**
   * Set a tmux option.
   *
   * @param option - Option name
   * @param value - Option value
   * @param global - When true, sets the option globally with -g
   */
  async setOption(option: string, value: string, global?: boolean): Promise<void> {
    const args = ['set-option'];
    if (global) args.push('-g');
    args.push(option, value);
    await execFile('tmux', args);
  }
}
