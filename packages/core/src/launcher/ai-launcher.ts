import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { CliRegistry, type DetectedCli } from './cli-registry.js';
import { ContextBuilder, type ContextBuildOptions } from './context-builder.js';
import type { EventBus } from '../events/index.js';

/** Options for launching an AI CLI. */
export interface LaunchOptions {
  /** Absolute path to the workspace. */
  workspacePath: string;
  /** Workspace display name. */
  workspaceName?: string;
  /** AIDF task ID to focus on. */
  taskId?: string;
  /** AIDF role ID to use. */
  roleId?: string;
  /** Whether to run in interactive mode (inherit stdio). Default: true. */
  interactive?: boolean;
  /** Additional CLI arguments. */
  extraArgs?: string[];
}

/** Result of a non-interactive launch. */
export interface LaunchResult {
  /** Exit code of the process. */
  exitCode: number | null;
  /** Stdout output (non-interactive mode only). */
  stdout: string;
  /** Stderr output (non-interactive mode only). */
  stderr: string;
}

/**
 * Detect installed AI CLI tools, spawn them with injected workspace/AIDF
 * context, and manage child process lifecycle.
 */
export class AiLauncher {
  private registry: CliRegistry;
  private contextBuilder: ContextBuilder;
  private eventBus?: EventBus;
  private activeProcess: ChildProcess | null = null;
  private tempDirs: string[] = [];

  /**
   * @param eventBus - Optional event bus for lifecycle events
   */
  constructor(eventBus?: EventBus) {
    this.registry = new CliRegistry();
    this.contextBuilder = new ContextBuilder(eventBus);
    this.eventBus = eventBus;
  }

  /**
   * Get the CLI registry for custom CLI registration.
   *
   * @returns The CLI registry instance
   */
  getRegistry(): CliRegistry {
    return this.registry;
  }

  /**
   * Detect all available AI CLI tools on the system.
   *
   * @param refresh - Force re-detection
   * @returns Array of detected CLIs
   */
  detectAvailable(refresh = false): DetectedCli[] {
    return this.registry.detectAvailable(refresh);
  }

  /**
   * Launch an AI CLI with injected workspace/AIDF context.
   *
   * @param cliId - CLI identifier (e.g., "claude", "aider")
   * @param options - Launch options
   * @returns Promise that resolves when the process exits
   * @throws Error if CLI is not found or not available
   */
  async launch(cliId: string, options: LaunchOptions): Promise<LaunchResult> {
    const detected = this.registry.detect(cliId);
    if (!detected) {
      const def = this.registry.get(cliId);
      if (def) {
        throw new Error(`${def.name} is not installed. Install it from: ${def.installUrl}`);
      }
      throw new Error(`Unknown AI CLI: ${cliId}. Available: ${this.registry.listIds().join(', ')}`);
    }

    const interactive = options.interactive ?? true;

    // Build context
    const context = await this.contextBuilder.build({
      workspacePath: options.workspacePath,
      workspaceName: options.workspaceName,
      taskId: options.taskId,
      roleId: options.roleId,
    });

    // Build CLI args with context injection
    const args = this.buildArgs(cliId, detected, context.toSystemPrompt(), options);
    const env = this.buildEnv(detected, context.toSystemPrompt());

    return new Promise<LaunchResult>((resolve, reject) => {
      const child = spawn(detected.definition.binary, args, {
        cwd: options.workspacePath,
        stdio: interactive ? 'inherit' : ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...env },
      });

      this.activeProcess = child;

      this.eventBus?.emit('launcher:started', {
        workspace: options.workspaceName ?? options.workspacePath,
        cli: detected.definition.name,
        pid: child.pid ?? 0,
      });

      // Signal forwarding
      const forwardSignal = (signal: NodeJS.Signals) => {
        child.kill(signal);
      };
      process.on('SIGINT', forwardSignal);
      process.on('SIGTERM', forwardSignal);

      let stdout = '';
      let stderr = '';

      if (!interactive && child.stdout && child.stderr) {
        child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
        child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
      }

      child.on('error', (err) => {
        this.cleanup();
        process.off('SIGINT', forwardSignal);
        process.off('SIGTERM', forwardSignal);
        reject(err);
      });

      child.on('close', (code) => {
        this.activeProcess = null;
        process.off('SIGINT', forwardSignal);
        process.off('SIGTERM', forwardSignal);
        this.cleanup();

        this.eventBus?.emit('launcher:exited', {
          workspace: options.workspaceName ?? options.workspacePath,
          cli: detected.definition.name,
          exitCode: code,
        });

        resolve({ exitCode: code, stdout, stderr });
      });
    });
  }

  /**
   * Kill the active child process if any.
   */
  kill(): void {
    if (this.activeProcess) {
      this.activeProcess.kill('SIGTERM');
      this.activeProcess = null;
    }
  }

  /**
   * Check if a process is currently running.
   */
  get isRunning(): boolean {
    return this.activeProcess !== null;
  }

  private buildArgs(
    cliId: string,
    detected: DetectedCli,
    systemPrompt: string,
    options: LaunchOptions,
  ): string[] {
    const args: string[] = [...(detected.definition.defaultArgs ?? [])];
    const injection = detected.definition.contextInjection;

    if (injection.type === 'flag') {
      // For claude, use --system-prompt with the context
      if (cliId === 'claude') {
        args.push(injection.flag, systemPrompt);
      } else if (cliId === 'aider') {
        // Aider uses --read for context files
        const tempDir = mkdtempSync(join(tmpdir(), 'ditloop-ctx-'));
        this.tempDirs.push(tempDir);
        const contextFile = join(tempDir, 'ditloop-context.md');
        writeFileSync(contextFile, systemPrompt, 'utf-8');
        args.push('--read', contextFile);
      }
    } else if (injection.type === 'file') {
      const tempDir = mkdtempSync(join(tmpdir(), 'ditloop-ctx-'));
      this.tempDirs.push(tempDir);
      const contextFile = join(tempDir, injection.fileName);
      writeFileSync(contextFile, systemPrompt, 'utf-8');
      args.push(contextFile);
    }

    if (options.extraArgs) {
      args.push(...options.extraArgs);
    }

    return args;
  }

  private buildEnv(detected: DetectedCli, systemPrompt: string): Record<string, string> {
    const env: Record<string, string> = {};

    if (detected.definition.contextInjection.type === 'env') {
      env[detected.definition.contextInjection.envVar] = systemPrompt;
    }

    return env;
  }

  private cleanup(): void {
    for (const dir of this.tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
    this.tempDirs = [];
  }
}
