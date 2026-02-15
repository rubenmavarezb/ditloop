import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { RoleLoader } from './role-loader.js';

describe('RoleLoader', () => {
  let tempDir: string;
  let loader: RoleLoader;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-rl-'));
    mkdirSync(join(tempDir, 'roles'));
    loader = new RoleLoader();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const rolesDir = () => join(tempDir, 'roles');

  it('loads a role with name from first heading', () => {
    writeFileSync(join(rolesDir(), 'architect.md'), '# System Architect\n\nDesigns high-level systems.');

    const role = loader.loadFile(join(rolesDir(), 'architect.md'));

    expect(role.id).toBe('architect');
    expect(role.name).toBe('System Architect');
    expect(role.description).toContain('Designs high-level systems');
    expect(role.filePath).toBe(join(rolesDir(), 'architect.md'));
  });

  it('loads a role with name from frontmatter overriding heading', () => {
    writeFileSync(join(rolesDir(), 'dev.md'), `---
name: Senior Developer
---

# Developer

Writes production code.
`);

    const role = loader.loadFile(join(rolesDir(), 'dev.md'));

    expect(role.id).toBe('dev');
    expect(role.name).toBe('Senior Developer');
    expect(role.frontmatter.name).toBe('Senior Developer');
  });

  it('falls back to file id when no name found', () => {
    writeFileSync(join(rolesDir(), 'reviewer.md'), 'Reviews pull requests and provides feedback.');

    const role = loader.loadFile(join(rolesDir(), 'reviewer.md'));

    expect(role.id).toBe('reviewer');
    expect(role.name).toBe('reviewer');
  });

  it('loadAll returns multiple roles', () => {
    writeFileSync(join(rolesDir(), 'architect.md'), '# Architect\n\nDesigns systems.');
    writeFileSync(join(rolesDir(), 'developer.md'), '# Developer\n\nWrites code.');
    writeFileSync(join(rolesDir(), 'tester.md'), '# Tester\n\nTests code.');

    const roles = loader.loadAll(rolesDir());

    expect(roles).toHaveLength(3);
    const names = roles.map(r => r.name).sort();
    expect(names).toEqual(['Architect', 'Developer', 'Tester']);
  });

  it('ignores non-.md files', () => {
    writeFileSync(join(rolesDir(), 'architect.md'), '# Architect\n\nDesigns systems.');
    writeFileSync(join(rolesDir(), 'notes.txt'), 'some notes');
    writeFileSync(join(rolesDir(), 'config.yml'), 'version: 1');

    const roles = loader.loadAll(rolesDir());

    expect(roles).toHaveLength(1);
    expect(roles[0].id).toBe('architect');
  });
});
