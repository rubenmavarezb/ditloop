import { execa } from 'execa';

/**
 * SSH agent helper for managing SSH keys.
 * Wraps ssh-add commands to load/clear keys.
 */
export class SSHAgent {
  /**
   * Clear all keys from the SSH agent and load the specified key.
   * @param keyPath - Absolute path to the SSH private key
   */
  async loadKey(keyPath: string): Promise<void> {
    await this.clearAgent();
    await execa('ssh-add', [keyPath]);
  }

  /**
   * Remove all keys from the SSH agent.
   */
  async clearAgent(): Promise<void> {
    await execa('ssh-add', ['-D']);
  }
}
