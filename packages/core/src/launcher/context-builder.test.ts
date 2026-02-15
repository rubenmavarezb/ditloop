import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { ContextBuilder, BuiltContext } from './context-builder.js';
import { EventBus } from '../events/index.js';

describe('ContextBuilder', () => {
  let tempDir: string;
  let eventBus: EventBus;
  let builder: ContextBuilder;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-ctx-'));
    eventBus = new EventBus();
    builder = new ContextBuilder(eventBus);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createAidfWorkspace(base: string): void {
    const aiDir = join(base, '.ai');
    mkdirSync(join(aiDir, 'tasks'), { recursive: true });
    mkdirSync(join(aiDir, 'roles'), { recursive: true });

    writeFileSync(join(aiDir, 'AGENTS.md'), '# Agents\nProject context.');

    writeFileSync(join(aiDir, 'tasks', '001-test-task.md'), [
      '# TASK: Test Task',
      '',
      '## Goal',
      'Implement the test feature.',
      '',
      '## Scope',
      '### Allowed',
      '- src/',
      '',
      '## Requirements',
      '1. Must work',
      '',
      '## Definition of Done',
      '- [ ] Tests pass',
      '',
      '## Status: 🔄 In Progress',
    ].join('\n'));

    writeFileSync(join(aiDir, 'roles', 'developer.md'), [
      '# Developer',
      '',
      'You are a senior developer focused on quality code.',
    ].join('\n'));

    // Create some project files
    writeFileSync(join(base, 'package.json'), '{"name": "test-project"}');
    mkdirSync(join(base, 'src'), { recursive: true });
    writeFileSync(join(base, 'src', 'index.ts'), 'export {};');
  }

  function initGitRepo(dir: string): void {
    execSync('git init', { cwd: dir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: dir, stdio: 'ignore' });
    execSync('git add -A && git commit -m "init"', { cwd: dir, stdio: 'ignore' });
  }

  it('builds context with all sections from AIDF workspace', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
      workspaceName: 'test-project',
      taskId: '001-test-task',
      roleId: 'developer',
    });

    expect(result.sectionNames).toContain('project');
    expect(result.sectionNames).toContain('role');
    expect(result.sectionNames).toContain('task');
    expect(result.sectionNames).toContain('git');
    expect(result.sectionNames).toContain('structure');
    expect(result.size).toBeGreaterThan(0);
  });

  it('generates valid markdown output', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
      workspaceName: 'test-project',
    });

    const md = result.toMarkdown();
    expect(md).toContain('# DitLoop Context');
    expect(md).toContain('## Project');
    expect(md).toContain('test-project');
  });

  it('generates system prompt output', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
    });

    const prompt = result.toSystemPrompt();
    expect(prompt).toContain('## Project');
    expect(prompt).not.toContain('# DitLoop Context');
  });

  it('writes context to file', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
    });

    const outPath = join(tempDir, 'context.md');
    result.toFile(outPath);

    const content = readFileSync(outPath, 'utf-8');
    expect(content).toContain('# DitLoop Context');
  });

  it('truncates lower-priority sections when over maxSize', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
      workspaceName: 'test-project',
      taskId: '001-test-task',
      roleId: 'developer',
      maxSize: 200,
    });

    // Structure (lowest priority) should be dropped first
    expect(result.sectionNames).toContain('project');
    expect(result.size).toBeLessThanOrEqual(200);
  });

  it('emits launcher:context-built event', async () => {
    createAidfWorkspace(tempDir);
    initGitRepo(tempDir);

    let emitted: unknown = null;
    eventBus.on('launcher:context-built', (payload) => {
      emitted = payload;
    });

    await builder.build({
      workspacePath: tempDir,
      workspaceName: 'test-project',
    });

    expect(emitted).not.toBeNull();
    expect((emitted as { workspace: string }).workspace).toBe('test-project');
  });

  it('works without git repo', async () => {
    createAidfWorkspace(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
      includeGit: true,
    });

    expect(result.sectionNames).not.toContain('git');
    expect(result.sectionNames).toContain('project');
  });

  it('works without AIDF directory', async () => {
    writeFileSync(join(tempDir, 'index.ts'), 'export {};');
    initGitRepo(tempDir);

    const result = await builder.build({
      workspacePath: tempDir,
    });

    expect(result.sectionNames).toContain('project');
    expect(result.sectionNames).toContain('git');
    expect(result.sectionNames).not.toContain('role');
    expect(result.sectionNames).not.toContain('task');
  });
});
