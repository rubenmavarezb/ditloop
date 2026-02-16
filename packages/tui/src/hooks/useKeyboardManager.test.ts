import { describe, it, expect, beforeEach } from 'vitest';
import { useKeyboardStore } from '../state/keyboard-store.js';

// We test the keyboard manager logic through the store,
// since useInput is an Ink hook that requires a render context.

describe('useKeyboardManager (store-level integration)', () => {
  beforeEach(() => {
    useKeyboardStore.setState({
      mode: 'normal',
      focusedPanelId: '',
      panelOrder: [],
      bindings: [],
      helpVisible: false,
    });
    // Use the action so focusedPanelId gets set to first panel
    useKeyboardStore.getState().setPanelOrder([
      'git-status', 'tasks', 'branches', 'commits', 'preview', 'command-log',
    ]);
  });

  it('Tab cycling uses focusNext', () => {
    const state = useKeyboardStore.getState();
    expect(state.focusedPanelId).toBe('git-status');
    state.focusNext();
    expect(useKeyboardStore.getState().focusedPanelId).toBe('tasks');
  });

  it('Shift+Tab uses focusPrev', () => {
    const state = useKeyboardStore.getState();
    state.focusPrev();
    expect(useKeyboardStore.getState().focusedPanelId).toBe('command-log');
  });

  it('/ enters search mode', () => {
    useKeyboardStore.getState().setMode('search');
    expect(useKeyboardStore.getState().mode).toBe('search');
  });

  it('Escape in search mode returns to normal', () => {
    useKeyboardStore.getState().setMode('search');
    useKeyboardStore.getState().setMode('normal');
    expect(useKeyboardStore.getState().mode).toBe('normal');
  });

  it('? toggles help', () => {
    useKeyboardStore.getState().toggleHelp();
    expect(useKeyboardStore.getState().helpVisible).toBe(true);
    useKeyboardStore.getState().toggleHelp();
    expect(useKeyboardStore.getState().helpVisible).toBe(false);
  });

  it('number keys focus panels', () => {
    useKeyboardStore.getState().focusByNumber(3);
    expect(useKeyboardStore.getState().focusedPanelId).toBe('branches');
    useKeyboardStore.getState().focusByNumber(1);
    expect(useKeyboardStore.getState().focusedPanelId).toBe('git-status');
  });

  it('getActiveBindings returns correct bindings for focused panel', () => {
    useKeyboardStore.getState().registerBindings([
      { key: 'j', mode: 'normal', panelId: 'git-status', action: 'scroll-down', description: 'Down' },
      { key: 'k', mode: 'normal', panelId: 'tasks', action: 'scroll-up', description: 'Up' },
      { key: 'enter', mode: 'normal', action: 'select', description: 'Select' },
    ]);

    // Focus is on git-status
    const active = useKeyboardStore.getState().getActiveBindings();
    const actions = active.map((b) => b.action);
    expect(actions).toContain('scroll-down');
    expect(actions).toContain('select');
    expect(actions).not.toContain('scroll-up'); // belongs to tasks panel
  });
});
