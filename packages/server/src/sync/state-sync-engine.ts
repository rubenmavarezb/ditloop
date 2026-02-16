import type { EventBus, DitLoopEventName } from '@ditloop/core';

/** Maximum number of deltas retained in the ring buffer. */
const MAX_DELTA_BUFFER = 1000;

/** Maximum number of offline events accepted in a single batch. */
const MAX_OFFLINE_QUEUE = 100;

/** A single state change recorded by the engine. */
export interface Delta {
  version: number;
  event: string;
  data: unknown;
  timestamp: number;
}

/** Full state snapshot built from accumulated events. */
export interface StateSnapshot {
  version: number;
  timestamp: number;
  workspaces: unknown[];
  executions: unknown[];
  approvals: unknown[];
}

/** An event queued by a client while it was offline. */
export interface OfflineEvent {
  clientId: string;
  event: string;
  data: unknown;
  clientTimestamp: number;
  clientVersion: number;
}

/** Conflict resolution strategy. */
export type ConflictStrategy = 'first-write-wins' | 'last-write-wins' | 'append-only';

/** Result of processing an offline event queue. */
export interface ProcessResult {
  accepted: number;
  rejected: number;
  conflicts: { event: string; reason: string }[];
  newVersion: number;
}

/** All known event names grouped by prefix (mirrors websocket-bridge). */
const ALL_EVENTS: DitLoopEventName[] = [
  'workspace:activated', 'workspace:deactivated', 'workspace:created', 'workspace:removed', 'workspace:error',
  'profile:switched', 'profile:mismatch', 'profile:guard-blocked',
  'execution:started', 'execution:progress', 'execution:output', 'execution:completed', 'execution:error',
  'approval:requested', 'approval:granted', 'approval:denied',
  'git:status-changed', 'git:commit', 'git:push', 'git:pull', 'git:branch-created', 'git:branch-switched', 'git:branch-deleted',
  'action:executed', 'action:failed', 'action:rolled-back',
  'chat:message-sent', 'chat:message-received', 'chat:stream-chunk', 'chat:error',
  'aidf:detected', 'aidf:context-loaded', 'aidf:task-selected', 'aidf:created', 'aidf:updated', 'aidf:deleted',
  'launcher:context-built', 'launcher:started', 'launcher:exited',
  'provider:connected', 'provider:disconnected', 'provider:error',
];

/**
 * Track state changes from EventBus and provide delta-based synchronization
 * for WebSocket clients on reconnection.
 *
 * Maintains a ring buffer of recent deltas, builds full state snapshots
 * from accumulated events, and processes offline event queues with
 * conflict resolution.
 */
export class StateSyncEngine {
  private version = 0;
  private deltas: Delta[] = [];
  private eventBus: EventBus;
  private boundHandlers: Map<DitLoopEventName, (payload: unknown) => void> = new Map();

  /** Accumulated state from events. */
  private workspaces: Map<string, unknown> = new Map();
  private executions: Map<string, unknown> = new Map();
  private approvals: Map<string, { data: unknown; status: 'pending' | 'granted' | 'denied' }> = new Map();

  /** Version vectors for conflict detection. One entry per known client. */
  private versionVectors: Map<string, number> = new Map();

