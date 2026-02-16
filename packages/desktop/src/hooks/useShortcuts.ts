import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Global keyboard shortcut manager for desktop app. */
export function useShortcuts() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();

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

      // Cmd/Ctrl+1..3 — navigate to sidebar sections
      if (mod && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const routes = ['/', '/files', '/settings'];
        const index = parseInt(e.key, 10) - 1;
        if (index < routes.length) {
          navigate(routes[index]);
        }
        return;
      }

      // Cmd/Ctrl+, — settings
      if (mod && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, togglePalette]);

  return { paletteOpen, closePalette };
}
