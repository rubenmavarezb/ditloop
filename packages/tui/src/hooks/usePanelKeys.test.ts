import { describe, it, expect, beforeEach } from 'vitest';
import { useKeyboardStore } from '../state/keyboard-store.js';

// Testing the register/unregister lifecycle through the store directly,
// since usePanelKeys is a thin wrapper over store methods.

describe('usePanelKeys (store lifecycle)', () => {
  beforeEach(() => {
    useKeyboardStore.setState({
      mode: 'normal',
      focusedPanelId: '',
      panelOrder: [],
      bindings: [],
      helpVisible: false,
    });
  });

  it('registerBindings adds bindings to the store', () => {
    useKeyboardStore.getState().registerBindings([
      { key: 'j', mode: 'normal', panelId: 'panel-a', action: 'down', description: 'Down' },
      { key: 'k', mode: 'normal', panelId: 'panel-a', action: 'up', description: 'Up' },
    ]);

    expect(useKeyboardStore.getState().bindings).toHaveLength(2);
  });

  it('unregisterBindings removes only that panel', () => {
    useKeyboardStore.getState().registerBindings([
      { key: 'j', mode: 'normal', panelId: 'panel-a', action: 'down-a', description: 'Down A' },
      { key: 'j', mode: 'normal', panelId: 'panel-b', action: 'down-b', description: 'Down B' },
    ]);

    useKeyboardStore.getState().unregisterBindings('panel-a');

    const remaining = useKeyboardStore.getState().bindings;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].panelId).toBe('panel-b');
  });

  it('unregistering a non-existent panel does nothing', () => {
    useKeyboardStore.getState().registerBindings([
      { key: 'x', mode: 'normal', panelId: 'real', action: 'test', description: 'Test' },
    ]);

    useKeyboardStore.getState().unregisterBindings('fake');
    expect(useKeyboardStore.getState().bindings).toHaveLength(1);
  });
});
