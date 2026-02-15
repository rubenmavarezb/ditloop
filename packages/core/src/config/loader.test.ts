import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadConfig } from './loader.js';

describe('loadConfig', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `ditloop-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns defaults when file does not exist', async () => {
    const config = await loadConfig({ path: join(tempDir, 'missing.yml') });
    expect(config.profiles).toEqual({});
    expect(config.workspaces).toEqual([]);
  });

  it('loads a valid YAML config', async () => {
    const configPath = join(tempDir, 'config.yml');
    await writeFile(configPath, `
profiles:
  personal:
    name: Ruben
    email: rubennmavarezb@gmail.com
    sshHost: github-personal

workspaces:
  - type: single
    name: DitLoop
    path: /Users/ruben/Documentos/hitloop
    profile: personal

defaults:
  profile: personal
`);

    const config = await loadConfig({ path: configPath });
    expect(config.profiles.personal.email).toBe('rubennmavarezb@gmail.com');
    expect(config.workspaces).toHaveLength(1);
    expect(config.workspaces[0].name).toBe('DitLoop');
  });

  it('throws on invalid config', async () => {
    const configPath = join(tempDir, 'config.yml');
    await writeFile(configPath, `
profiles:
  bad:
    name: ""
    email: not-an-email
`);

    await expect(loadConfig({ path: configPath })).rejects.toThrow();
  });
});
