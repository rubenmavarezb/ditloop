import { createConnection } from 'node:net';
import type { Socket } from 'node:net';
import type { IpcMessage } from './ipc-server.js';

/**
 * IPC client that connects to the DitLoop IPC server to receive messages.
 */
export class IpcClient {
  private socket: Socket | null = null;
  private buffer = '';

  /** @param socketPath - Path to the Unix domain socket file */
  constructor(private readonly socketPath: string) {}

  /**
   * Connect to the IPC server.
   *
   * @returns Resolves when connected
   */
  async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socket = createConnection(this.socketPath, () => { resolve(); });
      this.socket.on('error', reject);
    });
  }

  /**
   * Listen for messages from the server.
   *
   * @param handler - Callback invoked for each received message
   */
  onMessage(handler: (message: IpcMessage) => void): void {
    if (!this.socket) return;
    this.socket.on('data', (chunk) => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) {
          try { handler(JSON.parse(line)); } catch { /* skip malformed */ }
        }
      }
    });
  }

  /**
   * Send a message to the server.
   *
   * @param message - The IPC message to send
   */
  send(message: IpcMessage): void {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(JSON.stringify(message) + '\n');
    }
  }

  /** Disconnect from the server. */
  disconnect(): void {
    if (this.socket) { this.socket.destroy(); this.socket = null; }
  }
}
