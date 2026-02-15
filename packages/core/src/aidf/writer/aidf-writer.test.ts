import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { AidfWriter } from './aidf-writer.js';
import { EventBus } from '../../events/index.js';

describe('AidfWriter', () => {
  let tempDir: string;
  let eventBus: EventBus;
  let writer: AidfWriter;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-writer-'));
    // Create .ai directory structure
    mkdirSync(join(tempDir, '.ai', 'tasks'), { recursive: true });
    mkdirSync(join(tempDir, '.ai', 'roles'), { recursive: true });
    mkdirSync(join(tempDir, '.ai', 'skills'), { recursive: true });
    mkdirSync(join(tempDir, '.ai', 'plans'), { recursive: true });

    eventBus = new EventBus();
    writer = new AidfWriter('test-workspace', eventBus);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('create', () => {
    it('creates a task file with content', () => {
      const path = writer.create({
        type: 'task',
        id: '001-test',
        content: '# TASK: Test\n\n## Goal\nDo something.',
        workspacePath: tempDir,
      });

      expect(existsSync(path)).toBe(true);
      const content = readFileSync(path, 'utf-8');
      expect(content).toContain('# TASK: Test');
      expect(content).toContain('## Goal');
    });

    it('creates a task file with frontmatter', () => {
      const path = writer.create({
        type: 'task',
        id: '002-fm',
        frontmatter: { title: 'Test Task', status: 'pending' },
        content: '# TASK: Test Task\n\n## Goal\nDo something.',
        workspacePath: tempDir,
      });

      const content = readFileSync(path, 'utf-8');
      expect(content).toContain('title: Test Task');
      expect(content).toContain('status: pending');
    });

    it('creates a role file', () => {
      const path = writer.create({
        type: 'role',
        id: 'developer',
        content: '# Developer\n\nYou are a developer.',
        workspacePath: tempDir,
      });

      expect(path).toContain('.ai/roles/developer.md');
      expect(existsSync(path)).toBe(true);
    });

    it('throws if file already exists', () => {
      writer.create({
        type: 'task',
        id: 'dup',
        content: 'First',
        workspacePath: tempDir,
      });

      expect(() => writer.create({
        type: 'task',
        id: 'dup',
        content: 'Second',
        workspacePath: tempDir,
      })).toThrow('already exists');
    });

    it('emits aidf:created event', () => {
      let emitted: unknown = null;
      eventBus.on('aidf:created', (payload) => { emitted = payload; });

      writer.create({
        type: 'task',
        id: 'evented',
        content: '# Task',
        workspacePath: tempDir,
      });

      expect(emitted).toMatchObject({
        workspace: 'test-workspace',
        type: 'task',
        id: 'evented',
      });
    });

    it('creates directory if it does not exist', () => {
      const newDir = join(tempDir, 'new-workspace');
      mkdirSync(newDir);

      writer.create({
        type: 'task',
        id: 'auto-dir',
        content: '# Task',
        workspacePath: newDir,
      });

      expect(existsSync(join(newDir, '.ai', 'tasks', 'auto-dir.md'))).toBe(true);
    });
  });

  describe('update', () => {
    it('updates content of existing file', () => {
      writer.create({
        type: 'task',
        id: 'upd',
        content: '# Old',
        workspacePath: tempDir,
      });

      writer.update({
        type: 'task',
        id: 'upd',
        content: '# Updated',
        workspacePath: tempDir,
      });

      const data = writer.read('task', 'upd', tempDir);
      expect(data?.content).toContain('# Updated');
    });

    it('merges frontmatter', () => {
      writer.create({
        type: 'task',
        id: 'merge',
        frontmatter: { title: 'Original', status: 'pending' },
        content: '# Task',
        workspacePath: tempDir,
      });

      writer.update({
        type: 'task',
        id: 'merge',
        frontmatter: { status: 'in-progress' },
        workspacePath: tempDir,
      });

      const data = writer.read('task', 'merge', tempDir);
      expect(data?.frontmatter.title).toBe('Original');
      expect(data?.frontmatter.status).toBe('in-progress');
    });

    it('throws if file does not exist', () => {
      expect(() => writer.update({
        type: 'task',
        id: 'nonexistent',
        content: '# X',
        workspacePath: tempDir,
      })).toThrow('not found');
    });

    it('emits aidf:updated event', () => {
      let emitted: unknown = null;
      eventBus.on('aidf:updated', (payload) => { emitted = payload; });

      writer.create({
        type: 'role',
        id: 'upd-role',
        content: '# Role',
        workspacePath: tempDir,
      });

      writer.update({
        type: 'role',
        id: 'upd-role',
        content: '# Updated Role',
        workspacePath: tempDir,
      });

      expect(emitted).toMatchObject({ type: 'role', id: 'upd-role' });
    });
  });

  describe('delete', () => {
    it('deletes existing file', () => {
      const path = writer.create({
        type: 'task',
        id: 'del',
        content: '# Del',
        workspacePath: tempDir,
      });

      writer.delete({ type: 'task', id: 'del', workspacePath: tempDir });
      expect(existsSync(path)).toBe(false);
    });

    it('throws if file does not exist', () => {
      expect(() => writer.delete({
        type: 'task',
        id: 'nope',
        workspacePath: tempDir,
      })).toThrow('not found');
    });

    it('emits aidf:deleted event', () => {
      let emitted: unknown = null;
      eventBus.on('aidf:deleted', (payload) => { emitted = payload; });

      writer.create({
        type: 'plan',
        id: 'del-plan',
        content: '# Plan',
        workspacePath: tempDir,
      });

      writer.delete({ type: 'plan', id: 'del-plan', workspacePath: tempDir });
      expect(emitted).toMatchObject({ type: 'plan', id: 'del-plan' });
    });
  });

  describe('exists', () => {
    it('returns true for existing file', () => {
      writer.create({
        type: 'task',
        id: 'ex',
        content: '# Task',
        workspacePath: tempDir,
      });
      expect(writer.exists('task', 'ex', tempDir)).toBe(true);
    });

    it('returns false for missing file', () => {
      expect(writer.exists('task', 'missing', tempDir)).toBe(false);
    });
  });

  describe('read', () => {
    it('reads file with frontmatter and content', () => {
      writer.create({
        type: 'task',
        id: 'readable',
        frontmatter: { title: 'Readable' },
        content: '# Task\n\nBody here.',
        workspacePath: tempDir,
      });

      const data = writer.read('task', 'readable', tempDir);
      expect(data).toBeDefined();
      expect(data?.frontmatter.title).toBe('Readable');
      expect(data?.content).toContain('Body here.');
    });

    it('returns undefined for missing file', () => {
      expect(writer.read('task', 'nope', tempDir)).toBeUndefined();
    });
  });
});
