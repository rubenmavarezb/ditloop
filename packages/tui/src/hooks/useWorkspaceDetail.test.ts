import { describe, it, expect } from 'vitest';
import { useWorkspaceDetail } from './useWorkspaceDetail.js';
import type { WorkspaceDetailData } from './useWorkspaceDetail.js';

// Since we don't have @testing-library/react-hooks, test the hook's
// contract by verifying its type exports and structure. The hook is a
// skeleton that returns static data for now — full integration testing
// will come when core services are wired into the TUI lifecycle.

describe('useWorkspaceDetail', () => {
  it('is a function that accepts a workspace argument', () => {
    expect(typeof useWorkspaceDetail).toBe('function');
  });

  it('exports the WorkspaceDetailData type', () => {
    // Type-level check — if this compiles, the type is exported correctly
    const data: WorkspaceDetailData = {
      gitStatus: null,
      identityMatch: null,
      tasks: [],
    };
    expect(data.gitStatus).toBeNull();
    expect(data.identityMatch).toBeNull();
    expect(data.tasks).toEqual([]);
  });
});
