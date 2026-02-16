import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {
  useTheme,
  useConnectionStore,
  Chat,
  WorkspaceList,
  WorkspaceDetail,
  ExecutionList,
  ExecutionDetail,
  ApprovalList,
  ApprovalDetail,
  Settings,
} from '@ditloop/web-ui';
import { DesktopShell } from './components/Layout/DesktopShell.js';
import { FileBrowser } from './components/FileBrowser/FileBrowser.js';
import { CommandPalette } from './components/CommandPalette/CommandPalette.js';
import { DesktopConnectionSetup } from './views/ConnectionSetup/DesktopConnectionSetup.js';
import { useShortcuts } from './hooks/useShortcuts.js';
import type { PaletteCommand } from './store/commands.js';

/** Inner app content that has access to router hooks. */
function AppContent() {
  const navigate = useNavigate();
  const { paletteOpen, closePalette } = useShortcuts();

  const commands = useMemo<PaletteCommand[]>(
    () => [
      { id: 'nav:workspaces', category: 'Navigate', title: 'Go to Workspaces', keywords: ['home'], action: () => navigate('/') },
      { id: 'nav:chat', category: 'Navigate', title: 'Go to Chat', keywords: ['message'], action: () => navigate('/chat') },
      { id: 'nav:approvals', category: 'Navigate', title: 'Go to Approvals', keywords: ['review'], action: () => navigate('/approvals') },
      { id: 'nav:executions', category: 'Navigate', title: 'Go to Executions', keywords: ['runs'], action: () => navigate('/executions') },
      { id: 'nav:files', category: 'Navigate', title: 'Go to Files', keywords: ['browse', 'filesystem'], action: () => navigate('/files') },
      { id: 'nav:settings', category: 'Navigate', title: 'Go to Settings', keywords: ['preferences', 'config'], action: () => navigate('/settings') },
      { id: 'window:fullscreen', category: 'Window', title: 'Toggle Full Screen', keywords: [], action: async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        const isFs = await win.isFullscreen();
        await win.setFullscreen(!isFs);
      }},
    ],
    [navigate],
  );

  return (
    <DesktopShell>
      <Routes>
        <Route path="/" element={<WorkspaceList />} />
        <Route path="/workspace/:id" element={<WorkspaceDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/approvals/:id" element={<ApprovalDetail />} />
        <Route path="/executions" element={<ExecutionList />} />
        <Route path="/executions/:id" element={<ExecutionDetail />} />
        <Route path="/files" element={<FileBrowser />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
    </DesktopShell>
  );
}

/** Root desktop application component with routing and theme management. */
export function App() {
  useTheme();
  const configured = useConnectionStore((s) => s.configured);

  if (!configured) {
    return <DesktopConnectionSetup />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
