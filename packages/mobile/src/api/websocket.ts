import { useConnectionStore } from '../store/connection.js';

/** Message received from the server WebSocket. */
export interface WsMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

/** Callback for incoming WebSocket messages. */
export type WsMessageHandler = (message: WsMessage) => void;

/** Reconnection config. */
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;

/**
 * Manages a WebSocket connection to the DitLoop server with automatic
 * reconnection, subscription management, and typed message handling.
 */
export class DitLoopWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<WsMessageHandler> = new Set();
  private subscriptions: string[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private intentionallyClosed = false;

  /**
   * Connect to the server WebSocket.
   *
   * @param subscriptions - Event patterns to subscribe to (e.g. ["*"], ["execution:*"])
   */
  connect(subscriptions: string[] = ['*']): void {
    this.subscriptions = subscriptions;
    this.intentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.doConnect();
  }

  /** Disconnect and stop reconnecting. */
  disconnect(): void {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    useConnectionStore.getState().setStatus('disconnected');
  }

  /**
   * Register a handler for incoming messages.
   *
   * @param handler - Callback invoked on each message
   * @returns Unsubscribe function
   */
  onMessage(handler: WsMessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /** Whether the WebSocket is currently open. */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private doConnect(): void {
    const { serverUrl, token } = useConnectionStore.getState();
    if (!serverUrl || !token) return;

    // Browser WebSocket API does not support custom headers (Authorization).
    // Token is passed via query parameter as a necessary compromise.
    // The server should NOT log full WebSocket upgrade URLs.
    const wsUrl = serverUrl.replace(/^http/, 'ws') + `/ws?token=${encodeURIComponent(token)}`;

    useConnectionStore.getState().setStatus('connecting');

    try {
      this.ws = new WebSocket(wsUrl);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      useConnectionStore.getState().setStatus('connected');

      // Send subscription request
      if (this.subscriptions.length > 0) {
        this.ws?.send(JSON.stringify({ subscribe: this.subscriptions }));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data as string);
        for (const handler of this.handlers) {
          handler(message);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.intentionallyClosed) {
        useConnectionStore.getState().setStatus('disconnected');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      useConnectionStore.getState().setStatus('error', 'WebSocket connection failed');
    };
  }

  private scheduleReconnect(): void {
    if (this.intentionallyClosed) return;

    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, delay);
  }
}

/** Singleton WebSocket instance. */
export const ditloopWs = new DitLoopWebSocket();
