import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityGuard } from './identity-guard.js';
import { EventBus } from '../events/index.js';
import type { ProfileManager } from './profile-manager.js';

function createMockProfileManager(overrides?: Partial<ProfileManager>): ProfileManager {
  return {
    list: vi.fn().mockReturnValue({}),
    get: vi.fn().mockReturnValue({ name: 'Ruben', email: 'ruben@work.com', platform: 'github' as const }),
    getCurrent: vi.fn().mockResolvedValue('ruben@work.com'),
    switchTo: vi.fn().mockResolvedValue(undefined),
    resolveForWorkspace: vi.fn(),
    ...overrides,
  } as unknown as ProfileManager;
}

describe('IdentityGuard', () => {
  let guard: IdentityGuard;
  let eventBus: EventBus;
  let profileManager: ProfileManager;

  beforeEach(() => {
    eventBus = new EventBus();
    profileManager = createMockProfileManager();
    guard = new IdentityGuard(profileManager, eventBus);
  });

  describe('getExpectedEmail', () => {
    it('returns email for a known profile', () => {
      expect(guard.getExpectedEmail('work')).toBe('ruben@work.com');
    });

    it('returns undefined for unknown profile', () => {
      const pm = createMockProfileManager({ get: vi.fn().mockReturnValue(undefined) as never });
      const g = new IdentityGuard(pm, eventBus);
      expect(g.getExpectedEmail('nonexistent')).toBeUndefined();
    });
  });

  describe('verify', () => {
    it('returns match:true when identity matches', async () => {
      const result = await guard.verify('work', 'pivotree');
      expect(result.match).toBe(true);
      expect(result.expected).toBe('ruben@work.com');
      expect(result.actual).toBe('ruben@work.com');
    });

    it('returns match:false and emits mismatch when identity differs', async () => {
      const pm = createMockProfileManager({
        getCurrent: vi.fn().mockResolvedValue('wrong@email.com') as never,
      });
      const g = new IdentityGuard(pm, eventBus);
      const handler = vi.fn();
      eventBus.on('profile:mismatch', handler);

      const result = await g.verify('work', 'pivotree');

      expect(result.match).toBe(false);
      expect(result.actual).toBe('wrong@email.com');
      expect(handler).toHaveBeenCalledWith({
        expected: 'ruben@work.com',
        actual: 'wrong@email.com',
        workspace: 'pivotree',
      });
    });

    it('returns match:false when no current identity set', async () => {
      const pm = createMockProfileManager({
        getCurrent: vi.fn().mockResolvedValue(undefined) as never,
      });
      const g = new IdentityGuard(pm, eventBus);
      const handler = vi.fn();
      eventBus.on('profile:mismatch', handler);

      const result = await g.verify('work', 'pivotree');

      expect(result.match).toBe(false);
      expect(result.actual).toBeUndefined();
      expect(handler).toHaveBeenCalledWith({
        expected: 'ruben@work.com',
        actual: '(not set)',
        workspace: 'pivotree',
      });
    });

    it('returns match:false when profile not found', async () => {
      const pm = createMockProfileManager({
        get: vi.fn().mockReturnValue(undefined) as never,
      });
      const g = new IdentityGuard(pm, eventBus);

      const result = await g.verify('unknown', 'pivotree');

      expect(result.match).toBe(false);
      expect(result.expected).toContain('unknown profile');
    });

    it('does not emit mismatch when identity matches', async () => {
      const handler = vi.fn();
      eventBus.on('profile:mismatch', handler);

      await guard.verify('work', 'pivotree');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('autoFix', () => {
    it('does nothing when identity already matches', async () => {
      const result = await guard.autoFix('work', 'pivotree', '/path/to/repo');

      expect(result.match).toBe(true);
      expect(profileManager.switchTo).not.toHaveBeenCalled();
    });

    it('switches profile when identity mismatches', async () => {
      const pm = createMockProfileManager({
        getCurrent: vi.fn().mockResolvedValue('wrong@email.com') as never,
      });
      const g = new IdentityGuard(pm, eventBus);

      const result = await g.autoFix('work', 'pivotree', '/path/to/repo');

      expect(result.match).toBe(true);
      expect(pm.switchTo).toHaveBeenCalledWith('work', '/path/to/repo');
    });

    it('does not auto-fix when profile is unknown', async () => {
      const pm = createMockProfileManager({
        get: vi.fn().mockReturnValue(undefined) as never,
        getCurrent: vi.fn().mockResolvedValue('whatever@email.com') as never,
      });
      const g = new IdentityGuard(pm, eventBus);

      const result = await g.autoFix('unknown', 'pivotree');

      expect(result.match).toBe(false);
      expect(pm.switchTo).not.toHaveBeenCalled();
    });
  });

  describe('guard', () => {
    it('returns true when identity matches', async () => {
      const allowed = await guard.guard('work', 'pivotree');
      expect(allowed).toBe(true);
    });

    it('returns false and emits guard-blocked on mismatch', async () => {
      const pm = createMockProfileManager({
        getCurrent: vi.fn().mockResolvedValue('wrong@email.com') as never,
      });
      const g = new IdentityGuard(pm, eventBus);
      const handler = vi.fn();
      eventBus.on('profile:guard-blocked', handler);

      const allowed = await g.guard('work', 'pivotree');

      expect(allowed).toBe(false);
      expect(handler).toHaveBeenCalledWith({
        workspace: 'pivotree',
        expected: 'ruben@work.com',
        actual: 'wrong@email.com',
      });
    });

    it('returns false without guard-blocked when no current identity', async () => {
      const pm = createMockProfileManager({
        getCurrent: vi.fn().mockResolvedValue(undefined) as never,
      });
      const g = new IdentityGuard(pm, eventBus);
      const handler = vi.fn();
      eventBus.on('profile:guard-blocked', handler);

      const allowed = await g.guard('work', 'pivotree');

      expect(allowed).toBe(false);
      // guard-blocked not emitted when actual is undefined (no identity to report)
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
