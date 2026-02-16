import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, openSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { Box, Text } from 'ink';

/** Path to the server PID file. */
const PID_PATH = join(homedir(), '.ditloop', 'server.pid');

/** Path to the server log file. */
const LOG_DIR = join(homedir(), '.ditloop', 'logs');
const LOG_PATH = join(LOG_DIR, 'server.log');

/**
 * Check if a PID is alive.
 *
 * @param pid - Process ID to check
 * @returns True if the process exists
 */
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the server PID from disk. Cleans up stale PID files.
 *
 * @returns The PID if running, undefined otherwise
 */
function readPid(): number | undefined {
  if (!existsSync(PID_PATH)) return undefined;

  const pid = parseInt(readFileSync(PID_PATH, 'utf-8').trim(), 10);
  if (isNaN(pid)) {
    unlinkSync(PID_PATH);
    return undefined;
  }

  if (!isProcessAlive(pid)) {
    unlinkSync(PID_PATH);
    return undefined;
  }

  return pid;
}

/**
 * Get server status information.
 *
 * @returns Status object with running state, PID, port info
 */
export function getServerStatus(): { running: boolean; pid?: number } {
  const pid = readPid();
  return { running: pid !== undefined, pid };
}

/**
 * Start the server as a daemon process.
 *
 * @returns Object with success status and message
 */
export function startServer(): { success: boolean; message: string } {
  const existing = readPid();
  if (existing) {
    return { success: false, message: `Server already running (PID ${existing})` };
  }

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  const logFd = openSync(LOG_PATH, 'a');

  const serverBin = join(dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'server', 'dist', 'index.js');

  const child = spawn('node', [serverBin], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: { ...process.env },
  });

  if (!child.pid) {
    return { success: false, message: 'Failed to spawn server process' };
  }

  const dir = dirname(PID_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(PID_PATH, String(child.pid));
  child.unref();

  return { success: true, message: `Server started (PID ${child.pid})` };
}

/**
 * Stop the running server.
 *
 * @returns Object with success status and message
 */
export function stopServer(): { success: boolean; message: string } {
  const pid = readPid();
  if (!pid) {
    return { success: false, message: 'Server is not running' };
  }

  try {
    process.kill(pid, 'SIGTERM');

    const maxWaitMs = 5000;
    const pollMs = 100;
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
      if (!isProcessAlive(pid)) {
        if (existsSync(PID_PATH)) unlinkSync(PID_PATH);
        return { success: true, message: `Server stopped (PID ${pid})` };
      }
      const waitUntil = Date.now() + pollMs;
      while (Date.now() < waitUntil) { /* spin */ }
    }

    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // Process may have died between check and kill
    }
    if (existsSync(PID_PATH)) unlinkSync(PID_PATH);
    return { success: true, message: `Server force-killed (PID ${pid})` };
  } catch (error) {
    if (existsSync(PID_PATH)) unlinkSync(PID_PATH);
    return { success: false, message: `Failed to stop server: ${error}` };
  }
}

/**
 * Restart the server (stop + start).
 *
 * @returns Object with success status and message
 */
export function restartServer(): { success: boolean; message: string } {
  const stopResult = stopServer();
  const startResult = startServer();
  if (!startResult.success) {
    return startResult;
  }
  return { success: true, message: `Server restarted — ${startResult.message}` };
}

/** Server status indicator component. */
export function ServerStatusIndicator() {
  const status = getServerStatus();

  return (
    <Box>
      <Text color={status.running ? 'green' : 'gray'}>
        {status.running ? '● Server' : '○ Server'}
      </Text>
      {status.pid && (
        <Text color="gray"> (PID {status.pid})</Text>
      )}
    </Box>
  );
}
