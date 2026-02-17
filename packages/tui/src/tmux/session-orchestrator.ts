import { resolve } from 'node:path';
import { unlinkSync } from 'node:fs';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { TmuxManager } from './tmux-manager.js';
import { applyLayout, LAYOUT_PRESETS } from './layout-presets.js';
import type { PaneIds, LayoutName } from './index.js';
import { IpcServer } from '../ipc/ipc-server.js';
import type { DitLoopConfig } from '@ditloop/core';

const execFile = promisify(execFileCb);

/** Options for orchestrating a tmux session. */
export interface OrchestrateOptions {
  /** Session name. Defaults to "ditloop". */
  sessionName?: string;
  /** Working directory for the terminal pane. */
  cwd?: string;
  /** Absolute path to the ditloop CLI binary. */
  cliPath?: string;
  /** Initial layout preset. Defaults to "default". */
  layout?: LayoutName;
  /** DitLoop config for broadcasting workspace data to panels. */
  config?: DitLoopConfig;
}

/** Result of a successful orchestration. */
export interface OrchestrateResult {
  /** Tmux session name. */
  sessionName: string;
  /** IPC socket path. */
  socketPath: string;
  /** Pane identifiers. */
  paneIds: PaneIds;
  /** IPC server instance for cleanup. */
  ipcServer: IpcServer;
}

/**
 * Orchestrate a tmux session with sidebar, terminal, and git panes.
 * Spawns `ditloop --panel <type>` in side panes and starts an IPC server
 * for cross-pane communication.
 */
export class SessionOrchestrator {
  private tmux: TmuxManager;

  /** @param tmux - Optional TmuxManager instance (for testing injection) */
  constructor(tmux?: TmuxManager) {
    this.tmux = tmux ?? new TmuxManager();
  }

  /**
   * Create a tmux session with the standard DitLoop pane layout.
   *
   * @param options - Orchestration options
   * @returns Session details including pane IDs and IPC server
   */
  async orchestrate(options: OrchestrateOptions = {}): Promise<OrchestrateResult> {
    const {
      sessionName = 'ditloop',
      cwd = process.cwd(),
      cliPath = resolve(process.argv[1] ?? 'ditloop'),
      layout = 'default',
    } = options;

    // Kill any stale session with the same name
    if (await this.tmux.sessionExists(sessionName)) {
      await this.tmux.killSession(sessionName);
    }

    // Generate unique IPC socket path
    const socketPath = resolve(tmpdir(), `ditloop-${randomUUID()}.sock`);

    // Start IPC server
    const ipcServer = new IpcServer(socketPath);
    await ipcServer.start();

    // Create the tmux session (this becomes the terminal pane)
    await this.tmux.createSession(sessionName, cwd);

    // Create sidebar pane on the left (25%)
    const sidebarId = await this.tmux.createPane({
      position: 'left',
      size: 25,
      cwd,
    });

    // Send panel command to sidebar
    await this.tmux.sendKeys(sidebarId, `${cliPath} --panel sidebar --ipc ${socketPath}`);

    // Re-select the terminal pane so the git split happens on the right of it
    await this.tmux.selectPane('%0');

    // Create git pane on the right (25%)
    const gitId = await this.tmux.createPane({
      position: 'right',
      size: 25,
      cwd,
    });

    // Send panel command to git pane (source-control panel)
    await this.tmux.sendKeys(gitId, `${cliPath} --panel source-control --ipc ${socketPath}`);

    // Re-select the terminal pane so the status split happens below it
    await this.tmux.selectPane('%0');

    // Create status pane at the bottom (3 rows)
    const statusId = await this.tmux.createPane({
      position: 'bottom',
      size: 3,
      cwd,
    });

    // Send panel command to status pane
    await this.tmux.sendKeys(statusId, `${cliPath} --panel status --ipc ${socketPath}`);

    const paneIds: PaneIds = {
      sidebar: sidebarId,
      terminal: '%0', // Initial pane from createSession
      git: gitId,
      status: statusId,
    };

    // Apply the requested layout
    if (layout !== 'default') {
      await applyLayout(this.tmux, layout, paneIds);
    }

    // Bind Ctrl+1-5 to layout presets via tmux bind-key
    const layoutNames: LayoutName[] = ['default', 'code-focus', 'git-focus', 'multi-terminal', 'zen'];
    for (let i = 0; i < layoutNames.length; i++) {
      await execFile('tmux', [
        'bind-key', '-n', `C-${i + 1}`,
        'run-shell', `${cliPath} --apply-layout ${layoutNames[i]}`,
      ]);
    }

    // Focus the terminal pane
    await this.tmux.selectPane(paneIds.terminal);

    // Broadcast workspace data to panels after a short delay for IPC clients to connect
    if (options.config) {
      this.broadcastWorkspaceData(ipcServer, options.config);
    }

    return { sessionName, socketPath, paneIds, ipcServer };
  }

  /**
   * Broadcast workspace data to all connected panel IPC clients.
   * Broadcasts immediately — the IPC server caches the message and replays
   * it to clients that connect later.
   *
   * @param ipcServer - The IPC server to broadcast on
   * @param config - DitLoop config containing workspaces and profiles
   */
  private broadcastWorkspaceData(ipcServer: IpcServer, config: DitLoopConfig): void {
    const workspaces = (config.workspaces ?? []).map((ws, i) => ({
      name: ws.name,
      profile: ws.profile,
      email: config.profiles[ws.profile]?.email,
      platform: config.profiles[ws.profile]?.platform,
      active: i === 0,
    }));

    ipcServer.broadcast({
      type: 'workspace-changed',
      payload: { workspaces },
    });
  }

  /**
   * Clean up a tmux session: kill the session, stop IPC, remove socket file.
   *
   * @param result - The orchestration result to clean up
   */
  async cleanup(result: OrchestrateResult): Promise<void> {
    try {
      await this.tmux.killSession(result.sessionName);
    } catch {
      // Session may already be dead
    }

    await result.ipcServer.stop();

    try {
      unlinkSync(result.socketPath);
    } catch {
      // Socket file may already be gone
    }
  }
}
