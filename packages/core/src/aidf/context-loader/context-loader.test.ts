import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ContextLoader } from './context-loader.js';

describe('ContextLoader', () => {
  let tempDir: string;
  let loader: ContextLoader;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-cl-'));
    loader = new ContextLoader();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns empty context when .ai/ does not exist', () => {
    const ctx = loader.load(tempDir);

    expect(ctx.capabilities.present).toBe(false);
    expect(ctx.agentsContent).toBeUndefined();
    expect(ctx.tasks).toEqual([]);
    expect(ctx.roles).toEqual([]);
    expect(ctx.skills).toEqual([]);
    expect(ctx.plans).toEqual([]);
  });

  it('loads AGENTS.md content', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(aiDir);
    writeFileSync(join(aiDir, 'AGENTS.md'), '# Project Agent Context\n\nUse TypeScript.');

    const ctx = loader.load(tempDir);

    expect(ctx.capabilities.present).toBe(true);
    expect(ctx.agentsContent).toContain('Project Agent Context');
  });

  it('loads tasks from .ai/tasks/', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(join(aiDir, 'tasks'), { recursive: true });
    writeFileSync(join(aiDir, 'tasks', '001-setup.md'), `# TASK: Setup\n\n## Goal\nInitial setup.\n\n## Status: ⬜ Pending\n`);
    writeFileSync(join(aiDir, 'tasks', '002-build.md'), `# TASK: Build\n\n## Goal\nBuild system.\n\n## Status: ✅ Done\n`);

    const ctx = loader.load(tempDir);

    expect(ctx.tasks).toHaveLength(2);
    expect(ctx.tasks.find(t => t.id === '001-setup')?.status).toBe('pending');
    expect(ctx.tasks.find(t => t.id === '002-build')?.status).toBe('done');
  });

  it('loads roles from .ai/roles/', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(join(aiDir, 'roles'), { recursive: true });
    writeFileSync(join(aiDir, 'roles', 'architect.md'), '# Architect\n\nDesign systems.');

    const ctx = loader.load(tempDir);

    expect(ctx.roles).toHaveLength(1);
    expect(ctx.roles[0].id).toBe('architect');
    expect(ctx.roles[0].name).toBe('Architect');
  });

  it('loads skills from .ai/skills/<name>/SKILL.md', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(join(aiDir, 'skills', 'code-review'), { recursive: true });
    writeFileSync(join(aiDir, 'skills', 'code-review', 'SKILL.md'), '# Code Review\n\nReview PRs.');

    const ctx = loader.load(tempDir);

    expect(ctx.skills).toHaveLength(1);
    expect(ctx.skills[0].id).toBe('code-review');
    expect(ctx.skills[0].name).toBe('Code Review');
  });

  it('loads plans from .ai/plans/', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(join(aiDir, 'plans'), { recursive: true });
    writeFileSync(join(aiDir, 'plans', 'PLAN-v1.md'), `# PLAN: Version 1

## Overview
First release plan.

## Tasks

### Step 1: Foundation (001)

\`001-setup.md\` — Initial project setup
`);

    const ctx = loader.load(tempDir);

    expect(ctx.plans).toHaveLength(1);
    expect(ctx.plans[0].id).toBe('PLAN-v1');
    expect(ctx.plans[0].title).toBe('Version 1');
  });

  it('handles full AIDF setup with all features', () => {
    const aiDir = join(tempDir, '.ai');
    mkdirSync(join(aiDir, 'tasks'), { recursive: true });
    mkdirSync(join(aiDir, 'roles'));
    mkdirSync(join(aiDir, 'skills', 'testing'), { recursive: true });
    mkdirSync(join(aiDir, 'plans'));
    mkdirSync(join(aiDir, 'templates'));
    writeFileSync(join(aiDir, 'AGENTS.md'), '# Context');
    writeFileSync(join(aiDir, 'config.yml'), 'version: 1');
    writeFileSync(join(aiDir, 'tasks', '001.md'), '# Task 1\n\n## Status: ⬜ Pending\n');
    writeFileSync(join(aiDir, 'roles', 'dev.md'), '# Developer');
    writeFileSync(join(aiDir, 'skills', 'testing', 'SKILL.md'), '# Testing');
    writeFileSync(join(aiDir, 'plans', 'PLAN-main.md'), '# PLAN: Main\n\n## Overview\nMain plan.');

    const ctx = loader.load(tempDir);

    expect(ctx.capabilities.present).toBe(true);
    expect(ctx.capabilities.hasAgentsFile).toBe(true);
    expect(ctx.capabilities.hasConfig).toBe(true);
    expect(ctx.capabilities.features.size).toBe(5);
    expect(ctx.agentsContent).toContain('Context');
    expect(ctx.tasks).toHaveLength(1);
    expect(ctx.roles).toHaveLength(1);
    expect(ctx.skills).toHaveLength(1);
    expect(ctx.plans).toHaveLength(1);
  });
});
