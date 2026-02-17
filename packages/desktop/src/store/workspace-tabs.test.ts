import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceTabsStore, type WorkspaceTab } from './workspace-tabs.js';

const mockTab = (id: string, name?: string): WorkspaceTab => ({
  id,
  name: name ?? `workspace-${id}`,
  path: `/home/user/${id}`,
  profile: 'personal',
  branch: 'main',
  statusColor: 'var(--dl-color-success)',
});

describe('WorkspaceTabsStore', () => {
  beforeEach(() => {
    const { getState } = useWorkspaceTabsStore;
    // Reset store state
    useWorkspaceTabsStore.setState({ tabs: [], activeTabId: null });
  });

  it('opens a tab and makes it active', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1', 'DitLoop'));

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0].name).toBe('DitLoop');
    expect(state.activeTabId).toBe('ws1');
  });

  it('does not duplicate an already-open tab', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.openTab(mockTab('ws1')); // re-open

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe('ws1');
  });

  it('closes a tab and activates the adjacent one', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.openTab(mockTab('ws3'));
    store.setActiveTab('ws2');

    store.closeTab('ws2');

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe('ws3'); // activates next tab
  });

  it('activates previous tab when closing the last tab', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.setActiveTab('ws2');

    store.closeTab('ws2');

    const state = useWorkspaceTabsStore.getState();
    expect(state.activeTabId).toBe('ws1');
  });

  it('sets activeTabId to null when closing the only tab', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.closeTab('ws1');

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs).toHaveLength(0);
    expect(state.activeTabId).toBeNull();
  });

  it('cycles to next tab', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.openTab(mockTab('ws3'));
    store.setActiveTab('ws1');

    store.nextTab();
    expect(useWorkspaceTabsStore.getState().activeTabId).toBe('ws2');

    store.nextTab();
    expect(useWorkspaceTabsStore.getState().activeTabId).toBe('ws3');

    store.nextTab();
    expect(useWorkspaceTabsStore.getState().activeTabId).toBe('ws1'); // wraps
  });

  it('cycles to previous tab', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.openTab(mockTab('ws3'));
    store.setActiveTab('ws1');

    store.prevTab();
    expect(useWorkspaceTabsStore.getState().activeTabId).toBe('ws3'); // wraps
  });

  it('updates tab properties', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.updateTab('ws1', { branch: 'feat/new-feature' });

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs[0].branch).toBe('feat/new-feature');
  });

  it('reorders tabs', () => {
    const store = useWorkspaceTabsStore.getState();
    store.openTab(mockTab('ws1'));
    store.openTab(mockTab('ws2'));
    store.openTab(mockTab('ws3'));

    store.reorderTabs(0, 2); // move ws1 to end

    const state = useWorkspaceTabsStore.getState();
    expect(state.tabs.map((t) => t.id)).toEqual(['ws2', 'ws3', 'ws1']);
  });
});
