import { randomUUID } from 'node:crypto';
import type { EventBus } from '@ditloop/core';

/** Execution status. */
export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Output line captured from execution. */
export interface OutputLine {
  stream: 'stdout' | 'stderr';
  data: string;
  timestamp: number;
}

/** Tracked execution entry. */
export interface TrackedExecution {
  id: string;
  taskId: string;
  workspace: string;
  workspacePath: string;
  provider?: string;
  model?: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  exitCode?: number;
  error?: string;
  output: OutputLine[];
  abortController?: AbortController;
}

/** Options to submit a new execution. */
export interface SubmitOptions {
  taskId: string;
  workspace: string;
  workspacePath: string;
  provider?: string;
  model?: string;
}

/** Rate limit configuration per provider. */
export interface RateLimitConfig {
  [provider: string]: number;
}

/** Execution statistics. */
export interface ExecutionStats {
  total: number;
  running: number;
  queued: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageDuration: number;
  providerUsage: Record<string, number>;
}

/** Default rate limits per provider. */
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  claude: 3,
  openai: 5,
  default: 2,
};

/** Default retention period for completed executions (24 hours). */
const DEFAULT_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Track running executions, enforce rate limits per provider,
 * manage FIFO queue, and collect metrics.
 */
export class ExecutionMonitor {
  private executions: Map<string, TrackedExecution> = new Map();
  private queue: string[] = [];
  private rateLimits: RateLimitConfig;
  private retentionMs: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private eventBus: EventBus;
  private executeCallback?: (execution: TrackedExecution) => Promise<void>;

  /**
   * @param eventBus - EventBus for emitting queue events
   * @param rateLimits - Max concurrent executions per provider
   * @param retentionMs - How long to keep completed execution records
   */
  constructor(
    eventBus: EventBus,
    rateLimits?: RateLimitConfig,
    retentionMs?: number,
  ) {
    this.eventBus = eventBus;
    this.rateLimits = { ...DEFAULT_RATE_LIMITS, ...rateLimits };
    this.retentionMs = retentionMs ?? DEFAULT_RETENTION_MS;

    this.startCleanupTimer();
    this.subscribeToEvents();
  }

  /**
   * Set the callback that runs an execution. Called when a queued task is dequeued.
   *
   * @param callback - Function that receives a TrackedExecution and runs it
   */
  onExecute(callback: (execution: TrackedExecution) => Promise<void>): void {
    this.executeCallback = callback;
  }

  /**
   * Submit a new execution. Queues it if rate limits are reached.
   *
   * @param options - Execution submission options
   * @returns The execution ID
   */
  async submitExecution(options: SubmitOptions): Promise<string> {
    const id = randomUUID();
    const execution: TrackedExecution = {
      id,
      taskId: options.taskId,
      workspace: options.workspace,
      workspacePath: options.workspacePath,
      provider: options.provider,
      model: options.model,
      status: 'queued',
      startTime: Date.now(),
      output: [],
    };

    this.executions.set(id, execution);

    if (this.canStartExecution(options.provider ?? 'default')) {
      await this.startExecution(execution);
    } else {
      this.queue.push(id);
      this.eventBus.emit('execution:progress', {
        taskId: id,
        message: `Queued (position ${this.queue.length})`,
      });
    }

    return id;
  }

  /**
   * Cancel a running or queued execution.
   *
   * @param id - Execution ID
   * @returns True if cancelled, false if not found or already completed
   */
  cancelExecution(id: string): boolean {
    const execution = this.executions.get(id);
    if (!execution) return false;

    if (execution.status === 'queued') {
      this.queue = this.queue.filter((qId) => qId !== id);
      execution.status = 'cancelled';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
      return true;
    }

    if (execution.status === 'running') {
      execution.abortController?.abort();
      execution.status = 'cancelled';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;
      return true;
    }

    return false;
  }

  /**
   * List all tracked executions.
   *
   * @returns Array of execution records (without abortController)
   */
  listExecutions(): Omit<TrackedExecution, 'abortController'>[] {
    return Array.from(this.executions.values()).map(
      ({ abortController: _, ...rest }) => rest,
    );
  }

  /**
   * Get a single execution by ID.
   *
   * @param id - Execution ID
   * @returns The execution record, or undefined
   */
  getExecution(id: string): Omit<TrackedExecution, 'abortController'> | undefined {
    const ex = this.executions.get(id);
    if (!ex) return undefined;
    const { abortController: _, ...rest } = ex;
    return rest;
  }

  /**
   * Get aggregated execution statistics.
   *
   * @returns Execution stats object
   */
  getStats(): ExecutionStats {
    const all = Array.from(this.executions.values());
    const completed = all.filter((e) => e.status === 'completed');
    const providerUsage: Record<string, number> = {};

    for (const ex of all) {
      const provider = ex.provider ?? 'default';
      providerUsage[provider] = (providerUsage[provider] ?? 0) + 1;
    }

    const totalDuration = completed.reduce((sum, e) => sum + (e.duration ?? 0), 0);

    return {
      total: all.length,
      running: all.filter((e) => e.status === 'running').length,
      queued: all.filter((e) => e.status === 'queued').length,
      completed: completed.length,
      failed: all.filter((e) => e.status === 'failed').length,
      cancelled: all.filter((e) => e.status === 'cancelled').length,
      averageDuration: completed.length > 0 ? totalDuration / completed.length : 0,
      providerUsage,
    };
  }

  /**
   * Stop the monitor and clean up timers.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private canStartExecution(provider: string): boolean {
    const limit = this.rateLimits[provider] ?? this.rateLimits['default'] ?? 2;
    const running = Array.from(this.executions.values()).filter(
      (e) => e.status === 'running' && (e.provider ?? 'default') === provider,
    ).length;
    return running < limit;
  }

  private async startExecution(execution: TrackedExecution): Promise<void> {
    execution.status = 'running';
    execution.abortController = new AbortController();

    if (this.executeCallback) {
      try {
        await this.executeCallback(execution);
      } catch (error) {
        execution.status = 'failed';
        execution.error = error instanceof Error ? error.message : String(error);
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
      }
    }

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const nextId = this.queue[0];
      const next = this.executions.get(nextId);
      if (!next || next.status !== 'queued') {
        this.queue.shift();
        continue;
      }

      const provider = next.provider ?? 'default';
      if (!this.canStartExecution(provider)) break;

      this.queue.shift();
      await this.startExecution(next);
    }
  }

  private subscribeToEvents(): void {
    this.eventBus.on('execution:output', (payload) => {
      const execution = this.executions.get(payload.taskId);
      if (execution) {
        execution.output.push({
          stream: payload.stream,
          data: payload.data,
          timestamp: Date.now(),
        });
      }
    });

    this.eventBus.on('execution:completed', (payload) => {
      const execution = this.executions.get(payload.taskId);
      if (execution && execution.status === 'running') {
        execution.status = 'completed';
        execution.exitCode = payload.exitCode;
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
        this.processQueue();
      }
    });

    this.eventBus.on('execution:error', (payload) => {
      const execution = this.executions.get(payload.taskId);
      if (execution && execution.status === 'running') {
        execution.status = 'failed';
        execution.error = payload.error;
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
        this.processQueue();
      }
    });
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [id, ex] of this.executions) {
        if (
          ex.endTime &&
          (ex.status === 'completed' || ex.status === 'failed' || ex.status === 'cancelled') &&
          now - ex.endTime > this.retentionMs
        ) {
          this.executions.delete(id);
        }
      }
    }, 60_000);
  }
}