  /**
   * @param eventBus - EventBus to subscribe to for recording deltas
   */
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.subscribeToEvents();
  }

  /**
   * Return all deltas recorded since the given version.
   * If the requested version is too old (no longer in the buffer),
   * returns undefined — the caller should use getFullState() instead.
   *
   * @param version - The last version the client has seen
   * @returns Array of deltas since that version, or undefined if version is too old
   */
  getDeltasSince(version: number): Delta[] | undefined {
    if (this.deltas.length === 0) return [];

    const oldestInBuffer = this.deltas[0].version;
    // Client needs deltas after `version`. If `version + 1` is older than
    // the oldest delta we still have, we cannot serve a contiguous range.
    if (version + 1 < oldestInBuffer) {
      return undefined;
    }

    return this.deltas.filter((d) => d.version > version);
  }

  /**
   * Return the current monotonically increasing version number.
   *
   * @returns Current version
   */
  getCurrentVersion(): number {
    return this.version;
  }

  /**
   * Build and return a full state snapshot from accumulated events.
   *
   * @returns Complete state snapshot
   */
  getFullState(): StateSnapshot {
    return {
      version: this.version,
      timestamp: Date.now(),
      workspaces: Array.from(this.workspaces.values()),
      executions: Array.from(this.executions.values()),
      approvals: Array.from(this.approvals.values()).map((a) => a.data),
    };
  }

  /**
   * Process a batch of events queued by a client while it was offline.
   *
   * Accepts up to 100 events. Events beyond that limit are rejected via
   * FIFO eviction (oldest are dropped). Conflict resolution per event type:
   * - Approvals: first-write-wins (reject if already approved/denied)
   * - Messages (chat:*): append-only (always accept)
   * - All others: last-write-wins (always accept, overwrite)
   *
   * @param events - Array of offline events to process
   * @returns Processing result with accepted/rejected counts and conflicts
   */
  processOfflineQueue(events: OfflineEvent[]): ProcessResult {
    const result: ProcessResult = {
      accepted: 0,
      rejected: 0,
      conflicts: [],
      newVersion: this.version,
    };

    // FIFO eviction: only keep the last MAX_OFFLINE_QUEUE events
    let toProcess = events;
    if (events.length > MAX_OFFLINE_QUEUE) {
      const evicted = events.length - MAX_OFFLINE_QUEUE;
      toProcess = events.slice(evicted);
      result.rejected += evicted;
      for (let i = 0; i < evicted; i++) {
        result.conflicts.push({
          event: events[i].event,
          reason: 'Queue overflow — FIFO eviction',
        });
      }
    }

    for (const offlineEvent of toProcess) {
      const strategy = this.getConflictStrategy(offlineEvent.event);

      if (strategy === 'first-write-wins') {
        const approvalId = this.extractApprovalId(offlineEvent);
        if (approvalId) {
          const existing = this.approvals.get(approvalId);
          if (existing && existing.status !== 'pending') {
            result.rejected++;
            result.conflicts.push({
              event: offlineEvent.event,
              reason: `Already resolved (${existing.status})`,
            });
            continue;
          }
        }
      }

      // Accept the event: record as delta and update client version vector
      this.recordDelta(offlineEvent.event, offlineEvent.data);
      this.updateState(offlineEvent.event, offlineEvent.data);
      this.versionVectors.set(offlineEvent.clientId, this.version);
      result.accepted++;
    }

    result.newVersion = this.version;
    return result;
  }

  /**
   * Get the version vector entry for a specific client.
   *
   * @param clientId - Client identifier
   * @returns The last known version for that client, or 0 if unknown
   */
  getClientVersion(clientId: string): number {
    return this.versionVectors.get(clientId) ?? 0;
  }

  /**
   * Check if a client is behind the current server version.
   *
   * @param clientId - Client identifier
   * @returns True if the client version is behind the server version
   */
  isClientBehind(clientId: string): boolean {
    return this.getClientVersion(clientId) < this.version;
  }

  /**
   * Update the version vector for a client (e.g., after sending deltas).
   *
   * @param clientId - Client identifier
   * @param version - Version to set
   */
  setClientVersion(clientId: string, version: number): void {
    this.versionVectors.set(clientId, version);
  }

  /**
   * Clean up event listeners and internal state.
   */
  destroy(): void {
    for (const [eventName, handler] of this.boundHandlers) {
      this.eventBus.off(eventName, handler as never);
    }
    this.boundHandlers.clear();
    this.deltas = [];
    this.workspaces.clear();
    this.executions.clear();
    this.approvals.clear();
    this.versionVectors.clear();
  }

  private subscribeToEvents(): void {
    for (const eventName of ALL_EVENTS) {
      const handler = (payload: unknown) => {
        this.recordDelta(eventName, payload);
        this.updateState(eventName, payload);
      };
      this.boundHandlers.set(eventName, handler);
      this.eventBus.on(eventName, handler as never);
    }
  }

  private recordDelta(event: string, data: unknown): void {
    this.version++;
    const delta: Delta = {
      version: this.version,
      event,
      data,
      timestamp: Date.now(),
    };

    this.deltas.push(delta);

    // Ring buffer: evict oldest when over capacity
    if (this.deltas.length > MAX_DELTA_BUFFER) {
      this.deltas = this.deltas.slice(this.deltas.length - MAX_DELTA_BUFFER);
    }
  }

  private updateState(event: string, data: unknown): void {
    const payload = data as Record<string, unknown>;

    if (event.startsWith('workspace:')) {
      const id = payload['id'] as string | undefined;
      if (!id) return;
      if (event === 'workspace:removed') {
        this.workspaces.delete(id);
      } else {
        this.workspaces.set(id, payload);
      }
    } else if (event.startsWith('execution:')) {
      const taskId = payload['taskId'] as string | undefined;
      if (!taskId) return;
      const existing = (this.executions.get(taskId) as Record<string, unknown>) ?? {};
      this.executions.set(taskId, { ...existing, ...payload, lastEvent: event });
    } else if (event.startsWith('approval:')) {
      const id = payload['id'] as string | undefined;
      if (!id) return;
      if (event === 'approval:requested') {
        this.approvals.set(id, { data: payload, status: 'pending' });
      } else if (event === 'approval:granted') {
        const existing = this.approvals.get(id);
        if (existing) {
          existing.status = 'granted';
          existing.data = { ...existing.data as object, ...payload };
        }
      } else if (event === 'approval:denied') {
        const existing = this.approvals.get(id);
        if (existing) {
          existing.status = 'denied';
          existing.data = { ...existing.data as object, ...payload };
        }
      }
    }
  }

  private getConflictStrategy(event: string): ConflictStrategy {
    if (event.startsWith('approval:')) return 'first-write-wins';
    if (event.startsWith('chat:')) return 'append-only';
    return 'last-write-wins';
  }

  private extractApprovalId(offlineEvent: OfflineEvent): string | undefined {
    const data = offlineEvent.data as Record<string, unknown> | undefined;
    return data?.['id'] as string | undefined;
  }
}
