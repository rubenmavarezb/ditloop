import { describe, it, expect, beforeEach } from 'vitest';
import { useKeyboardStore } from './keyboard-store.js';
import type { KeyBinding } from './keyboard-store.js';

describe('useKeyboardStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useKeyboardStore.setState({
      mode: 'normal',
      focusedPanelId: '',
      panelOrder: [],
      bindings: [],
      helpVisible: false,
    });
  });

  it('has correct default state', () => {
    const state = useKeyboardStore.getState();
    expect(state.mode).toBe('normal');
    expect(state.focusedPanelId).toBe('');
    expect(state.panelOrder).toEqual([]);
    expect(state.bindings).toEqual([]);
    expect(state.helpVisible).toBe(false);
  });

  describe('mode transitions', () => {
    it('switches to search mode', () => {
      useKeyboardStore.getState().setMode('search');
      expect(useKeyboardStore.getState().mode).toBe('search');
    });

    it('switches to command mode', () => {
      useKeyboardStore.getState().setMode('command');
      expect(useKeyboardStore.getState().mode).toBe('command');
    });

    it('returns to normal mode', () => {
      useKeyboardStore.getState().setMode('search');
      useKeyboardStore.getState().setMode('normal');
      expect(useKeyboardStore.getState().mode).toBe('normal');
    });
  });

  describe('panel focus', () => {
    beforeEach(() => {
      useKeyboardStore.getState().setPanelOrder(['a', 'b', 'c', 'd']);
    });

    it('sets initial focus to first panel', () => {
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('preserves focus if panel still in order', () => {
      useKeyboardStore.getState().setFocus('c');
      useKeyboardStore.getState().setPanelOrder(['a', 'b', 'c', 'd']);
      expect(useKeyboardStore.getState().focusedPanelId).toBe('c');
    });

    it('resets focus to first if removed from order', () => {
      useKeyboardStore.getState().setFocus('c');
      useKeyboardStore.getState().setPanelOrder(['a', 'b', 'd']);
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('focusNext cycles forward', () => {
      useKeyboardStore.getState().focusNext();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('b');
      useKeyboardStore.getState().focusNext();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('c');
    });

    it('focusNext wraps around', () => {
      useKeyboardStore.getState().setFocus('d');
      useKeyboardStore.getState().focusNext();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('focusPrev cycles backward', () => {
      useKeyboardStore.getState().setFocus('c');
      useKeyboardStore.getState().focusPrev();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('b');
    });

    it('focusPrev wraps around', () => {
      useKeyboardStore.getState().focusPrev();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('d');
    });

    it('focusByNumber focuses correct panel (1-indexed)', () => {
      useKeyboardStore.getState().focusByNumber(3);
      expect(useKeyboardStore.getState().focusedPanelId).toBe('c');
    });

    it('focusByNumber ignores out of range', () => {
      useKeyboardStore.getState().focusByNumber(10);
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('focusByNumber ignores zero', () => {
      useKeyboardStore.getState().focusByNumber(0);
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('focusLeft and focusRight alias prev/next', () => {
      useKeyboardStore.getState().focusRight();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('b');
      useKeyboardStore.getState().focusLeft();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('a');
    });

    it('does nothing with empty panelOrder', () => {
      useKeyboardStore.setState({ panelOrder: [], focusedPanelId: '' });
      useKeyboardStore.getState().focusNext();
      expect(useKeyboardStore.getState().focusedPanelId).toBe('');
    });
  });

  describe('bindings', () => {
    const panelBindings: KeyBinding[] = [
      { key: 'j', mode: 'normal', panelId: 'status', action: 'scroll-down', description: 'Scroll down' },
      { key: 'k', mode: 'normal', panelId: 'status', action: 'scroll-up', description: 'Scroll up' },
    ];

    const globalBindings: KeyBinding[] = [
      { key: 'q', mode: 'normal', action: 'quit', description: 'Quit' },
    ];

    it('registers bindings', () => {
      useKeyboardStore.getState().registerBindings(panelBindings);
      expect(useKeyboardStore.getState().bindings).toHaveLength(2);
    });

    it('appends bindings on multiple register calls', () => {
      useKeyboardStore.getState().registerBindings(panelBindings);
      useKeyboardStore.getState().registerBindings(globalBindings);
      expect(useKeyboardStore.getState().bindings).toHaveLength(3);
    });

    it('unregisters bindings by panelId', () => {
      useKeyboardStore.getState().registerBindings(panelBindings);
      useKeyboardStore.getState().registerBindings(globalBindings);
      useKeyboardStore.getState().unregisterBindings('status');
      expect(useKeyboardStore.getState().bindings).toHaveLength(1);
      expect(useKeyboardStore.getState().bindings[0].action).toBe('quit');
    });

    it('getActiveBindings filters by mode and panel', () => {
      useKeyboardStore.getState().registerBindings([
        ...panelBindings,
        ...globalBindings,
        { key: 'x', mode: 'search', action: 'search-action', description: 'Search' },
        { key: 'z', mode: 'normal', panelId: 'other', action: 'other-action', description: 'Other' },
      ]);

      useKeyboardStore.getState().setPanelOrder(['status', 'other']);
      // focusedPanelId is 'status'

      const active = useKeyboardStore.getState().getActiveBindings();
      // Should include: j, k (panelId=status), q (global), NOT x (search mode), NOT z (other panel)
      expect(active).toHaveLength(3);
      expect(active.map((b) => b.action)).toContain('scroll-down');
      expect(active.map((b) => b.action)).toContain('scroll-up');
      expect(active.map((b) => b.action)).toContain('quit');
    });
  });

  describe('help overlay', () => {
    it('toggles help visibility', () => {
      expect(useKeyboardStore.getState().helpVisible).toBe(false);
      useKeyboardStore.getState().toggleHelp();
      expect(useKeyboardStore.getState().helpVisible).toBe(true);
      useKeyboardStore.getState().toggleHelp();
      expect(useKeyboardStore.getState().helpVisible).toBe(false);
    });
  });
});
