import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SSHAgent } from './ssh-agent.js';

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
}));

import { execa } from 'execa';

const mockedExeca = vi.mocked(execa);

describe('SSHAgent', () => {
  let agent: SSHAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new SSHAgent();
  });

  describe('clearAgent', () => {
    it('should run ssh-add -D to clear all keys', async () => {
      await agent.clearAgent();
      expect(mockedExeca).toHaveBeenCalledWith('ssh-add', ['-D']);
    });
  });

  describe('loadKey', () => {
    it('should clear agent then add the specified key', async () => {
      await agent.loadKey('/home/user/.ssh/id_rsa');

      expect(mockedExeca).toHaveBeenCalledTimes(2);
      expect(mockedExeca).toHaveBeenNthCalledWith(1, 'ssh-add', ['-D']);
      expect(mockedExeca).toHaveBeenNthCalledWith(2, 'ssh-add', ['/home/user/.ssh/id_rsa']);
    });

    it('should propagate errors from ssh-add', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('ssh-add failed'));

      await expect(agent.loadKey('/bad/path')).rejects.toThrow('ssh-add failed');
    });
  });
});
