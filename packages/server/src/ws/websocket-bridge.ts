import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type { EventBus, DitLoopEventName } from '@ditloop/core';

/** Maximum concurrent WebSocket clients. */
const MAX_CLIENTS = 10;

/** Ping interval in milliseconds. */
const PING_INTERVAL_MS = 30_000;

/** Max events per second per client. */
const RATE_LIMIT_PER_SEC = 100;

/** Message sent from server to client. */
export interface WsOutMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

/** Message sent from client to server. */
interface WsInMessage {
  subscribe?: string[];
  unsubscribe?: string[];
}

/** Tracked client connection. */
interface TrackedClient {
  ws: WebSocket;
  patterns: Set<string>;
  alive: boolean;
  eventCount: number;
  lastRateReset: number;
}

/**
 * Bridge EventBus events to WebSocket clients with subscription filtering,
 * keepalive ping/pong, rate limiting, and multi-client support.
 */
export class WebSocketBridge {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, TrackedClient> = new Map();
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private eventBus: EventBus;
  private token: string;
  private boundHandler: ((event: string, payload: unknown) => void) | null = null;

  /**
   * @param eventBus - EventBus to subscribe to
   * @param token - Auth token for WebSocket upgrade
   */
  constructor(eventBus: EventBus, token: string) {
    this.eventBus = eventBus;
    this.token = token;
  }

  /**
   * Attach the WebSocket server to an existing HTTP server.
   *
   * @param server - HTTP server instance
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attach(server: { on: (event: string, handler: (...args: any[]) => void) => void }): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket: unknown, head: unknown) => {
      if (!this.isWsPath(request)) {
        return;
      }

      if (!this.authenticateUpgrade(request)) {
        const sock = socket as import('node:net').Socket;
        sock.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        sock.destroy();
        return;
      }

      if (this.clients.size >= MAX_CLIENTS) {
        const sock = socket as import('node:net').Socket;
        sock.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        sock.destroy();
        return;
      }

      this.wss!.handleUpgrade(request, socket as import('node:net').Socket, head as Buffer, (ws) => {
        this.wss!.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.startPingInterval();
    this.subscribeToEventBus();
  }

  /**
   * Close the WebSocket server and clean up all connections.
   */
  close(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    this.unsubscribeFromEventBus();

    for (const [ws] of this.clients) {
      ws.close(1001, 'Server shutting down');
    }
    this.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }

  /** Number of connected clients. */
  get clientCount(): number {
    return this.clients.size;
  }

  private isWsPath(request: IncomingMessage): boolean {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    return url.pathname === '/ws';
  }

  private authenticateUpgrade(request: IncomingMessage): boolean {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const tokenParam = url.searchParams.get('token');
    if (tokenParam === this.token) return true;

    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [scheme, value] = authHeader.split(' ');
      if (scheme === 'Bearer' && value === this.token) return true;
    }

    return false;
  }

  private handleConnection(ws: WebSocket): void {
    const client: TrackedClient = {
      ws,
      patterns: new Set(),
      alive: true,
      eventCount: 0,
      lastRateReset: Date.now(),
    };

    this.clients.set(ws, client);

    ws.on('pong', () => {
      client.alive = true;
    });

    ws.on('message', (data) => {
      try {
        const msg: WsInMessage = JSON.parse(data.toString());

        if (msg.subscribe) {
          for (const pattern of msg.subscribe) {
            client.patterns.add(pattern);
          }
        }

        if (msg.unsubscribe) {
          for (const pattern of msg.unsubscribe) {
            client.patterns.delete(pattern);
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
    });

    ws.on('error', () => {
      this.clients.delete(ws);
    });
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      for (const [ws, client] of this.clients) {
        if (!client.alive) {
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }
        client.alive = false;
        ws.ping();
      }
    }, PING_INTERVAL_MS);
  }

  private subscribeToEventBus(): void {
    // Subscribe to all known event categories
    const eventPrefixes = [
      'workspace', 'profile', 'execution', 'approval',
      'git', 'action', 'chat', 'aidf', 'launcher', 'provider',
    ];

    this.boundHandler = (event: string, payload: unknown) => {
      this.broadcast(event, payload);
    };

    // Use the EventBus's internal emitter to capture all events
    // We subscribe to each known event name pattern
    for (const prefix of eventPrefixes) {
      const events = this.getEventsForPrefix(prefix);
      for (const eventName of events) {
        this.eventBus.on(eventName as DitLoopEventName, (payload: unknown) => {
          this.broadcast(eventName, payload);
        });
      }
    }
  }

  private unsubscribeFromEventBus(): void {
    this.eventBus.removeAllListeners();
  }

  private getEventsForPrefix(prefix: string): string[] {
    const eventMap: Record<string, string[]> = {
      workspace: ['workspace:activated', 'workspace:deactivated', 'workspace:created', 'workspace:removed', 'workspace:error'],
      profile: ['profile:switched', 'profile:mismatch', 'profile:guard-blocked'],
      execution: ['execution:started', 'execution:progress', 'execution:output', 'execution:completed', 'execution:error'],
      approval: ['approval:requested', 'approval:granted', 'approval:denied'],
      git: ['git:status-changed', 'git:commit', 'git:push', 'git:pull', 'git:branch-created', 'git:branch-switched', 'git:branch-deleted'],
      action: ['action:executed', 'action:failed', 'action:rolled-back'],
      chat: ['chat:message-sent', 'chat:message-received', 'chat:stream-chunk', 'chat:error'],
      aidf: ['aidf:detected', 'aidf:context-loaded', 'aidf:task-selected', 'aidf:created', 'aidf:updated', 'aidf:deleted'],
      launcher: ['launcher:context-built', 'launcher:started', 'launcher:exited'],
      provider: ['provider:connected', 'provider:disconnected', 'provider:error'],
    };
    return eventMap[prefix] ?? [];
  }

  private broadcast(event: string, data: unknown): void {
    const message: WsOutMessage = {
      event,
      data,
      timestamp: Date.now(),
    };

    const json = JSON.stringify(message);

    for (const [ws, client] of this.clients) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      if (!this.matchesPattern(event, client.patterns)) continue;
      if (!this.checkRateLimit(client)) continue;

      ws.send(json);
    }
  }

  private matchesPattern(event: string, patterns: Set<string>): boolean {
    // If no subscriptions, receive nothing
    if (patterns.size === 0) return false;

    for (const pattern of patterns) {
      if (pattern === '*') return true;
      if (pattern === event) return true;

      // Wildcard matching: "workspace:*" matches "workspace:activated"
      if (pattern.endsWith(':*')) {
        const prefix = pattern.slice(0, -2);
        if (event.startsWith(prefix + ':')) return true;
      }
    }

    return false;
  }

  private checkRateLimit(client: TrackedClient): boolean {
    const now = Date.now();
    if (now - client.lastRateReset > 1000) {
      client.eventCount = 0;
      client.lastRateReset = now;
    }

    if (client.eventCount >= RATE_LIMIT_PER_SEC) {
      return false;
    }

    client.eventCount++;
    return true;
  }
}
