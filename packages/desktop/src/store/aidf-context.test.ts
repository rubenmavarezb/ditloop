import { describe, it, expect, beforeEach } from 'vitest';
import { useAidfContextStore } from './aidf-context.js';

describe('AidfContextStore', () => {
  beforeEach(() => {
    useAidfContextStore.setState({ contexts: {} });
  });

  it('sets files for a workspace', () => {
    const store = useAidfContextStore.getState();
    store.setFiles('ws1', [
      { path: '.ai/roles/dev.md', name: 'dev.md', type: 'role', enabled: true },
      { path: '.ai/tasks/001.md', name: '001.md', type: 'task', enabled: true },
    ]);

    const ctx = useAidfContextStore.getState().contexts['ws1'];
    expect(ctx.files).toHaveLength(2);
    expect(ctx.files[0].type).toBe('role');
  });

  it('toggles a file enabled state', () => {
    const store = useAidfContextStore.getState();
    store.setFiles('ws1', [
      { path: '.ai/roles/dev.md', name: 'dev.md', type: 'role', enabled: true },
    ]);
    store.toggleFile('ws1', '.ai/roles/dev.md');

    const ctx = useAidfContextStore.getState().contexts['ws1'];
    expect(ctx.files[0].enabled).toBe(false);
  });

  it('adds and removes additional files', () => {
    const store = useAidfContextStore.getState();
    store.setFiles('ws1', []);
    store.addFile('ws1', 'src/main.ts');
    store.addFile('ws1', 'README.md');

    let ctx = useAidfContextStore.getState().contexts['ws1'];
    expect(ctx.additionalFiles).toHaveLength(2);

    store.removeFile('ws1', 'src/main.ts');
    ctx = useAidfContextStore.getState().contexts['ws1'];
    expect(ctx.additionalFiles).toHaveLength(1);
    expect(ctx.additionalFiles[0]).toBe('README.md');
  });

  it('does not duplicate additional files', () => {
    const store = useAidfContextStore.getState();
    store.setFiles('ws1', []);
    store.addFile('ws1', 'src/main.ts');
    store.addFile('ws1', 'src/main.ts');

    const ctx = useAidfContextStore.getState().contexts['ws1'];
    expect(ctx.additionalFiles).toHaveLength(1);
  });

  it('generates a context summary', () => {
    const store = useAidfContextStore.getState();
    store.setFiles('ws1', [
      { path: 'a', name: 'a', type: 'role', enabled: true },
      { path: 'b', name: 'b', type: 'task', enabled: false },
    ]);
    store.addFile('ws1', 'extra.ts');
    store.setActiveRole('ws1', 'dev');

    const summary = useAidfContextStore.getState().getContextSummary('ws1');
    expect(summary).toContain('2 files');
    expect(summary).toContain('1 role');
  });

  it('returns "No context" for unknown workspace', () => {
    const summary = useAidfContextStore.getState().getContextSummary('unknown');
    expect(summary).toBe('No context');
  });
});
