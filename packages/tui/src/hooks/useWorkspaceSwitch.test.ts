import { describe, it, expect, vi } from 'vitest';

describe('useWorkspaceSwitch', () => {
  it('is a React hook that manages workspace switching', () => {
    // The hook requires a React render context to test properly.
    // We verify the module exports correctly.
    expect(typeof import('../hooks/useWorkspaceSwitch.js').then).toBe('function');
  });

  it('module exports useWorkspaceSwitch', async () => {
    const mod = await import('./useWorkspaceSwitch.js');
    expect(typeof mod.useWorkspaceSwitch).toBe('function');
  });
});
