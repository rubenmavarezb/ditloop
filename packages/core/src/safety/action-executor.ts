import { readFile, writeFile, copyFile, unlink, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { execa } from 'execa';
import type { EventBus } from '../events/index.js';
import type { Action } from '../executor/index.js';

/** Result of executing an action. */
export interface ExecutionResult {
  id: string;
  success: boolean;
  output?: string;
  error?: string;
}

/** Dangerous command patterns that should be blocked. */
const DANGEROUS_PATTERNS = [
  /rm\s+(-rf?|--recursive)\s+\//,
  /\bsudo\b/,
  /mkfs\b/,
  /dd\s+.*(of=\/dev|if=\/dev\/zero)/,
  /:(){ :|:& };:/,
  />\s*\/dev\/sda/,
  /chmod\s+-R?\s*777\s+\//,
  /\brm\s+-rf?\s+\*/,
];

/** Options for constructing an ActionExecutor. */
export interface ActionExecutorOptions {
  workspacePath: string;
  eventBus?: EventBus;
  commandTimeout?: number;
}

/**
 * Safely executes approved actions with validation, backups for rollback,
 * and sandboxing for shell commands.
 */
export class ActionExecutor {
  private workspacePath: string;
  private eventBus?: EventBus;
  private commandTimeout: number;
  private backups = new Map<string, { originalPath: string; backupPath: string }>();

  constructor(options: ActionExecutorOptions) {
    this.workspacePath = options.workspacePath;
    this.eventBus = options.eventBus;
    this.commandTimeout = options.commandTimeout ?? 30000;
  }

  /**
   * Execute an approved action.
   *
   * @param action - The action to execute
   * @returns Execution result with success/failure info
   */
  async execute(action: Action): Promise<ExecutionResult> {
    const id = randomUUID();

    try {
      let output: string | undefined;

      switch (action.type) {
        case 'file_create':
          output = await this.executeFileCreate(action.path, action.content, id);
          break;
        case 'file_edit':
          output = await this.executeFileEdit(action.path, action.oldContent, action.newContent, id);
          break;
        case 'shell_command':
          this.validateCommand(action.command);
          output = await this.executeShellCommand(action.command, action.cwd);
          break;
        case 'git_operation':
          output = `Git operation "${action.operation}" delegated to git module`;
          break;
      }

      return { id, success: true, output };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { id, success: false, error: errorMsg };
    }
  }

  /**
   * Rollback a file action by restoring the backup.
   *
   * @param executionId - The execution ID to rollback
   * @returns true if rollback succeeded
   */
  async rollback(executionId: string): Promise<boolean> {
    const backup = this.backups.get(executionId);
    if (!backup) return false;

    try {
      await copyFile(backup.backupPath, backup.originalPath);
      await unlink(backup.backupPath);
      this.backups.delete(executionId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate that a shell command is not dangerous.
   *
   * @param command - The command to validate
   * @throws Error if the command matches a dangerous pattern
   */
  validateCommand(command: string): void {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        throw new Error(`Blocked dangerous command: "${command}"`);
      }
    }
  }

  private async executeFileCreate(path: string, content: string, executionId: string): Promise<string> {
    const fullPath = join(this.workspacePath, path);
    await mkdir(dirname(fullPath), { recursive: true });

    // Backup existing file if present
    try {
      const existing = await readFile(fullPath);
      if (existing) {
        await this.createBackup(fullPath, executionId);
      }
    } catch {
      // File doesn't exist, no backup needed
    }

    await writeFile(fullPath, content);
    return `Created ${path}`;
  }

  private async executeFileEdit(
    path: string,
    oldContent: string,
    newContent: string,
    executionId: string,
  ): Promise<string> {
    const fullPath = join(this.workspacePath, path);

    await this.createBackup(fullPath, executionId);

    const current = await readFile(fullPath, 'utf-8');
    if (!current.includes(oldContent)) {
      throw new Error(`Cannot find content to replace in ${path}`);
    }

    const updated = current.replace(oldContent, newContent);
    await writeFile(fullPath, updated);
    return `Edited ${path}`;
  }

  private async executeShellCommand(command: string, cwd?: string): Promise<string> {
    const result = await execa('sh', ['-c', command], {
      cwd: cwd ?? this.workspacePath,
      timeout: this.commandTimeout,
      reject: false,
    });

    if (result.exitCode !== 0) {
      throw new Error(`Command failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`);
    }

    return result.stdout;
  }

  private async createBackup(filePath: string, executionId: string): Promise<void> {
    const backupPath = join(tmpdir(), `ditloop-backup-${executionId}`);
    await copyFile(filePath, backupPath);
    this.backups.set(executionId, { originalPath: filePath, backupPath });
  }
}
