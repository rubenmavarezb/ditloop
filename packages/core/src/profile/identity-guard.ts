import type { EventBus } from '../events/index.js';
import type { ProfileManager } from './profile-manager.js';

export interface VerifyResult {
  match: boolean;
  expected: string;
  actual: string | undefined;
  profileName: string;
  workspace: string;
}

/**
 * Verifies that the active git identity matches the expected profile
 * for a workspace. Can auto-fix mismatches by switching profiles.
 */
export class IdentityGuard {
  private profileManager: ProfileManager;
  private eventBus: EventBus;

  constructor(profileManager: ProfileManager, eventBus: EventBus) {
    this.profileManager = profileManager;
    this.eventBus = eventBus;
  }

  /**
   * Get the expected profile for a workspace.
   * @param profileName - The profile name from workspace config
   * @returns The expected email, or undefined if profile not found
   */
  getExpectedEmail(profileName: string): string | undefined {
    const profile = this.profileManager.get(profileName);
    return profile?.email;
  }

  /**
   * Verify that the current git identity matches the workspace's expected profile.
   */
  async verify(profileName: string, workspace: string): Promise<VerifyResult> {
    const expected = this.getExpectedEmail(profileName);

    if (!expected) {
      return {
        match: false,
        expected: `(unknown profile: ${profileName})`,
        actual: undefined,
        profileName,
        workspace,
      };
    }

    const actual = await this.profileManager.getCurrent();
    const match = actual === expected;

    if (!match) {
      this.eventBus.emit('profile:mismatch', {
        expected,
        actual: actual ?? '(not set)',
        workspace,
      });
    }

    return { match, expected, actual, profileName, workspace };
  }

  /**
   * Verify and auto-fix: if mismatch, switch to the correct profile.
   * @returns The verify result (after fix if applied)
   */
  async autoFix(profileName: string, workspace: string, repoPath?: string): Promise<VerifyResult> {
    const result = await this.verify(profileName, workspace);

    if (!result.match && this.getExpectedEmail(profileName)) {
      await this.profileManager.switchTo(profileName, repoPath);

      return {
        match: true,
        expected: result.expected,
        actual: result.expected,
        profileName,
        workspace,
      };
    }

    return result;
  }

  /**
   * Guard a git operation: verify identity and block if mismatch (no auto-fix).
   * Emits profile:guard-blocked if identity doesn't match.
   * @returns true if identity matches, false if blocked
   */
  async guard(profileName: string, workspace: string): Promise<boolean> {
    const result = await this.verify(profileName, workspace);

    if (!result.match && result.actual) {
      this.eventBus.emit('profile:guard-blocked', {
        workspace,
        expected: result.expected,
        actual: result.actual,
      });
    }

    return result.match;
  }
}
