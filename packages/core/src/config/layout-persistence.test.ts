import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LayoutPersistence } from './layout-persistence.js';
import type { PersistedLayoutConfig } from './layout-persistence.js';

const validConfig: PersistedLayoutConfig = {
  rows: [
    {
      heightPercent: 40,
      columns: [
        { panelId: 'git-status', widthPercent: 40 },
        { panelId: 'commits', widthPercent: 60 },
      ],
    },
    {
      heightPercent: 50,
      columns: [
        { panelId: 'tasks', widthPercent: 40 },
        { panelId: 'preview', widthPercent: 60, rowSpan: 2 },
      ],
    },
  ],
  bottomBar: { panelId: 'command-log', heightPercent: 10 },
};

describe('LayoutPersistence', () => {
  let tmpDir: string;
  let persistence: LayoutPersistence;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'ditloop-layout-'));
    persistence = new LayoutPersistence(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('saves and loads a valid layout', async () => {
    await persistence.save(validConfig);
    const loaded = await persistence.load();
    expect(loaded).toEqual(validConfig);
  });

  it('returns undefined when no file exists', async () => {
    const loaded = await persistence.load();
    expect(loaded).toBeUndefined();
  });

  it('returns undefined for corrupted JSON', async () => {
    const filePath = join(tmpDir, 'layout.json');
    const { writeFile: wf } = await import('node:fs/promises');
    await wf(filePath, '{ invalid json }}}', 'utf-8');
    const loaded = await persistence.load();
    expect(loaded).toBeUndefined();
  });

  it('returns undefined for invalid schema', async () => {
    const filePath = join(tmpDir, 'layout.json');
    const { writeFile: wf } = await import('node:fs/promises');
    await wf(filePath, JSON.stringify({ rows: [] }), 'utf-8');
    const loaded = await persistence.load();
    expect(loaded).toBeUndefined();
  });

  it('writes pretty-printed JSON', async () => {
    await persistence.save(validConfig);
    const raw = await readFile(join(tmpDir, 'layout.json'), 'utf-8');
    expect(raw).toContain('\n');
    expect(raw).toContain('  ');
  });
});
