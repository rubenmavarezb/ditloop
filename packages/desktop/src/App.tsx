import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { ThemeProvider, LayoutEngine, type LayoutSlots } from '@ditloop/web-ui';
import { DesktopShell } from './components/Layout/DesktopShell.js';
import { CommandPalette } from './components/CommandPalette/CommandPalette.js';
import { WorkspaceNavPanel } from './panels/WorkspaceNav/WorkspaceNavPanel.js';
import { AiChatPanel } from './panels/AiChat/AiChatPanel.js';
import { TerminalPanel } from './panels/Terminal/TerminalPanel.js';
import { SourceControlPanel } from './panels/SourceControl/SourceControlPanel.js';
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
import { TabBar } from './components/TabBar/TabBar.js';
import { useWorkspaceTabsStore } from './store/workspace-tabs.js';
import type { PaletteCommand } from './store/commands.js';

/** IDE layout with all panels wired into the LayoutEngine. */
function IDELayout() {
  const slots: LayoutSlots = {
    left: <WorkspaceNavPanel />,
    centerTop: <AiChatPanel />,
    centerBottom: <TerminalPanel />,
    right: <SourceControlPanel />,
  };

  return <LayoutEngine slots={slots} />;
}

/** Inner app content that has access to router hooks. */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { paletteOpen, closePalette } = useShortcuts();
  const { workspaces } = useWorkspaces();
  const { profiles } = useProfiles();
  const { tools: aiTools } = useAiTools();
  const { launch } = useLaunchAiCli();
  const { tabs, activeTabId, openTab } = useWorkspaceTabsStore();

  useNotifications(true);
  useTray(workspaces.length);
  useDeepLink();

  const activeWorkspace = useMemo(() => {
    // First check if we have an active tab
    if (activeTabId) {
      const tabWs = workspaces.find((ws) => ws.id === activeTabId);
      if (tabWs) return tabWs;
    }
    // Fallback to route matching
    const match = location.pathname.match(/^\/workspace\/(.+)$/);
    if (!match) return null;
    return workspaces.find((ws) => ws.id === match[1]) ?? null;
  }, [location.pathname, workspaces, activeTabId]);

  const availableAiTools = useMemo(() => aiTools.filter((t) => t.available), [aiTools]);

  const commands = useMemo<PaletteCommand[]>(
    () => [
      { id: 'nav:workspaces', category: 'Navigate', title: 'Go to Workspaces', keywords: ['home'], action: () => navigate('/') },
      { id: 'nav:files', category: 'Navigate', title: 'Go to Files', keywords: ['browse', 'filesystem'], action: () => navigate('/files') },
      { id: 'nav:settings', category: 'Navigate', title: 'Go to Settings', keywords: ['preferences', 'config'], action: () => navigate('/settings') },

      ...workspaces.map((ws) => ({
        id: `ws:${ws.id}`,
        category: 'Workspace',
        title: `Open ${ws.name}`,
        keywords: [ws.profile, ws.type],
        action: () => navigate(`/workspace/${ws.id}`),
      })),

      ...Object.keys(profiles).map((name) => ({
        id: `profile:${name}`,
        category: 'Profile',
        title: `Switch to ${name}`,
        keywords: [profiles[name].email, 'identity', 'git'],
        action: () => invoke('switch_git_profile', { profileName: name }),
      })),

      ...(activeWorkspace
        ? [
            { id: 'git:status', category: 'Git', title: 'Git Status (refresh)', keywords: ['status'], action: () => {
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

  // IDE mode when we have tabs open or navigated to a workspace
  const hasOpenTabs = tabs.length > 0;
  const isIDEMode = hasOpenTabs || location.pathname.startsWith('/workspace/');

  return (
    <DesktopShell header={isIDEMode ? <TabBar /> : undefined}>
      {isIDEMode ? (
        <IDELayout />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      )}
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
    </DesktopShell>
  );
}

/** Root desktop application — local-first, no server required. */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
