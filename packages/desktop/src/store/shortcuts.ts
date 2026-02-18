import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** A keyboard shortcut binding. */
export interface ShortcutBinding {
  id: string;
  keys: string;
  label: string;
  category: string;
  action: () => void;
  /** Whether this shortcut requires the mod key (Cmd/Ctrl). */
  mod?: boolean;
  /** Whether this shortcut requires the shift key. */
  shift?: boolean;
  /** The key to press (e.g., 'k', '1', 'Tab', 'Escape'). */
  key: string;
}

/** Shortcut store state. */
export interface ShortcutState {
  /** Custom key overrides (shortcut ID → key combo string). */
  overrides: Record<string, string>;
  /** Whether the shortcut reference sheet is open. */
  sheetOpen: boolean;
}

/** Shortcut store actions. */
export interface ShortcutActions {
  /** Set a custom key binding for a shortcut. */
  setOverride: (id: string, keys: string) => void;
  /** Remove a custom key binding. */
  removeOverride: (id: string) => void;
  /** Toggle the shortcut reference sheet. */
  toggleSheet: () => void;
  /** Close the shortcut reference sheet. */
  closeSheet: () => void;
}

/** Combined store type. */
export type ShortcutStore = ShortcutState & ShortcutActions;

/** Zustand store for keyboard shortcut customization. */
export const useShortcutStore = create<ShortcutStore>()(
  persist(
    (set) => ({
      overrides: {},
      sheetOpen: false,

      setOverride: (id, keys) => {
        set((state) => ({
          overrides: { ...state.overrides, [id]: keys },
        }));
      },

      removeOverride: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.overrides;
          return { overrides: rest };
        });
      },

      toggleSheet: () => set((state) => ({ sheetOpen: !state.sheetOpen })),
      closeSheet: () => set({ sheetOpen: false }),
    }),
    {
      name: 'ditloop-shortcuts',
      partialize: (state) => ({ overrides: state.overrides }),
    },
  ),
);

/** Default keyboard shortcuts. */
export const DEFAULT_SHORTCUTS: Omit<ShortcutBinding, 'action'>[] = [
  { id: 'palette', keys: '⌘K', label: 'Command Palette', category: 'General', mod: true, key: 'k' },
  { id: 'layout-1', keys: '⌘1', label: 'Default Layout', category: 'Layout', mod: true, key: '1' },
  { id: 'layout-2', keys: '⌘2', label: 'Code Focus', category: 'Layout', mod: true, key: '2' },
  { id: 'layout-3', keys: '⌘3', label: 'AI Focus', category: 'Layout', mod: true, key: '3' },
  { id: 'layout-4', keys: '⌘4', label: 'Git Focus', category: 'Layout', mod: true, key: '4' },
  { id: 'layout-5', keys: '⌘5', label: 'Zen Mode', category: 'Layout', mod: true, key: '5' },
  { id: 'toggle-terminal', keys: '⌘`', label: 'Toggle Terminal', category: 'Panels', mod: true, key: '`' },
  { id: 'toggle-sidebar', keys: '⌘B', label: 'Toggle Sidebar', category: 'Panels', mod: true, key: 'b' },
  { id: 'toggle-bottom', keys: '⌘J', label: 'Toggle Bottom Panel', category: 'Panels', mod: true, key: 'j' },
  { id: 'focus-explorer', keys: '⌘⇧E', label: 'Focus Explorer', category: 'Panels', mod: true, shift: true, key: 'e' },
  { id: 'focus-git', keys: '⌘⇧G', label: 'Focus Source Control', category: 'Panels', mod: true, shift: true, key: 'g' },
  { id: 'next-tab', keys: '⌘Tab', label: 'Next Workspace Tab', category: 'Tabs', mod: true, key: 'Tab' },
  { id: 'prev-tab', keys: '⌘⇧Tab', label: 'Previous Workspace Tab', category: 'Tabs', mod: true, shift: true, key: 'Tab' },
  { id: 'close-tab', keys: '⌘W', label: 'Close Current Tab', category: 'Tabs', mod: true, key: 'w' },
  { id: 'new-terminal', keys: '⌘N', label: 'New Terminal', category: 'Terminal', mod: true, key: 'n' },
  { id: 'shortcut-sheet', keys: '⌘⇧?', label: 'Keyboard Shortcuts', category: 'General', mod: true, shift: true, key: '?' },
];
