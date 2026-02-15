import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { GroupResolver, autoDiscover } from './group-resolver.js';
import type { GroupWorkspace } from '../config/index.js';

describe('GroupResolver', () => {
  let tempDir: string;
  let resolver: GroupResolver;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-test-'));
    resolver = new GroupResolver();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createRepo(name: string): void {
    const repoPath = join(tempDir, name);
    mkdirSync(repoPath, { recursive: true });
    mkdirSync(join(repoPath, '.git'));
  }

  function createDir(name: string): void {
    mkdirSync(join(tempDir, name), { recursive: true });
  }

  function makeGroupWorkspace(overrides: Partial<GroupWorkspace> = {}): GroupWorkspace {
    return {
      type: 'group' as const,
      name: 'Test Group',
      path: tempDir,
      profile: 'default',
      aidf: true,
      autoDiscover: true,
      exclude: [],
      ...overrides,
    };
  }

  it('discovers directories containing .git', () => {
    createRepo('project-alpha');
    createRepo('project-beta');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('project-alpha');
    expect(result[1].name).toBe('project-beta');
    expect(result[0].path).toBe(join(tempDir, 'project-alpha'));
  });

  it('ignores directories without .git', () => {
    createRepo('has-git');
    createDir('no-git');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('has-git');
  });

  it('ignores hidden directories', () => {
    createRepo('.hidden-repo');
    createRepo('visible-repo');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('visible-repo');
  });

  it('respects the exclude list', () => {
    createRepo('keep-me');
    createRepo('skip-me');
    createRepo('also-skip');

    const result = resolver.resolve(makeGroupWorkspace({
      exclude: ['skip-me', 'also-skip'],
    }));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('keep-me');
  });

  it('returns empty array for non-existent path', () => {
    const result = resolver.resolve(makeGroupWorkspace({
      path: '/tmp/does-not-exist-ditloop-test',
    }));

    expect(result).toEqual([]);
  });

  it('generates slugified IDs', () => {
    createRepo('My Cool Project');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result[0].id).toBe('my-cool-project');
  });

  it('sorts results alphabetically by name', () => {
    createRepo('zebra');
    createRepo('apple');
    createRepo('mango');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result.map(p => p.name)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('ignores files (non-directories)', () => {
    createRepo('real-project');
    writeFileSync(join(tempDir, 'some-file.txt'), 'hello');

    const result = resolver.resolve(makeGroupWorkspace());

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('real-project');
  });
});

describe('autoDiscover', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-autodiscover-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createRepo(name: string): void {
    const repoPath = join(tempDir, name);
    mkdirSync(repoPath, { recursive: true });
    mkdirSync(join(repoPath, '.git'));
  }

  it('discovers git repos at depth 1', () => {
    createRepo('repo-a');
    createRepo('repo-b');

    const result = autoDiscover(tempDir);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('repo-a');
    expect(result[1].name).toBe('repo-b');
  });

  it('respects exclude list', () => {
    createRepo('include-me');
    createRepo('exclude-me');

    const result = autoDiscover(tempDir, ['exclude-me']);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('include-me');
  });

  it('returns empty for non-existent path', () => {
    const result = autoDiscover('/tmp/nonexistent-ditloop-test');
    expect(result).toEqual([]);
  });
});
