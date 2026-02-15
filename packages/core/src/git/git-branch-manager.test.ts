import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import simpleGit from 'simple-git';
import { GitBranchManager } from './git-branch-manager.js';
import { EventBus } from '../events/index.js';

describe('GitBranchManager', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-branch-test-'));
    const git = simpleGit(tempDir);
    await git.init();
    await git.addConfig('user.email', 'test@test.com');
    await git.addConfig('user.name', 'Test User');
    await writeFile(join(tempDir, 'README.md'), '# Test');
    await git.add('README.md');
    await git.commit('initial commit');

    eventBus = new EventBus();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function createManager(options?: { identityGuard?: unknown }) {
    const git = simpleGit(tempDir);
    return new GitBranchManager({
      git,
      workspace: 'test-ws',
      profileName: 'test',
      eventBus,
      ...options,
    });
  }

  describe('listBranches', () => {
    it('lists branches in the repo', async () => {
      const manager = createManager();
      const branches = await manager.listBranches();

      expect(branches).toHaveLength(1);
      expect(branches[0].name).toBe('master');
      expect(branches[0].current).toBe(true);
    });
  });

  describe('createBranch', () => {
    it('creates and switches to a new branch', async () => {
      const manager = createManager();
      await manager.createBranch('feature/test');

      const current = await manager.getCurrentBranch();
      expect(current).toBe('feature/test');
    });

    it('emits status-changed event on branch creation', async () => {
      const handler = vi.fn();
      eventBus.on('git:status-changed', handler);

      const manager = createManager();
      await manager.createBranch('feature/new');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace: 'test-ws',
          branch: 'feature/new',
        }),
      );
    });
  });

  describe('switchBranch', () => {
    it('switches to an existing branch', async () => {
      const git = simpleGit(tempDir);
      await git.checkoutLocalBranch('develop');
      await git.checkout('master');

      const manager = createManager();
      await manager.switchBranch('develop');

      const current = await manager.getCurrentBranch();
      expect(current).toBe('develop');
    });
  });

  describe('deleteBranch', () => {
    it('deletes a merged branch', async () => {
      const git = simpleGit(tempDir);
      await git.checkoutLocalBranch('to-delete');
      await git.checkout('master');

      const manager = createManager();
      await manager.deleteBranch('to-delete');

      const branches = await manager.listBranches();
      expect(branches.find((b) => b.name === 'to-delete')).toBeUndefined();
    });

    it('force deletes an unmerged branch', async () => {
      const git = simpleGit(tempDir);
      await git.checkoutLocalBranch('unmerged');
      await writeFile(join(tempDir, 'unmerged.txt'), 'data');
      await git.add('unmerged.txt');
      await git.commit('unmerged commit');
      await git.checkout('master');

      const manager = createManager();
      await manager.deleteBranch('unmerged', true);

      const branches = await manager.listBranches();
      expect(branches.find((b) => b.name === 'unmerged')).toBeUndefined();
    });
  });

  describe('detectDefaultBranch', () => {
    it('detects local main/master branch', async () => {
      const manager = createManager();
      const defaultBranch = await manager.detectDefaultBranch();

      // Our test repo has 'master' as default
      expect(defaultBranch).toBe('master');
    });

    it('returns undefined when no standard branches exist', async () => {
      const git = simpleGit(tempDir);
      await git.checkoutLocalBranch('custom-branch');
      await git.branch(['-D', 'master']);

      const manager = createManager();
      const defaultBranch = await manager.detectDefaultBranch();

      expect(defaultBranch).toBeUndefined();
    });
  });

  describe('getCurrentBranch', () => {
    it('returns the current branch name', async () => {
      const manager = createManager();
      const current = await manager.getCurrentBranch();
      expect(current).toBe('master');
    });
  });

  describe('identity validation', () => {
    it('blocks push when identity mismatches', async () => {
      const guardMock = {
        guard: vi.fn().mockResolvedValue(false),
      };

      const manager = createManager({
        identityGuard: guardMock as unknown as undefined,
      });

      await expect(manager.push()).rejects.toThrow('Identity mismatch');
    });

    it('blocks pull when identity mismatches', async () => {
      const guardMock = {
        guard: vi.fn().mockResolvedValue(false),
      };

      const manager = createManager({
        identityGuard: guardMock as unknown as undefined,
      });

      await expect(manager.pull()).rejects.toThrow('Identity mismatch');
    });
  });
});
