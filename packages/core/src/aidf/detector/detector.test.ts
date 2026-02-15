import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { AidfDetector } from './detector.js';

describe('AidfDetector', () => {
  let tempDir: string;
  let detector: AidfDetector;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-aidf-'));
    detector = new AidfDetector();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('detect', () => {
    it('returns not present when .ai/ does not exist', () => {
      const result = detector.detect(tempDir);

      expect(result.present).toBe(false);
      expect(result.aidfPath).toBe(join(tempDir, '.ai'));
      expect(result.hasAgentsFile).toBe(false);
      expect(result.hasConfig).toBe(false);
      expect(result.features.size).toBe(0);
    });

    it('detects empty .ai/ folder', () => {
      mkdirSync(join(tempDir, '.ai'));

      const result = detector.detect(tempDir);

      expect(result.present).toBe(true);
      expect(result.hasAgentsFile).toBe(false);
      expect(result.hasConfig).toBe(false);
      expect(result.features.size).toBe(0);
    });

    it('detects AGENTS.md', () => {
      mkdirSync(join(tempDir, '.ai'));
      writeFileSync(join(tempDir, '.ai', 'AGENTS.md'), '# Agent context');

      const result = detector.detect(tempDir);

      expect(result.present).toBe(true);
      expect(result.hasAgentsFile).toBe(true);
    });

    it('detects config.yml', () => {
      mkdirSync(join(tempDir, '.ai'));
      writeFileSync(join(tempDir, '.ai', 'config.yml'), 'version: 1');

      const result = detector.detect(tempDir);

      expect(result.present).toBe(true);
      expect(result.hasConfig).toBe(true);
    });

    it('detects all feature directories', () => {
      const aiDir = join(tempDir, '.ai');
      mkdirSync(aiDir);
      mkdirSync(join(aiDir, 'tasks'));
      mkdirSync(join(aiDir, 'roles'));
      mkdirSync(join(aiDir, 'skills'));
      mkdirSync(join(aiDir, 'plans'));
      mkdirSync(join(aiDir, 'templates'));

      const result = detector.detect(tempDir);

      expect(result.features.size).toBe(5);
      expect(result.features.has('tasks')).toBe(true);
      expect(result.features.has('roles')).toBe(true);
      expect(result.features.has('skills')).toBe(true);
      expect(result.features.has('plans')).toBe(true);
      expect(result.features.has('templates')).toBe(true);
    });

    it('detects partial AIDF setup', () => {
      const aiDir = join(tempDir, '.ai');
      mkdirSync(aiDir);
      writeFileSync(join(aiDir, 'AGENTS.md'), '# Context');
      mkdirSync(join(aiDir, 'tasks'));
      mkdirSync(join(aiDir, 'roles'));

      const result = detector.detect(tempDir);

      expect(result.present).toBe(true);
      expect(result.hasAgentsFile).toBe(true);
      expect(result.hasConfig).toBe(false);
      expect(result.features.size).toBe(2);
      expect(result.features.has('tasks')).toBe(true);
      expect(result.features.has('roles')).toBe(true);
      expect(result.features.has('skills')).toBe(false);
    });

    it('works for group-level .ai/ directories', () => {
      // Group root with .ai/
      const groupDir = join(tempDir, 'my-org');
      mkdirSync(groupDir, { recursive: true });
      mkdirSync(join(groupDir, '.ai', 'tasks'), { recursive: true });
      mkdirSync(join(groupDir, '.ai', 'roles'));
      writeFileSync(join(groupDir, '.ai', 'AGENTS.md'), '# Org context');

      // Sub-project with its own .ai/
      const projectDir = join(groupDir, 'project-a');
      mkdirSync(projectDir, { recursive: true });
      mkdirSync(join(projectDir, '.ai', 'tasks'), { recursive: true });

      const groupResult = detector.detect(groupDir);
      const projectResult = detector.detect(projectDir);

      expect(groupResult.present).toBe(true);
      expect(groupResult.hasAgentsFile).toBe(true);
      expect(groupResult.features.has('tasks')).toBe(true);
      expect(groupResult.features.has('roles')).toBe(true);

      expect(projectResult.present).toBe(true);
      expect(projectResult.hasAgentsFile).toBe(false);
      expect(projectResult.features.has('tasks')).toBe(true);
    });
  });

  describe('hasAidf', () => {
    it('returns false when .ai/ does not exist', () => {
      expect(detector.hasAidf(tempDir)).toBe(false);
    });

    it('returns true when .ai/ exists', () => {
      mkdirSync(join(tempDir, '.ai'));
      expect(detector.hasAidf(tempDir)).toBe(true);
    });
  });
});
