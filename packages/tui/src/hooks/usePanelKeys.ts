import { useEffect } from 'react';
import { useKeyboardStore } from '../state/keyboard-store.js';
import type { KeyBinding } from '../state/keyboard-store.js';

/**
 * Register key bindings for a panel on mount and unregister on unmount.
 * Bindings are only active when the specified panel is focused.
 *
 * @param panelId - The panel ID these bindings belong to
 * @param bindings - Array of key bindings to register
 */
export function usePanelKeys(panelId: string, bindings: KeyBinding[]): void {
  useEffect(() => {
    // Tag each binding with the panelId if not already set
    const tagged = bindings.map((b) => ({
      ...b,
      panelId: b.panelId ?? panelId,
    }));
    useKeyboardStore.getState().registerBindings(tagged);

    return () => {
      useKeyboardStore.getState().unregisterBindings(panelId);
    };
  }, [panelId]); // eslint-disable-line react-hooks/exhaustive-deps
}
