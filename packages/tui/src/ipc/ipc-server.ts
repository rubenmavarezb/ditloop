import { createServer } from 'node:net';
import { unlinkSync } from 'node:fs';
import type { Server, Socket } from 'node:net';

/** Message types exchanged between IPC server and clients. */
export interface IpcMessage {
  type: 'workspace-changed' | 'identity-changed' | 'git-updated' | 'layout-changed';
  payload: Record<string, unknown>;
}

/**
 * Unix domain socket IPC server for broadcasting messages to panel processes.
 */
export class IpcServer {
  private server: Server | null = null;
  private clients: Set<Socket> = new Set();
  private lastMessages: Map<string, string> = new Map();

  /** @param socketPath - Path to the Unix domain socket file */
  constructor(private readonly socketPath: string) {}

  /**
   * Start listening for connections.
   *
   * @returns Resolves when the server is ready
   */
  async start(): Promise<void> {
    // Remove stale socket file from a previous crash
    try { unlinkSync(this.socketPath); } catch { /* ignore if not found */ }

    return new Promise<void>((resolve, reject) => {
      this.server = createServer((socket) => {
        this.clients.add(socket);

        // Replay cached messages so late-connecting clients get current state
        for (const data of this.lastMessages.values()) {
          if (!socket.destroyed) socket.write(data);
        }

        socket.on('close', () => { this.clients.delete(socket); });
        socket.on('error', () => { this.clients.delete(socket); });
      });
      this.server.on('error', reject);
      this.server.listen(this.socketPath, () => { resolve(); });
    });
  }

  /**
   * Broadcast a message to all connected panel clients.
   *
   * @param message - The IPC message to broadcast
   */
  broadcast(message: IpcMessage): void {
    const data = JSON.stringify(message) + '\n';
    // Cache by message type so new clients receive the latest state on connect
    this.lastMessages.set(message.type, data);
    for (const client of this.clients) {
      if (!client.destroyed) client.write(data);
    }
  }

  /**
   * Stop the server and clean up.
   *
   * @returns Resolves when the server has fully closed
   */
  async stop(): Promise<void> {
    for (const client of this.clients) client.destroy();
    this.clients.clear();
    return new Promise<void>((resolve) => {
      if (!this.server) { resolve(); return; }
      this.server.close(() => { this.server = null; resolve(); });
    });
  }
}
