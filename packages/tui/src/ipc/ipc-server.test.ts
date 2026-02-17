import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { IpcServer } from './ipc-server.js';
import { IpcClient } from './ipc-client.js';

function tmpSocket(): string {
  return join(tmpdir(), `ditloop-test-${randomUUID()}.sock`);
}

describe('IpcServer + IpcClient', () => {
  let server: IpcServer;
  let client: IpcClient;
  const socketPath = tmpSocket();

  afterEach(async () => {
    client?.disconnect();
    await server?.stop();
  });

  it('broadcasts messages to connected clients', async () => {
    server = new IpcServer(socketPath);
    await server.start();
    client = new IpcClient(socketPath);
    await client.connect();

    const received: unknown[] = [];
    client.onMessage((msg) => { received.push(msg); });

    server.broadcast({ type: 'workspace-changed', payload: { path: '/test' } });

    await new Promise((r) => setTimeout(r, 50));
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ type: 'workspace-changed', payload: { path: '/test' } });
  });
});
