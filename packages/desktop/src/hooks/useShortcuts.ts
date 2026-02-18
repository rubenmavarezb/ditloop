import { useEffect, useCallback, useState } from 'react';
import { useLayoutStore, type LayoutPresetId } from '@ditloop/web-ui';
import { useWorkspaceTabsStore } from '../store/workspace-tabs.js';
import { useShortcutStore } from '../store/shortcuts.js';

/** Global keyboard shortcut manager for desktop app. */
export function useShortcuts() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { setPreset, togglePanel } = useLayoutStore();
  const { nextTab, prevTab, closeTab, activeTabId } = useWorkspaceTabsStore();
  const { toggleSheet } = useShortcutStore();

  const togglePalette = useCallback(() => {
    setPaletteOpen((prev) => !prev);
  }, []);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+K — toggle command palette
      if (mod && e.key === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }

      // Cmd/Ctrl+1..5 — switch layout presets
      if (mod && !e.shiftKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const presets: LayoutPresetId[] = ['default', 'code-focus', 'ai-focus', 'git-focus', 'zen'];
        const index = parseInt(e.key, 10) - 1;
        if (index < presets.length) {
          setPreset(presets[index]);
        }
        return;
      }

      // Cmd/Ctrl+` — toggle terminal
      if (mod && e.key === '`') {
        e.preventDefault();
        togglePanel('terminal');
        return;
      }

      // Cmd/Ctrl+B — toggle left sidebar
      if (mod && !e.shiftKey && e.key === 'b') {
        e.preventDefault();
        togglePanel('workspace-nav');
        return;
      }

      // Cmd/Ctrl+J — toggle bottom panel
      if (mod && e.key === 'j') {
        e.preventDefault();
        togglePanel('terminal');
        return;
      }

      // Cmd/Ctrl+Shift+E — focus explorer
      if (mod && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        // Toggle file explorer visibility
        togglePanel('file-explorer');
        return;
      }

      // Cmd/Ctrl+Shift+G — focus source control
      if (mod && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        togglePanel('source-control');
        return;
      }

      // Cmd/Ctrl+Tab — next workspace tab
      if (mod && !e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        nextTab();
        return;
      }

      // Cmd/Ctrl+Shift+Tab — previous workspace tab
      if (mod && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        prevTab();
        return;
      }

      // Cmd/Ctrl+W — close current tab
      if (mod && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }

      // Cmd/Ctrl+, — settings
      if (mod && e.key === ',') {
        e.preventDefault();
        // Navigate to settings handled by router
        window.dispatchEvent(new CustomEvent('ditloop:navigate', { detail: '/settings' }));
        return;
      }

      // Cmd/Ctrl+Shift+? — shortcut reference sheet
      if (mod && e.shiftKey && e.key === '?') {
        e.preventDefault();
        toggleSheet();
        return;
      }
    };

    // Also handle the palette toggle from custom events (TitleBar search button)
    const customHandler = () => togglePalette();
    window.addEventListener('keydown', handler);
    window.addEventListener('ditloop:toggle-palette', customHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('ditloop:toggle-palette', customHandler);
    };
  }, [togglePalette, setPreset, togglePanel, nextTab, prevTab, closeTab, activeTabId, toggleSheet]);

  return { paletteOpen, closePalette };
}
