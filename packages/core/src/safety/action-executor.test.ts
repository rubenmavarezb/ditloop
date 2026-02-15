import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { ActionExecutor } from './action-executor.js';

describe('ActionExecutor', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ditloop-executor-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  function createExecutor() {
    return new ActionExecutor({ workspacePath: tempDir });
  }

  describe('file_create', () => {
    it('creates a new file', async () => {
      const executor = createExecutor();
      const result = await executor.execute({
        type: 'file_create',
        path: 'new-file.ts',
        content: 'export const x = 1;',
      });

      expect(result.success).toBe(true);

      const content = await readFile(join(tempDir, 'new-file.ts'), 'utf-8');
      expect(content).toBe('export const x = 1;');
    });

    it('creates nested directories', async () => {
      const executor = createExecutor();
      const result = await executor.execute({
        type: 'file_create',
        path: 'src/deep/nested/file.ts',
        content: 'test',
      });

      expect(result.success).toBe(true);
      const content = await readFile(join(tempDir, 'src/deep/nested/file.ts'), 'utf-8');
      expect(content).toBe('test');
    });
  });

  describe('file_edit', () => {
    it('edits an existing file', async () => {
      await writeFile(join(tempDir, 'existing.ts'), 'const a = 1;\nconst b = 2;');

      const executor = createExecutor();
      const result = await executor.execute({
        type: 'file_edit',
        path: 'existing.ts',
        oldContent: 'const a = 1;',
        newContent: 'const a = 42;',
      });

      expect(result.success).toBe(true);

      const content = await readFile(join(tempDir, 'existing.ts'), 'utf-8');
      expect(content).toBe('const a = 42;\nconst b = 2;');
    });

    it('fails when old content not found', async () => {
      await writeFile(join(tempDir, 'file.ts'), 'hello');

      const executor = createExecutor();
      const result = await executor.execute({
        type: 'file_edit',
        path: 'file.ts',
        oldContent: 'not found',
        newContent: 'replacement',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot find content');
    });
  });

  describe('shell_command', () => {
    it('executes a simple command', async () => {
      const executor = createExecutor();
      const result = await executor.execute({
        type: 'shell_command',
        command: 'echo hello',
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('hello');
    });

    it('blocks dangerous commands', async () => {
      const executor = createExecutor();

      const dangerousCommands = [
        'rm -rf /',
        'sudo apt install something',
        'rm -rf *',
      ];

      for (const command of dangerousCommands) {
        const result = await executor.execute({
          type: 'shell_command',
          command,
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Blocked dangerous command');
      }
    });

    it('runs with custom cwd', async () => {
      const subDir = join(tempDir, 'subdir');
      await mkdir(subDir);
      await writeFile(join(subDir, 'test.txt'), 'content');

      const executor = createExecutor();
      const result = await executor.execute({
        type: 'shell_command',
        command: 'ls',
        cwd: subDir,
      });

      expect(result.success).toBe(true);
      expect(result.output).toContain('test.txt');
    });
  });

  describe('rollback', () => {
    it('restores file from backup', async () => {
      const originalContent = 'original content';
      await writeFile(join(tempDir, 'rollback.ts'), originalContent);

      const executor = createExecutor();
      const result = await executor.execute({
        type: 'file_edit',
        path: 'rollback.ts',
        oldContent: 'original',
        newContent: 'modified',
      });

      expect(result.success).toBe(true);

      // Verify edit was applied
      let content = await readFile(join(tempDir, 'rollback.ts'), 'utf-8');
      expect(content).toContain('modified');

      // Rollback
      const rolledBack = await executor.rollback(result.id);
      expect(rolledBack).toBe(true);

      content = await readFile(join(tempDir, 'rollback.ts'), 'utf-8');
      expect(content).toBe(originalContent);
    });

    it('returns false for unknown execution ID', async () => {
      const executor = createExecutor();
      const result = await executor.rollback('unknown-id');
      expect(result).toBe(false);
    });
  });

  describe('validateCommand', () => {
    it('allows safe commands', () => {
      const executor = createExecutor();
      expect(() => executor.validateCommand('npm test')).not.toThrow();
      expect(() => executor.validateCommand('pnpm build')).not.toThrow();
      expect(() => executor.validateCommand('git status')).not.toThrow();
    });

    it('blocks rm -rf /', () => {
      const executor = createExecutor();
      expect(() => executor.validateCommand('rm -rf /')).toThrow('Blocked');
    });

    it('blocks sudo', () => {
      const executor = createExecutor();
      expect(() => executor.validateCommand('sudo npm install')).toThrow('Blocked');
    });
  });
});
