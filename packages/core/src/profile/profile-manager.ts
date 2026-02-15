import { execa } from 'execa';
import type { EventBus } from '../events/index.js';
import type { DitLoopConfig, Profile } from '../config/index.js';
import { SSHAgent } from './ssh-agent.js';

/**
 * Manages git identity profiles: list, get, switch, and resolve from workspace config.
 */
export class ProfileManager {
  private config: DitLoopConfig;
  private eventBus: EventBus;
  private sshAgent: SSHAgent;

  constructor(config: DitLoopConfig, eventBus: EventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.sshAgent = new SSHAgent();
  }

  /**
   * List all configured profiles.
   * @returns Record of profile name to Profile object
   */
  list(): Record<string, Profile> {
    return this.config.profiles;
  }

  /**
   * Get a profile by name.
   * @param name - Profile name (key in config.profiles)
   * @returns The profile, or undefined if not found
   */
  get(name: string): Profile | undefined {
    return this.config.profiles[name];
  }

  /**
   * Get the currently active git identity by reading git config user.email.
   * @returns The current git user email, or undefined if not set
   */
  async getCurrent(): Promise<string | undefined> {
    try {
      const result = await execa('git', ['config', 'user.email']);
      return result.stdout.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Switch to a named profile. Sets git config user.name and user.email,
   * optionally loads SSH key, and emits profile:switched event.
   *
   * @param name - Profile name to switch to
   * @param repoPath - If provided, sets --local git config in this repo; otherwise --global
   * @throws Error if profile is not found in config
   */
  async switchTo(name: string, repoPath?: string): Promise<void> {
    const profile = this.config.profiles[name];
    if (!profile) {
      throw new Error(`Profile "${name}" not found in config`);
    }

    const scope = repoPath ? '--local' : '--global';
    const execaOptions = repoPath ? { cwd: repoPath } : {};

    await execa('git', ['config', scope, 'user.name', profile.name], execaOptions);
    await execa('git', ['config', scope, 'user.email', profile.email], execaOptions);

    if (profile.sshHost) {
      const keyPath = `~/.ssh/${profile.sshHost}`;
      await this.sshAgent.loadKey(keyPath);
    }

    this.eventBus.emit('profile:switched', {
      name: profile.name,
      email: profile.email,
      sshHost: profile.sshHost,
    });
  }

  /**
   * Resolve the profile for a workspace by looking up workspace.profile in config.profiles.
   * @param workspaceProfile - The profile name from the workspace config
   * @returns The resolved Profile, or undefined if not found
   */
  resolveForWorkspace(workspaceProfile: string): Profile | undefined {
    return this.config.profiles[workspaceProfile];
  }
}
