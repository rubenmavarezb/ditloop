import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import simpleGit from 'simple-git';
import { GitCommitManager } from './git-commit-manager.js';
import { EventBus } from '../events/index.js';

describe('GitCommitManager', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-commit-test-'));
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
    return new GitCommitManager({
      git,
      workspace: 'test-ws',
      profileName: 'test',
      eventBus,
      ...options,
    });
  }

  describe('stageFiles', () => {
    it('stages files for commit', async () => {
      await writeFile(join(tempDir, 'new.txt'), 'content');
      const manager = createManager();
      await manager.stageFiles(['new.txt']);

      const git = simpleGit(tempDir);
      const status = await git.status();
      expect(status.staged).toContain('new.txt');
    });

    it('handles empty file list gracefully', async () => {
      const manager = createManager();
      await expect(manager.stageFiles([])).resolves.not.toThrow();
    });
  });

  describe('unstageFiles', () => {
    it('unstages files from staging area', async () => {
      await writeFile(join(tempDir, 'staged.txt'), 'content');
      const git = simpleGit(tempDir);
      await git.add('staged.txt');

      const manager = createManager();
      await manager.unstageFiles(['staged.txt']);

      const status = await git.status();
      expect(status.staged).not.toContain('staged.txt');
    });

    it('handles empty file list gracefully', async () => {
      const manager = createManager();
      await expect(manager.unstageFiles([])).resolves.not.toThrow();
    });
  });

  describe('commit', () => {
    it('creates a commit with conventional format', async () => {
      await writeFile(join(tempDir, 'feature.txt'), 'feature');
      const git = simpleGit(tempDir);
      await git.add('feature.txt');

      const manager = createManager();
      const result = await manager.commit('feat(git): add commit manager');

      expect(result.hash).toBeTruthy();
      expect(result.message).toBe('feat(git): add commit manager');
      expect(result.dryRun).toBe(false);
    });

    it('emits git:commit event', async () => {
      await writeFile(join(tempDir, 'feature.txt'), 'feature');
      const git = simpleGit(tempDir);
      await git.add('feature.txt');

      const handler = vi.fn();
      eventBus.on('git:commit', handler);

      const manager = createManager();
      await manager.commit('feat: add new feature');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          workspace: 'test-ws',
          message: 'feat: add new feature',
        }),
      );
    });

    it('rejects non-conventional commit messages', async () => {
      const manager = createManager();
      await expect(manager.commit('bad message')).rejects.toThrow(
        'Invalid conventional commit format',
      );
    });

    it('supports dry-run mode', async () => {
      await writeFile(join(tempDir, 'feature.txt'), 'feature');
      const git = simpleGit(tempDir);
      await git.add('feature.txt');

      const manager = createManager();
      const result = await manager.commit('feat: dry run', { dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.hash).toBe('(dry-run)');

      // Verify no actual commit was made
      const log = await git.log();
      expect(log.latest?.message).toBe('initial commit');
    });

    it('validates identity before committing', async () => {
      const guardMock = {
        guard: vi.fn().mockResolvedValue(false),
      };

      await writeFile(join(tempDir, 'feature.txt'), 'feature');
      const git = simpleGit(tempDir);
      await git.add('feature.txt');

      const manager = createManager({
        identityGuard: guardMock as unknown as undefined,
      });

      await expect(manager.commit('feat: blocked')).rejects.toThrow(
        'Identity mismatch',
      );
    });

    it('accepts various conventional commit types', async () => {
      const manager = createManager();

      const validMessages = [
        'feat: new feature',
        'fix: bug fix',
        'refactor(core): restructure',
        'test: add tests',
        'docs: update readme',
        'chore: update deps',
        'feat!: breaking change',
      ];

      for (const msg of validMessages) {
        expect(manager.validateConventionalFormat(msg)).toBe(true);
      }
    });
  });

  describe('amendCommit', () => {
    it('amends the last commit with a new message', async () => {
      await writeFile(join(tempDir, 'amend.txt'), 'amend');
      const git = simpleGit(tempDir);
      await git.add('amend.txt');
      await git.commit('feat: original');

      const manager = createManager();
      const result = await manager.amendCommit('feat: amended');

      expect(result.message).toBe('feat: amended');

      const log = await git.log();
      expect(log.latest?.message).toBe('feat: amended');
    });
  });
});
