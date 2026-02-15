import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { TemplateEngine } from './template-engine.js';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('loadBuiltIns', () => {
    it('loads all built-in templates', () => {
      engine.loadBuiltIns();
      const templates = engine.list();

      expect(templates.length).toBeGreaterThanOrEqual(6);
      expect(templates.map(t => t.id)).toContain('task');
      expect(templates.map(t => t.id)).toContain('role');
      expect(templates.map(t => t.id)).toContain('skill');
      expect(templates.map(t => t.id)).toContain('plan');
      expect(templates.map(t => t.id)).toContain('bug-fix');
      expect(templates.map(t => t.id)).toContain('feature');
    });

    it('only loads built-ins once', () => {
      engine.loadBuiltIns();
      engine.loadBuiltIns();
      const count = engine.list().length;
      expect(count).toBeGreaterThanOrEqual(6);
    });
  });

  describe('loadFromDirectory', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'ditloop-tpl-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('loads templates from a directory', () => {
      writeFileSync(join(tempDir, 'custom.md'), '# Custom Template\n\nHello {{name}}.');
      const count = engine.loadFromDirectory(tempDir);

      expect(count).toBe(1);
      expect(engine.get('custom')).toBeDefined();
      expect(engine.get('custom')?.name).toBe('Custom Template');
      expect(engine.get('custom')?.variables).toContain('name');
    });

    it('returns 0 for non-existent directory', () => {
      const count = engine.loadFromDirectory('/nonexistent/path');
      expect(count).toBe(0);
    });

    it('user templates override built-ins', () => {
      writeFileSync(join(tempDir, 'task.md'), '# My Custom Task\n\n{{title}}');
      engine.loadFromDirectory(tempDir);
      engine.loadBuiltIns();

      const tpl = engine.get('task');
      expect(tpl?.name).toBe('My Custom Task');
    });
  });

  describe('render', () => {
    it('interpolates variables', () => {
      engine.loadBuiltIns();

      const result = engine.render('task', {
        title: 'Build Feature',
        goal: 'Create something awesome',
      });

      expect(result.content).toContain('# TASK: Build Feature');
      expect(result.content).toContain('Create something awesome');
      expect(result.usedVariables).toContain('title');
      expect(result.usedVariables).toContain('goal');
    });

    it('keeps placeholders for missing variables', () => {
      engine.loadBuiltIns();
      const result = engine.render('task', { title: 'Test' });

      expect(result.content).toContain('{{goal}}');
      expect(result.missingVariables).toContain('goal');
    });

    it('throws for unknown template', () => {
      expect(() => engine.render('nonexistent', {})).toThrow('Template not found');
    });
  });

  describe('renderString', () => {
    it('handles {{#if}} blocks', () => {
      const raw = 'Before {{#if name}}Hello {{name}}!{{/if}} After';
      const result = engine.renderString(raw, { name: 'World' });

      expect(result.content).toBe('Before Hello World! After');
    });

    it('removes {{#if}} block when variable is missing', () => {
      const raw = 'Before {{#if name}}Hello {{name}}!{{/if}} After';
      const result = engine.renderString(raw, {});

      expect(result.content).toBe('Before  After');
    });

    it('handles {{#unless}} blocks', () => {
      const raw = '{{#unless name}}No name provided{{/unless}}';
      const result = engine.renderString(raw, {});

      expect(result.content).toBe('No name provided');
    });

    it('removes {{#unless}} block when variable is present', () => {
      const raw = '{{#unless name}}No name{{/unless}}';
      const result = engine.renderString(raw, { name: 'World' });

      expect(result.content).toBe('');
    });

    it('handles {{#each}} loops with comma-separated values', () => {
      const raw = 'Items:{{#each items}}\n- {{item}}{{/each}}';
      const result = engine.renderString(raw, { items: 'apple,banana,cherry' });

      expect(result.content).toContain('- apple');
      expect(result.content).toContain('- banana');
      expect(result.content).toContain('- cherry');
    });

    it('removes {{#each}} block when variable is missing', () => {
      const raw = 'Items:{{#each items}}\n- {{item}}{{/each}}';
      const result = engine.renderString(raw, {});

      expect(result.content).toBe('Items:');
    });
  });

  describe('extractVariables', () => {
    it('extracts simple variables', () => {
      const vars = engine.extractVariables('Hello {{name}}, welcome to {{project}}.');
      expect(vars).toContain('name');
      expect(vars).toContain('project');
    });

    it('extracts variables from conditionals', () => {
      const vars = engine.extractVariables('{{#if active}}yes{{/if}} {{#unless done}}no{{/unless}}');
      expect(vars).toContain('active');
      expect(vars).toContain('done');
    });

    it('extracts variables from loops', () => {
      const vars = engine.extractVariables('{{#each items}}{{item}}{{/each}}');
      expect(vars).toContain('items');
      expect(vars).not.toContain('item'); // item is a control var
    });

    it('handles whitespace in delimiters', () => {
      const vars = engine.extractVariables('{{ name }} and {{  project  }}');
      expect(vars).toContain('name');
      expect(vars).toContain('project');
    });
  });

  describe('preview', () => {
    it('returns raw content for existing template', () => {
      engine.loadBuiltIns();
      const preview = engine.preview('task');
      expect(preview).toContain('{{title}}');
      expect(preview).toContain('{{goal}}');
    });

    it('returns undefined for missing template', () => {
      expect(engine.preview('nope')).toBeUndefined();
    });
  });
});
