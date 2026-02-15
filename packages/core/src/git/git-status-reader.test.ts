import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import simpleGit from 'simple-git';
import { writeFile } from 'node:fs/promises';
import { GitStatusReader } from './git-status-reader.js';
import { EventBus } from '../events/index.js';

describe('GitStatusReader', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-git-test-'));
    const git = simpleGit(tempDir);
    await git.init();
    await git.addConfig('user.email', 'test@test.com');
    await git.addConfig('user.name', 'Test User');
    // Create initial commit so we have a branch
    await writeFile(join(tempDir, 'README.md'), '# Test');
    await git.add('README.md');
    await git.commit('initial commit');

    eventBus = new EventBus();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns clean status for a clean repo', async () => {
    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
      eventBus,
    });

    const status = await reader.getStatus();

    expect(status.currentBranch).toBe('master');
    expect(status.isDirty).toBe(false);
    expect(status.staged).toHaveLength(0);
    expect(status.unstaged).toHaveLength(0);
    expect(status.untracked).toHaveLength(0);
    expect(status.isDetachedHead).toBe(false);
  });

  it('detects untracked files', async () => {
    await writeFile(join(tempDir, 'new-file.txt'), 'hello');

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
    });

    const status = await reader.getStatus();

    expect(status.isDirty).toBe(true);
    expect(status.untracked).toContain('new-file.txt');
  });

  it('detects staged files', async () => {
    await writeFile(join(tempDir, 'staged.txt'), 'content');
    const git = simpleGit(tempDir);
    await git.add('staged.txt');

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
    });

    const status = await reader.getStatus();

    expect(status.isDirty).toBe(true);
    expect(status.staged).toHaveLength(1);
    expect(status.staged[0].path).toBe('staged.txt');
  });

  it('detects unstaged modified files', async () => {
    await writeFile(join(tempDir, 'README.md'), '# Modified');

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
    });

    const status = await reader.getStatus();

    expect(status.isDirty).toBe(true);
    expect(status.unstaged.some((f) => f.path === 'README.md')).toBe(true);
  });

  it('emits git:status-changed on first read', async () => {
    const handler = vi.fn();
    eventBus.on('git:status-changed', handler);

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
      eventBus,
    });

    await reader.getStatus();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        workspace: 'test-ws',
        branch: 'master',
      }),
    );
  });

  it('does not emit when status has not changed', async () => {
    const handler = vi.fn();
    eventBus.on('git:status-changed', handler);

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
      eventBus,
    });

    await reader.getStatus();
    await reader.getStatus();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('emits when status changes between reads', async () => {
    const handler = vi.fn();
    eventBus.on('git:status-changed', handler);

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
      eventBus,
    });

    await reader.getStatus();
    await writeFile(join(tempDir, 'new.txt'), 'data');
    await reader.getStatus();

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('handles detached HEAD state', async () => {
    const git = simpleGit(tempDir);
    const log = await git.log();
    await git.checkout(log.latest!.hash);

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
    });

    const status = await reader.getStatus();

    expect(status.isDetachedHead).toBe(true);
  });

  it('starts and stops polling', async () => {
    vi.useFakeTimers();

    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
      eventBus,
      pollInterval: 1000,
    });

    const getStatusSpy = vi.spyOn(reader, 'getStatus');

    reader.startPolling();

    // Starting polling again should be idempotent
    reader.startPolling();

    await vi.advanceTimersByTimeAsync(3000);

    expect(getStatusSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

    reader.stopPolling();

    const callCount = getStatusSpy.mock.calls.length;
    await vi.advanceTimersByTimeAsync(3000);

    expect(getStatusSpy.mock.calls.length).toBe(callCount);

    vi.useRealTimers();
  });

  it('exposes the underlying simple-git instance', () => {
    const reader = new GitStatusReader({
      repoPath: tempDir,
      workspace: 'test-ws',
    });

    expect(reader.getGit()).toBeDefined();
  });
});
