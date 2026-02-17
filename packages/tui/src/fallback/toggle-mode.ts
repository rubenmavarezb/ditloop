import { execFile as execFileCb, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFileCb);

/** Options for spawning a toggle-mode shell. */
export interface ToggleModeOptions {
  /** Absolute workspace path to cd into. */
  workspacePath: string;
  /** Git profile name to set. */
  profileName?: string;
  /** Additional environment variables. */
  env?: Record<string, string>;
}

/**
 * Check if tmux is available on the system.
 *
 * @returns true if tmux is installed
 */
export async function checkTmuxAvailable(): Promise<boolean> {
  try {
    await execFileAsync('which', ['tmux']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Spawn an interactive shell with workspace context.
 * The shell inherits stdio so the user has full control.
 *
 * @param options - Toggle mode options
 * @returns Exit code of the shell process
 */
export async function spawnToggleShell(options: ToggleModeOptions): Promise<number> {
  const shell = process.env['SHELL'] ?? '/bin/sh';
  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    DITLOOP_WORKSPACE: options.workspacePath,
    ...options.env,
  };
  if (options.profileName) {
    env['DITLOOP_PROFILE'] = options.profileName;
  }

  return new Promise<number>((resolve) => {
    const child = spawn(shell, [], {
      cwd: options.workspacePath,
      env,
      stdio: 'inherit',
    });
    child.on('close', (code) => { resolve(code ?? 0); });
    child.on('error', () => { resolve(1); });
  });
}
