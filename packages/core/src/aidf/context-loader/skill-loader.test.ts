import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { SkillLoader } from './skill-loader.js';

describe('SkillLoader', () => {
  let tempDir: string;
  let loader: SkillLoader;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-sl-'));
    mkdirSync(join(tempDir, 'skills'));
    loader = new SkillLoader();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const skillsDir = () => join(tempDir, 'skills');

  it('loads a skill from <name>/SKILL.md structure', () => {
    mkdirSync(join(skillsDir(), 'code-review'));
    writeFileSync(
      join(skillsDir(), 'code-review', 'SKILL.md'),
      '# Code Review\n\nReview pull requests for quality and correctness.',
    );

    const skill = loader.loadFile(join(skillsDir(), 'code-review', 'SKILL.md'), 'code-review');

    expect(skill.id).toBe('code-review');
    expect(skill.name).toBe('Code Review');
    expect(skill.description).toContain('Review pull requests');
    expect(skill.filePath).toBe(join(skillsDir(), 'code-review', 'SKILL.md'));
  });

  it('loads skill name from first heading', () => {
    mkdirSync(join(skillsDir(), 'testing'));
    writeFileSync(join(skillsDir(), 'testing', 'SKILL.md'), '# Unit Testing\n\nWrite and run unit tests.');

    const skills = loader.loadAll(skillsDir());

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('Unit Testing');
  });

  it('loads skill name from frontmatter', () => {
    mkdirSync(join(skillsDir(), 'deploy'));
    writeFileSync(join(skillsDir(), 'deploy', 'SKILL.md'), `---
name: Deployment Automation
---

# Deploy

Automates deployment pipelines.
`);

    const skills = loader.loadAll(skillsDir());

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('Deployment Automation');
    expect(skills[0].id).toBe('deploy');
  });

  it('loadAll ignores directories without SKILL.md', () => {
    mkdirSync(join(skillsDir(), 'valid'));
    writeFileSync(join(skillsDir(), 'valid', 'SKILL.md'), '# Valid Skill');

    mkdirSync(join(skillsDir(), 'incomplete'));
    writeFileSync(join(skillsDir(), 'incomplete', 'README.md'), '# Not a skill');

    mkdirSync(join(skillsDir(), 'empty'));

    const skills = loader.loadAll(skillsDir());

    expect(skills).toHaveLength(1);
    expect(skills[0].id).toBe('valid');
  });

  it('loadAll ignores non-directory entries', () => {
    mkdirSync(join(skillsDir(), 'real-skill'));
    writeFileSync(join(skillsDir(), 'real-skill', 'SKILL.md'), '# Real Skill');

    writeFileSync(join(skillsDir(), 'stray-file.md'), '# Not a skill directory');

    const skills = loader.loadAll(skillsDir());

    expect(skills).toHaveLength(1);
    expect(skills[0].id).toBe('real-skill');
  });
});
