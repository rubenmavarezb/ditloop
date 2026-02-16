import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useTheme } from '@ditloop/web-ui';
import { DesktopShell } from './components/Layout/DesktopShell.js';
import { FileBrowser } from './components/FileBrowser/FileBrowser.js';
import { CommandPalette } from './components/CommandPalette/CommandPalette.js';
import { Home } from './views/Home/index.js';
import { WorkspaceDetail } from './views/WorkspaceDetail/index.js';
import { Settings } from './views/Settings/index.js';
import { useShortcuts } from './hooks/useShortcuts.js';
import { useWorkspaces } from './hooks/useWorkspaces.js';
import type { PaletteCommand } from './store/commands.js';

/** Inner app content that has access to router hooks. */
function AppContent() {
  const navigate = useNavigate();
  const { paletteOpen, closePalette } = useShortcuts();
  const { workspaces } = useWorkspaces();

  const commands = useMemo<PaletteCommand[]>(
    () => [
      // Navigation commands
      { id: 'nav:workspaces', category: 'Navigate', title: 'Go to Workspaces', keywords: ['home'], action: () => navigate('/') },
      { id: 'nav:files', category: 'Navigate', title: 'Go to Files', keywords: ['browse', 'filesystem'], action: () => navigate('/files') },
      { id: 'nav:settings', category: 'Navigate', title: 'Go to Settings', keywords: ['preferences', 'config'], action: () => navigate('/settings') },
      // Workspace commands (dynamic from config)
      ...workspaces.map((ws) => ({
        id: `ws:${ws.id}`,
        category: 'Workspace',
        title: `Open ${ws.name}`,
        keywords: [ws.profile, ws.type],
        action: () => navigate(`/workspace/${ws.id}`),
      })),
      // Window commands
      { id: 'window:fullscreen', category: 'Window', title: 'Toggle Full Screen', keywords: [], action: async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        const isFs = await win.isFullscreen();
        await win.setFullscreen(!isFs);
      }},
    ],
    [navigate, workspaces],
  );

  return (
    <DesktopShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workspace/:id" element={<WorkspaceDetail />} />
        <Route path="/files" element={<FileBrowser />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
    </DesktopShell>
  );
}

/** Root desktop application — local-first, no server required. */
export function App() {
  useTheme();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
