import { render } from 'ink';
import { version, loadConfig, EventBus, WorkspaceManager, ProfileManager } from '@ditloop/core';
import type { WorkspaceItemData } from '@ditloop/ui';
import type { ResolvedWorkspace } from '@ditloop/core';
import { App } from './app.js';
import { useAppStore } from './state/app-store.js';
import { InitWizard } from './commands/init.js';
import { WorkspaceList } from './commands/workspace.js';
import { ProfileList, ProfileCurrent } from './commands/profile.js';

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

const HELP = `
◉ ditloop v${version} — Terminal IDE centered on Developer In The Loop

Usage:
  ditloop                  Launch the TUI dashboard
  ditloop init             Interactive setup wizard
  ditloop workspace list   List configured workspaces
  ditloop profile list     List configured profiles
  ditloop profile current  Show current git identity
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

  // Unknown command
  if (command) {
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
  }

  // Default: launch TUI
  const wm = new WorkspaceManager(config, eventBus);
  const pm = new ProfileManager(config, eventBus);
  const workspaces = wm.list().map(toWorkspaceItemData);
  const currentEmail = await pm.getCurrent();

  useAppStore.getState().init(workspaces, currentEmail ?? undefined);

  render(<App />);
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
  };
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
