import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store.js';

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useAppStore.setState({
      workspaces: [],
      activeWorkspaceIndex: null,
      currentProfile: null,
      currentView: 'home',
      initialized: false,
      sidebarVisible: true,
    });
  });

  it('starts with default state', () => {
    const state = useAppStore.getState();
    expect(state.workspaces).toEqual([]);
    expect(state.currentView).toBe('home');
    expect(state.initialized).toBe(false);
    expect(state.sidebarVisible).toBe(true);
  });

  it('initializes with workspaces', () => {
    const workspaces = [
      { name: 'Test', type: 'single' as const, projectCount: 0, status: 'idle' as const },
    ];
    useAppStore.getState().init(workspaces, 'personal');

    const state = useAppStore.getState();
    expect(state.workspaces).toHaveLength(1);
    expect(state.currentProfile).toBe('personal');
    expect(state.initialized).toBe(true);
  });

  it('activates a workspace', () => {
    const workspaces = [
      { name: 'A', type: 'single' as const, projectCount: 0, status: 'idle' as const },
      { name: 'B', type: 'single' as const, projectCount: 0, status: 'idle' as const },
    ];
    useAppStore.getState().init(workspaces);
    useAppStore.getState().activateWorkspace(1);

    const state = useAppStore.getState();
    expect(state.activeWorkspaceIndex).toBe(1);
    expect(state.currentView).toBe('workspace-detail');
  });

  it('navigates to a view', () => {
    useAppStore.getState().navigate('task-detail');
    expect(useAppStore.getState().currentView).toBe('task-detail');
  });

  it('toggles sidebar', () => {
    expect(useAppStore.getState().sidebarVisible).toBe(true);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarVisible).toBe(false);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarVisible).toBe(true);
  });

  it('sets profile', () => {
    useAppStore.getState().setProfile('pivotree');
    expect(useAppStore.getState().currentProfile).toBe('pivotree');
  });
});
