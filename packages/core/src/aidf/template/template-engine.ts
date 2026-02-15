import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

/** A loaded template with metadata. */
export interface Template {
  /** Template ID (filename without extension). */
  id: string;
  /** Template display name. */
  name: string;
  /** Template description (first line after heading). */
  description: string;
  /** Variable names found in the template. */
  variables: string[];
  /** Raw template content. */
  raw: string;
}

/** Variables map for interpolation. */
export type TemplateVariables = Record<string, string>;

/** Result of rendering a template. */
export interface RenderResult {
  /** Rendered content. */
  content: string;
  /** Variables that were used. */
  usedVariables: string[];
  /** Variables that were not provided. */
  missingVariables: string[];
}

/** Variable pattern: {{varName}} with optional whitespace. */
const VAR_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

/** Conditional block: {{#if varName}}...{{/if}} */
const IF_PATTERN = /\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g;

/** Negated conditional: {{#unless varName}}...{{/unless}} */
const UNLESS_PATTERN = /\{\{#unless\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/unless\}\}/g;

/** Loop block: {{#each varName}}...{{/each}} where varName is comma-separated */
const EACH_PATTERN = /\{\{#each\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;

/**
 * Load AIDF templates, perform {{variable}} interpolation,
 * and provide built-in templates for common AIDF types.
 */
export class TemplateEngine {
  private templates: Map<string, Template> = new Map();
  private builtInLoaded = false;

  /**
   * Load templates from a directory. Files must be `.md` files.
   *
   * @param templatesDir - Absolute path to the templates directory
   * @returns Number of templates loaded
   */
  loadFromDirectory(templatesDir: string): number {
    if (!existsSync(templatesDir)) return 0;

    const files = readdirSync(templatesDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = join(templatesDir, file);
      const raw = readFileSync(filePath, 'utf-8');
      const template = this.parseTemplate(basename(file, '.md'), raw);
      this.templates.set(template.id, template);
    }

    return files.length;
  }

  /**
   * Load built-in templates for common AIDF types.
   */
  loadBuiltIns(): void {
    if (this.builtInLoaded) return;
    this.builtInLoaded = true;

    for (const [id, raw] of Object.entries(BUILT_IN_TEMPLATES)) {
      const template = this.parseTemplate(id, raw);
      // Only set if not already loaded from filesystem (user overrides)
      if (!this.templates.has(id)) {
        this.templates.set(id, template);
      }
    }
  }

  /**
   * List all available templates.
   *
   * @returns Array of templates
   */
  list(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get a template by ID.
   *
   * @param id - Template ID
   * @returns Template or undefined
   */
  get(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /**
   * Render a template with variable interpolation.
   *
   * @param templateId - Template ID to render
   * @param variables - Variables for interpolation
   * @returns Render result with content and variable info
   * @throws Error if template not found
   */
  render(templateId: string, variables: TemplateVariables = {}): RenderResult {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.renderString(template.raw, variables);
  }

  /**
   * Render a raw template string with variable interpolation.
   *
   * @param raw - Raw template string
   * @param variables - Variables for interpolation
   * @returns Render result
   */
  renderString(raw: string, variables: TemplateVariables = {}): RenderResult {
    const usedVariables = new Set<string>();
    const allVariables = this.extractVariables(raw);

    let content = raw;

    // Process conditionals first
    content = content.replace(IF_PATTERN, (_match, varName: string, body: string) => {
      if (variables[varName]) {
        usedVariables.add(varName);
        return body;
      }
      return '';
    });

    content = content.replace(UNLESS_PATTERN, (_match, varName: string, body: string) => {
      if (!variables[varName]) {
        return body;
      }
      usedVariables.add(varName);
      return '';
    });

    // Process loops
    content = content.replace(EACH_PATTERN, (_match, varName: string, body: string) => {
      const value = variables[varName];
      if (!value) return '';
      usedVariables.add(varName);

      const items = value.split(',').map(s => s.trim()).filter(Boolean);
      return items.map(item => body.replace(/\{\{\s*item\s*\}\}/g, item)).join('');
    });

    // Process variable substitution
    content = content.replace(VAR_PATTERN, (_match, varName: string) => {
      if (varName in variables) {
        usedVariables.add(varName);
        return variables[varName];
      }
      return `{{${varName}}}`;
    });

    const missingVariables = allVariables.filter(v => !usedVariables.has(v));

    return { content, usedVariables: Array.from(usedVariables), missingVariables };
  }

  /**
   * Preview a template by showing its raw content with variable placeholders highlighted.
   *
   * @param templateId - Template ID to preview
   * @returns Template raw content or undefined
   */
  preview(templateId: string): string | undefined {
    return this.templates.get(templateId)?.raw;
  }

  /**
   * Extract all variable names from a template string.
   *
   * @param raw - Raw template string
   * @returns Unique variable names
   */
  extractVariables(raw: string): string[] {
    const vars = new Set<string>();
    let match: RegExpExecArray | null;

    const patterns = [VAR_PATTERN, IF_PATTERN, UNLESS_PATTERN, EACH_PATTERN];
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      while ((match = pattern.exec(raw)) !== null) {
        vars.add(match[1]);
      }
    }

    // Remove control variable "item" (used inside {{#each}})
    vars.delete('item');

    return Array.from(vars);
  }

  private parseTemplate(id: string, raw: string): Template {
    // Extract name from first heading
    const nameMatch = raw.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1].trim() : id;

    // Extract description (first non-empty, non-heading line)
    const lines = raw.split('\n');
    let description = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        description = trimmed;
        break;
      }
    }

    const variables = this.extractVariables(raw);

    return { id, name, description, variables, raw };
  }
}

/** Built-in templates for common AIDF types. */
const BUILT_IN_TEMPLATES: Record<string, string> = {
  task: `# TASK: {{title}}

## Goal
{{goal}}

## Scope

### Allowed
{{#if scope}}
{{scope}}
{{/if}}
{{#unless scope}}
- TBD
{{/unless}}

### Forbidden
- TBD

## Requirements
{{#if requirements}}
{{requirements}}
{{/if}}
{{#unless requirements}}
1. TBD
{{/unless}}

## Definition of Done
{{#if dod}}
{{dod}}
{{/if}}
{{#unless dod}}
- [ ] TBD
{{/unless}}

## Status: 📋 Planned
`,

  role: `# {{name}}

{{description}}

## Responsibilities
{{#if responsibilities}}
{{responsibilities}}
{{/if}}
{{#unless responsibilities}}
- TBD
{{/unless}}

## Guidelines
{{#if guidelines}}
{{guidelines}}
{{/if}}
{{#unless guidelines}}
- Follow project conventions
- Write clean, tested code
{{/unless}}
`,

  skill: `# {{name}}

{{description}}

## When to Use
{{#if when}}
{{when}}
{{/if}}
{{#unless when}}
- TBD
{{/unless}}

## Steps
{{#if steps}}
{{steps}}
{{/if}}
{{#unless steps}}
1. TBD
{{/unless}}
`,

  plan: `# PLAN: {{title}}

## Overview
{{overview}}

## Goals
{{#if goals}}
{{goals}}
{{/if}}
{{#unless goals}}
- TBD
{{/unless}}

## Tasks
{{#if tasks}}
{{tasks}}
{{/if}}
{{#unless tasks}}
- [ ] TBD
{{/unless}}

## Dependencies
{{#if dependencies}}
{{dependencies}}
{{/if}}
{{#unless dependencies}}
- None
{{/unless}}

## Success Criteria
{{#if criteria}}
{{criteria}}
{{/if}}
{{#unless criteria}}
- [ ] TBD
{{/unless}}
`,

  'bug-fix': `# TASK: Fix — {{title}}

## Bug Description
{{description}}

## Steps to Reproduce
{{#if steps}}
{{steps}}
{{/if}}
{{#unless steps}}
1. TBD
{{/unless}}

## Expected Behavior
{{expected}}

## Actual Behavior
{{actual}}

## Root Cause
TBD

## Fix
TBD

## Definition of Done
- [ ] Bug no longer reproduces
- [ ] Unit test added for regression
- [ ] No side effects

## Status: 📋 Planned
`,

  feature: `# TASK: {{title}}

## Goal
{{goal}}

## User Story
As a {{user}}, I want to {{action}} so that {{benefit}}.

## Scope

### Allowed
{{#if scope}}
{{scope}}
{{/if}}
{{#unless scope}}
- TBD
{{/unless}}

## Requirements
{{#if requirements}}
{{requirements}}
{{/if}}
{{#unless requirements}}
1. TBD
{{/unless}}

## Design
TBD

## Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated

## Status: 📋 Planned
`,
};
