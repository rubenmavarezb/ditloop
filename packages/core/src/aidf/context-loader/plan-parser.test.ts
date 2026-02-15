import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { PlanParser } from './plan-parser.js';

describe('PlanParser', () => {
  let tempDir: string;
  let parser: PlanParser;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-pp-'));
    mkdirSync(join(tempDir, 'plans'));
    parser = new PlanParser();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const plansDir = () => join(tempDir, 'plans');

  it('parses a plan with title, overview, and steps', () => {
    writeFileSync(join(plansDir(), 'PLAN-phase1.md'), `# PLAN: Phase 1 — Foundation

## Overview

Set up the core infrastructure for the project.

## Tasks

### Step 1: Config (001)

\`001-config.md\` — Define configuration schema and loader

### Step 2: Events (002)

\`002-events.md\` — Implement typed event bus

## Dependencies

- Node.js 20+
`);

    const plans = parser.parseAll(plansDir());

    expect(plans).toHaveLength(1);
    expect(plans[0].id).toBe('PLAN-phase1');
    expect(plans[0].title).toBe('Phase 1 — Foundation');
    expect(plans[0].overview).toContain('core infrastructure');
    expect(plans[0].steps).toHaveLength(2);
    expect(plans[0].steps[0].title).toBe('Config (001)');
    expect(plans[0].steps[1].title).toBe('Events (002)');
  });

  it('extracts task refs from step content', () => {
    writeFileSync(join(plansDir(), 'PLAN-refs.md'), `# PLAN: Ref Test

## Overview

Testing task references.

## Tasks

### Step 1: Setup (001)

\`001-setup.md\` — Initial project setup

\`002-config.md\` — Configuration schema

### Step 2: Build (003)

\`003-build.md\` — Build system
`);

    const plan = parser.parseFile(join(plansDir(), 'PLAN-refs.md'));

    expect(plan.steps[0].taskRefs).toHaveLength(2);
    expect(plan.steps[0].taskRefs[0].taskId).toBe('001');
    expect(plan.steps[0].taskRefs[0].description).toBe('Initial project setup');
    expect(plan.steps[0].taskRefs[1].taskId).toBe('002');
    expect(plan.steps[1].taskRefs).toHaveLength(1);
    expect(plan.steps[1].taskRefs[0].taskId).toBe('003');
  });

  it('uses frontmatter title when present', () => {
    writeFileSync(join(plansDir(), 'PLAN-custom.md'), `---
title: Custom Plan Title
---

# PLAN: Ignored Title

## Overview

This title should come from frontmatter.
`);

    const plan = parser.parseFile(join(plansDir(), 'PLAN-custom.md'));

    expect(plan.title).toBe('Custom Plan Title');
    expect(plan.frontmatter.title).toBe('Custom Plan Title');
  });

  it('returns empty steps when no "### Step N:" headings found', () => {
    writeFileSync(join(plansDir(), 'PLAN-simple.md'), `# PLAN: Simple Plan

## Overview

A plan with no steps section.

## Notes

Just some notes here.
`);

    const plan = parser.parseFile(join(plansDir(), 'PLAN-simple.md'));

    expect(plan.steps).toEqual([]);
    expect(plan.overview).toContain('no steps section');
  });

  it('returns empty overview when section missing', () => {
    writeFileSync(join(plansDir(), 'PLAN-no-overview.md'), `# PLAN: No Overview

## Tasks

### Step 1: Only Step (001)

\`001-task.md\` — The only task
`);

    const plan = parser.parseFile(join(plansDir(), 'PLAN-no-overview.md'));

    expect(plan.overview).toBe('');
    expect(plan.steps).toHaveLength(1);
  });

  it('ignores non-.md files', () => {
    writeFileSync(join(plansDir(), 'PLAN-valid.md'), '# PLAN: Valid\n\n## Overview\n\nA valid plan.');
    writeFileSync(join(plansDir(), 'notes.txt'), 'some notes');
    writeFileSync(join(plansDir(), 'data.json'), '{}');

    const plans = parser.parseAll(plansDir());

    expect(plans).toHaveLength(1);
    expect(plans[0].id).toBe('PLAN-valid');
  });
});
