import { useInput } from 'ink';
import { useKeyboardStore } from '../state/keyboard-store.js';

/** Options for the keyboard manager hook. */
export interface KeyboardManagerOptions {
  /** Called when a key binding action is dispatched. */
  onAction: (action: string, panelId: string) => void;
  /** Called when the user presses 'q' in normal mode. */
  onQuit: () => void;
}

/**
 * Root keyboard hook that centralizes all input handling.
 * Calls useInput once at the app root level and dispatches
 * to the keyboard store based on current mode and bindings.
 *
 * @param options - Action and quit handlers
 */
export function useKeyboardManager(options: KeyboardManagerOptions): void {
  const { onAction, onQuit } = options;

  useInput((input, key) => {
    const state = useKeyboardStore.getState();
    const { mode } = state;

    // Search mode: only Escape exits
    if (mode === 'search') {
      if (key.escape) {
        state.setMode('normal');
      }
      // All other keys passed through to the fuzzy finder
      return;
    }

    // Command mode: only Escape exits
    if (mode === 'command') {
      if (key.escape) {
        state.setMode('normal');
      }
      return;
    }

    // Normal mode handling

    // Quit
    if (input === 'q' && !key.ctrl && !key.meta) {
      onQuit();
      return;
    }

    // Escape: close help or signal back
    if (key.escape) {
      if (state.helpVisible) {
        state.toggleHelp();
      } else {
        onAction('navigate-home', state.focusedPanelId);
      }
      return;
    }

    // Tab / Shift+Tab: cycle focus
    if (key.tab) {
      if (key.shift) {
        state.focusPrev();
      } else {
        state.focusNext();
      }
      return;
    }

    // h/l: move focus left/right
    if (input === 'h' && !key.ctrl && !key.meta) {
      state.focusLeft();
      return;
    }
    if (input === 'l' && !key.ctrl && !key.meta) {
      state.focusRight();
      return;
    }

    // Number keys 1-6: jump to panel
    const num = parseInt(input, 10);
    if (num >= 1 && num <= 6 && !key.ctrl && !key.meta) {
      state.focusByNumber(num);
      return;
    }

    // /: open search mode
    if (input === '/') {
      state.setMode('search');
      return;
    }

    // Ctrl+f: open search mode
    if (input === 'f' && key.ctrl) {
      state.setMode('search');
      return;
    }

    // Ctrl+b: toggle sidebar
    if (input === 'b' && key.ctrl) {
      onAction('toggle-sidebar', state.focusedPanelId);
      return;
    }

    // ?: toggle help
    if (input === '?') {
      state.toggleHelp();
      return;
    }

    // Match against active bindings
    const activeBindings = state.getActiveBindings();
    const keyName = resolveKeyName(input, key);
    const binding = activeBindings.find((b) => b.key === keyName);
    if (binding) {
      onAction(binding.action, state.focusedPanelId);
    }
  });
}

/**
 * Resolve a key press into a canonical key name string.
 *
 * @param input - The input character
 * @param key - Ink key object
 * @returns Canonical key name
 */
function resolveKeyName(
  input: string,
  key: { return: boolean; upArrow: boolean; downArrow: boolean; leftArrow: boolean; rightArrow: boolean; escape: boolean; tab: boolean },
): string {
  if (key.return) return 'enter';
  if (key.upArrow) return 'up';
  if (key.downArrow) return 'down';
  if (key.leftArrow) return 'left';
  if (key.rightArrow) return 'right';
  if (key.escape) return 'escape';
  if (key.tab) return 'tab';
  return input;
}
