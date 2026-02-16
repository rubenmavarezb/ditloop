import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { useTheme } from '@ditloop/web-ui';
import { DesktopShell } from './components/Layout/DesktopShell.js';
import { FileBrowser } from './components/FileBrowser/FileBrowser.js';
import { CommandPalette } from './components/CommandPalette/CommandPalette.js';
import { Home } from './views/Home/index.js';
import { WorkspaceDetail } from './views/WorkspaceDetail/index.js';
import { Settings } from './views/Settings/index.js';
import { useShortcuts } from './hooks/useShortcuts.js';
import { useWorkspaces } from './hooks/useWorkspaces.js';
import { useProfiles } from './hooks/useProfiles.js';
import { useAiTools, useLaunchAiCli } from './hooks/useLocalAiCli.js';
import { useNotifications } from './hooks/useNotifications.js';
import { useTray } from './hooks/useTray.js';
import { useDeepLink } from './hooks/useDeepLink.js';
import type { PaletteCommand } from './store/commands.js';

/** Inner app content that has access to router hooks. */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { paletteOpen, closePalette } = useShortcuts();
  const { workspaces } = useWorkspaces();
  const { profiles, currentProfileName } = useProfiles();
  const { tools: aiTools } = useAiTools();
  const { launch } = useLaunchAiCli();

  // Wire notifications — request permission for OS notifications
  useNotifications(true);

  // Wire tray — send workspace count to system tray
  useTray(workspaces.length);

  // Wire deep links — listen for ditloop:// URLs
  useDeepLink();

  // Detect the currently viewed workspace (if on /workspace/:id)
  const activeWorkspace = useMemo(() => {
    const match = location.pathname.match(/^\/workspace\/(.+)$/);
    if (!match) return null;
    return workspaces.find((ws) => ws.id === match[1]) ?? null;
  }, [location.pathname, workspaces]);

  const availableAiTools = useMemo(() => aiTools.filter((t) => t.available), [aiTools]);

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

      // Profile commands (dynamic from config)
      ...Object.keys(profiles).map((name) => ({
        id: `profile:${name}`,
        category: 'Profile',
        title: `Switch to ${name}`,
        keywords: [profiles[name].email, 'identity', 'git'],
        action: () => invoke('switch_git_profile', { profileName: name }),
      })),

      // Git commands (available when viewing a workspace)
      ...(activeWorkspace
        ? [
            { id: 'git:status', category: 'Git', title: 'Git Status (refresh)', keywords: ['status'], action: () => {
              // Dispatch a custom event that WorkspaceDetail listens to
              window.dispatchEvent(new CustomEvent('ditloop:refresh-git'));
            }},
            { id: 'git:terminal', category: 'Git', title: 'Open Terminal', keywords: ['shell', 'console'], action: () => {
              invoke('open_in_terminal', { path: activeWorkspace.path });
            }},
            { id: 'git:editor', category: 'Git', title: 'Open in Editor', keywords: ['code', 'vscode'], action: () => {
              invoke('open_in_editor', { path: activeWorkspace.path, editor: null });
            }},
            { id: 'git:browse', category: 'Git', title: 'Browse Files', keywords: ['filesystem'], action: () => {
              navigate(`/files?path=${encodeURIComponent(activeWorkspace.path)}`);
            }},
          ]
        : []),

      // AI CLI commands (dynamic from detected tools)
      ...availableAiTools.flatMap((tool) => {
        const cmds: PaletteCommand[] = [];
        if (activeWorkspace) {
          cmds.push({
            id: `ai:${tool.command}:active`,
            category: 'AI',
            title: `Launch ${tool.name} in ${activeWorkspace.name}`,
            keywords: [tool.command, 'ai', 'cli'],
            action: () => launch(tool.command, activeWorkspace.path),
          });
        }
        // Also offer launching in any workspace
        workspaces.forEach((ws) => {
          if (ws.id !== activeWorkspace?.id) {
            cmds.push({
              id: `ai:${tool.command}:${ws.id}`,
              category: 'AI',
              title: `Launch ${tool.name} in ${ws.name}`,
              keywords: [tool.command, ws.name, 'ai', 'cli'],
              action: () => launch(tool.command, ws.path),
            });
          }
        });
        return cmds;
      }),

      // Window / System commands
      { id: 'window:fullscreen', category: 'Window', title: 'Toggle Full Screen', keywords: [], action: async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        const isFs = await win.isFullscreen();
        await win.setFullscreen(!isFs);
      }},
      { id: 'window:new', category: 'Window', title: 'New Window', keywords: ['open'], action: async () => {
        const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        new WebviewWindow(`ditloop-${Date.now()}`, {
          url: '/', title: 'DitLoop', width: 1200, height: 800,
          minWidth: 800, minHeight: 600, center: true, decorations: false,
        });
      }},
      { id: 'system:quit', category: 'System', title: 'Quit DitLoop', keywords: ['exit', 'close'], action: async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      }},
    ],
    [navigate, workspaces, profiles, activeWorkspace, availableAiTools, launch],
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
