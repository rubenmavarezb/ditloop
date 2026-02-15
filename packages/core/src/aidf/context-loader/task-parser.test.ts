import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { TaskParser } from './task-parser.js';

describe('TaskParser', () => {
  let tempDir: string;
  let parser: TaskParser;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-tp-'));
    mkdirSync(join(tempDir, 'tasks'));
    parser = new TaskParser();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const tasksDir = () => join(tempDir, 'tasks');

  it('parses a task file with all sections', () => {
    writeFileSync(join(tasksDir(), '007-aidf-detector.md'), `# TASK: AIDF Detector

## Goal
Implement detection of AIDF in projects.

## Scope

### Allowed
- packages/core/src/aidf/

### Forbidden
- packages/ui/

## Requirements
1. AidfDetector class
2. Detect presence of .ai/

## Definition of Done
- [ ] Detects .ai/ folder

## Status: ⬜ Pending
`);

    const tasks = parser.parseAll(tasksDir());

    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('007-aidf-detector');
    expect(tasks[0].title).toBe('AIDF Detector');
    expect(tasks[0].status).toBe('pending');
    expect(tasks[0].goal).toContain('Implement detection');
    expect(tasks[0].scope).toContain('Allowed');
    expect(tasks[0].requirements).toContain('AidfDetector class');
    expect(tasks[0].dod).toContain('Detects .ai/ folder');
  });

  it('parses status from emoji indicators', () => {
    const statuses = [
      { emoji: '⬜', expected: 'pending' },
      { emoji: '🔄', expected: 'in-progress' },
      { emoji: '✅', expected: 'done' },
      { emoji: '🚫', expected: 'blocked' },
    ] as const;

    for (const { emoji, expected } of statuses) {
      writeFileSync(join(tasksDir(), `test-${expected}.md`), `# Task\n\n## Status: ${emoji} ${expected}\n`);
    }

    const tasks = parser.parseAll(tasksDir());
    expect(tasks).toHaveLength(4);

    for (const { expected } of statuses) {
      const task = tasks.find(t => t.id === `test-${expected}`);
      expect(task?.status).toBe(expected);
    }
  });

  it('uses frontmatter title and status when present', () => {
    writeFileSync(join(tasksDir(), '001-test.md'), `---
title: Custom Title
status: done
---

# TASK: Ignored Title

## Status: ⬜ Pending
`);

    const task = parser.parseFile(join(tasksDir(), '001-test.md'));

    expect(task.title).toBe('Custom Title');
    expect(task.status).toBe('done');
  });

  it('returns unknown status when not found', () => {
    writeFileSync(join(tasksDir(), '002-no-status.md'), `# Task Without Status\n\n## Goal\nDo something.\n`);

    const task = parser.parseFile(join(tasksDir(), '002-no-status.md'));
    expect(task.status).toBe('unknown');
  });

  it('returns empty strings for missing sections', () => {
    writeFileSync(join(tasksDir(), '003-minimal.md'), `# Minimal Task\n`);

    const task = parser.parseFile(join(tasksDir(), '003-minimal.md'));
    expect(task.goal).toBe('');
    expect(task.scope).toBe('');
    expect(task.requirements).toBe('');
    expect(task.dod).toBe('');
  });

  it('ignores non-md files', () => {
    writeFileSync(join(tasksDir(), '001-task.md'), '# Task One\n');
    writeFileSync(join(tasksDir(), 'notes.txt'), 'some notes');

    const tasks = parser.parseAll(tasksDir());
    expect(tasks).toHaveLength(1);
  });
});
