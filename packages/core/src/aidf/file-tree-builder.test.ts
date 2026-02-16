import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileTreeBuilder } from './file-tree-builder.js';

describe('FileTreeBuilder', () => {
  let tempDir: string;
  let builder: FileTreeBuilder;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-test-'));
    builder = new FileTreeBuilder();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  it('builds a tree from a directory with files', async () => {
    await writeFile(join(tempDir, 'AGENTS.md'), '# Agents');
    await writeFile(join(tempDir, 'config.yml'), 'key: value');

    const tree = await builder.build(tempDir);
    expect(tree).toBeDefined();
    expect(tree!.type).toBe('dir');
    expect(tree!.children).toHaveLength(2);
    expect(tree!.children![0].name).toBe('AGENTS.md');
    expect(tree!.children![1].name).toBe('config.yml');
  });

  it('builds nested directory structure', async () => {
    await mkdir(join(tempDir, 'tasks'));
    await writeFile(join(tempDir, 'tasks', 'TASK-001.md'), '# Task');
    await mkdir(join(tempDir, 'roles'));
    await writeFile(join(tempDir, 'roles', 'developer.md'), '# Dev');

    const tree = await builder.build(tempDir);
    expect(tree!.children).toHaveLength(2);
    // Directories first, alphabetically
    expect(tree!.children![0].name).toBe('roles');
    expect(tree!.children![0].type).toBe('dir');
    expect(tree!.children![0].children).toHaveLength(1);
    expect(tree!.children![1].name).toBe('tasks');
  });

  it('returns undefined for non-existent path', async () => {
    const tree = await builder.build('/nonexistent/path/abc123');
    expect(tree).toBeUndefined();
  });

  it('returns undefined for a file path', async () => {
    const filePath = join(tempDir, 'file.txt');
    await writeFile(filePath, 'content');
    const tree = await builder.build(filePath);
    expect(tree).toBeUndefined();
  });

  it('handles empty directory', async () => {
    const tree = await builder.build(tempDir);
    expect(tree).toBeDefined();
    expect(tree!.children).toEqual([]);
  });
});
