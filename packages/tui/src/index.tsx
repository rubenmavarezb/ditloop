import { render } from 'ink';
import { spawnSync } from 'node:child_process';
import { version, loadConfig, EventBus, WorkspaceManager, ProfileManager } from '@ditloop/core';
import type { WorkspaceItemData } from '@ditloop/ui';
import type { ResolvedWorkspace } from '@ditloop/core';
import { App } from './app.js';
import { useAppStore } from './state/app-store.js';
import { InitWizard } from './commands/init.js';
import { WorkspaceList } from './commands/workspace.js';
import { ProfileList, ProfileCurrent } from './commands/profile.js';
import { ScaffoldWizard } from './commands/scaffold.js';
import { startServer, stopServer, restartServer, getServerStatus } from './commands/server.js';
import { TmuxManager } from './tmux/tmux-manager.js';
import { SessionOrchestrator } from './tmux/session-orchestrator.js';
import { PanelRenderer } from './panels/panel-renderer.js';
import type { PanelType } from './panels/panel-renderer.js';

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

/** Parse a named flag from argv (e.g. --panel sidebar → "sidebar"). */
function parseFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const panelType = parseFlag('--panel') as PanelType | undefined;
const ipcPath = parseFlag('--ipc');

const HELP = `
◉ ditloop v${version} — Terminal IDE centered on Developer In The Loop

Usage:
  ditloop                  Launch the TUI dashboard (tmux if available)
  ditloop init             Interactive setup wizard
  ditloop workspace list   List configured workspaces
  ditloop profile list     List configured profiles
  ditloop profile current  Show current git identity
  ditloop scaffold [type]  Scaffold AIDF file (task, role, skill, plan)
  ditloop server <cmd>     Server management (start, stop, restart, status)
  ditloop --version        Print version
  ditloop --help           Show this help
`.trim();

async function main() {
  // --version
  if (command === '--version' || command === '-v') {
    console.log(`ditloop v${version}`);
    process.exit(0);
  }

  // --help
  if (command === '--help' || command === '-h') {
    console.log(HELP);
    process.exit(0);
  }

  // init command
  if (command === 'init') {
    render(<InitWizard />);
    return;
  }

  // ── Panel mode: render a single panel in an Ink instance ──
  if (panelType) {
    const validPanels: PanelType[] = ['sidebar', 'source-control', 'git', 'status'];
    if (!validPanels.includes(panelType)) {
      console.error(`Unknown panel type: ${panelType}. Valid: ${validPanels.join(', ')}`);
      process.exit(1);
    }

    render(<PanelRenderer type={panelType} ipcPath={ipcPath ?? ''} />);
    return;
  }

  // Load config for all other commands
  const config = await loadConfig().catch(() => {
    console.error('Failed to load config. Run `ditloop init` to create one.');
    return process.exit(1) as never;
  });

  const eventBus = new EventBus();

  // workspace commands
  if (command === 'workspace') {
    const wm = new WorkspaceManager(config, eventBus);
    const workspaces = wm.list().map(toWorkspaceItemData);

    if (subcommand === 'list' || !subcommand) {
      render(<WorkspaceList workspaces={workspaces} />);
      return;
    }

    console.error(`Unknown workspace subcommand: ${subcommand}`);
    process.exit(1);
  }

  // profile commands
  if (command === 'profile') {
    const pm = new ProfileManager(config, eventBus);

    if (subcommand === 'list' || !subcommand) {
      const profiles = Object.entries(pm.list());
      render(<ProfileList profiles={profiles} />);
      return;
    }

    if (subcommand === 'current') {
      const email = await pm.getCurrent();
      render(<ProfileCurrent name={email ? 'active' : undefined} email={email ?? undefined} />);
      return;
    }

    console.error(`Unknown profile subcommand: ${subcommand}`);
    process.exit(1);
  }

  // server commands
  if (command === 'server') {
    switch (subcommand) {
      case 'start': {
        const result = startServer();
        console.log(result.message);
        process.exit(result.success ? 0 : 1);
        break;
      }
      case 'stop': {
        const result = stopServer();
        console.log(result.message);
        process.exit(result.success ? 0 : 1);
        break;
      }
      case 'restart': {
        const result = restartServer();
        console.log(result.message);
        process.exit(result.success ? 0 : 1);
        break;
      }
      case 'status': {
        const status = getServerStatus();
        console.log(status.running ? `Server running (PID ${status.pid})` : 'Server not running');
        process.exit(0);
        break;
      }
      default:
        console.error(`Unknown server subcommand: ${subcommand ?? '(none)'}`);
        console.log('Usage: ditloop server start|stop|restart|status');
        process.exit(1);
    }
    return;
  }

  // scaffold command
  if (command === 'scaffold') {
    const type = subcommand as 'task' | 'role' | 'skill' | 'plan' | undefined;
    const validTypes = ['task', 'role', 'skill', 'plan'];
    render(
      <ScaffoldWizard
        workspacePath={process.cwd()}
        preselectedType={type && validTypes.includes(type) ? type : undefined}
      />,
    );
    return;
  }

  // Unknown command
  if (command) {
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
  }

  // ── Default: launch TUI ──
  // Decide between orchestrator mode (tmux) and fallback (Ink dashboard)
  const tmux = new TmuxManager();
  const tmuxAvailable = await tmux.isTmuxAvailable();
  const insideTmux = tmux.isInsideTmux();

  if (tmuxAvailable && !insideTmux) {
    // Load config early so we can pass workspace data to the orchestrator
    const tmuxConfig = await loadConfig().catch(() => undefined);

    // Orchestrator mode: create tmux session with panels
    const orchestrator = new SessionOrchestrator(tmux);
    const result = await orchestrator.orchestrate({
      cwd: process.cwd(),
      config: tmuxConfig,
    });

    // Attach user to the tmux session (blocks until session exits)
    spawnSync('tmux', ['attach-session', '-t', result.sessionName], {
      stdio: 'inherit',
    });

    // Session ended — clean up
    await orchestrator.cleanup(result);
    return;
  }

  // ── Dashboard fallback: no tmux or already inside tmux ──
  if (!tmuxAvailable) {
    console.log('⚠ tmux not found. Falling back to Ink dashboard.');
    console.log('  Install tmux for the full multi-pane experience.');
    console.log('');
  }

  const wm = new WorkspaceManager(config, eventBus);
  const pm = new ProfileManager(config, eventBus);
  const workspaces = wm.list().map(toWorkspaceItemData);
  const currentEmail = await pm.getCurrent();

  useAppStore.getState().init(workspaces, currentEmail ?? undefined);

  // Enter alternate screen buffer for full-screen TUI (like lazygit, vim)
  process.stdout.write('\x1b[?1049h');
  process.stdout.write('\x1b[H\x1b[2J');

  const instance = render(<App />);

  // Restore original screen on exit
  const restore = () => {
    process.stdout.write('\x1b[?1049l');
  };

  instance.waitUntilExit().then(restore);
  process.on('exit', restore);
  process.on('SIGINT', () => {
    restore();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    restore();
    process.exit(0);
  });
}

/**
 * Convert a ResolvedWorkspace to a WorkspaceItemData for the UI.
 */
function toWorkspaceItemData(ws: ResolvedWorkspace): WorkspaceItemData {
  return {
    name: ws.name,
    type: ws.type,
    projectCount: ws.projects.length,
    status: 'idle',
    path: ws.path,
    aidfPath: ws.aidf ? `${ws.path}/.ai` : undefined,
  };
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
