import { describe, it, expect, beforeEach } from 'vitest';
import { useCommandsStore } from './commands.js';

describe('useCommandsStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useCommandsStore.setState({ recentIds: [] });
  });

  it('starts with empty recent IDs', () => {
    expect(useCommandsStore.getState().recentIds).toEqual([]);
  });

  it('adds a recent command ID', () => {
    useCommandsStore.getState().addRecent('nav:home');
    expect(useCommandsStore.getState().recentIds).toEqual(['nav:home']);
  });

  it('moves duplicate to front', () => {
    const { addRecent } = useCommandsStore.getState();
    addRecent('a');
    addRecent('b');
    addRecent('a');
    expect(useCommandsStore.getState().recentIds).toEqual(['a', 'b']);
  });

  it('limits to 10 entries', () => {
    const { addRecent } = useCommandsStore.getState();
    for (let i = 0; i < 15; i++) {
      addRecent(`cmd-${i}`);
    }
    expect(useCommandsStore.getState().recentIds).toHaveLength(10);
    // Most recent should be first
    expect(useCommandsStore.getState().recentIds[0]).toBe('cmd-14');
  });
});
