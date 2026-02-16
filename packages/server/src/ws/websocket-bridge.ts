import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import { ALL_EVENT_NAMES } from '@ditloop/core';
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
  private handlers: Array<{ event: DitLoopEventName; handler: (payload: unknown) => void }> = [];

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
    for (const eventName of ALL_EVENT_NAMES) {
      const handler = (payload: unknown) => {
        this.broadcast(eventName, payload);
      };
      this.handlers.push({ event: eventName, handler });
      this.eventBus.on(eventName, handler);
    }
  }

  private unsubscribeFromEventBus(): void {
    for (const { event, handler } of this.handlers) {
      this.eventBus.off(event, handler);
    }
    this.handlers = [];
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
    if (patterns.size === 0) return false;

    for (const pattern of patterns) {
      if (pattern === '*') return true;
      if (pattern === event) return true;

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
