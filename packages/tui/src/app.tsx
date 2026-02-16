import { useState, useEffect } from 'react';
import { Box, useApp } from 'ink';
import {
  ThemeProvider,
  SplitView,
  ShortcutsBar,
  Sidebar,
  Header,
} from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';
import { useAppStore } from './state/app-store.js';
import { useKeyboardManager } from './hooks/useKeyboardManager.js';
import { getViewTitle } from './navigation/router.js';
import { Home } from './views/Home/Home.js';
import { TaskDetail } from './views/TaskDetail/TaskDetail.js';
import { WorkspaceDetail } from './views/WorkspaceDetail/WorkspaceDetail.js';
import { DiffReviewView } from './views/DiffReview/DiffReviewView.js';
import { LauncherView } from './views/Launcher/LauncherView.js';
import { TaskEditorView } from './views/TaskEditor/TaskEditorView.js';
import { ExecutionDashboard } from './views/ExecutionDashboard/ExecutionDashboard.js';
import { WorkspacePanelsView } from './views/WorkspacePanels/WorkspacePanelsView.js';
import { useLayoutStore, RESIZE_STEP } from './state/layout-store.js';
import { useKeyboardStore } from './state/keyboard-store.js';

const SHORTCUTS = [
  { key: 'h/j/k/l', label: 'navigate' },
  { key: 'Tab', label: 'cycle panels' },
  { key: '/', label: 'search' },
  { key: 'ctrl+b', label: 'sidebar' },
  { key: '?', label: 'help' },
  { key: 'q', label: 'quit' },
];

/**
 * Render the main content area based on the current view.
 */
function MainContent() {
  const currentView = useAppStore((s) => s.currentView);
  const workspaces = useAppStore((s) => s.workspaces);
  const activeIndex = useAppStore((s) => s.activeWorkspaceIndex);
  const navigate = useAppStore((s) => s.navigate);
  const ws = activeIndex !== null ? workspaces[activeIndex] : undefined;

  switch (currentView) {
    case 'home':
      return <Home />;
    case 'task-detail':
      return <TaskDetail />;
    case 'workspace-detail': {
      if (!ws) return <Home />;
      return (
        <WorkspaceDetail
          workspace={ws}
          profileName={useAppStore.getState().currentProfile ?? undefined}
        />
      );
    }
    case 'diff-review':
      return <DiffReviewView actions={[]} />;
    case 'launcher':
      return (
        <LauncherView
          detectedClis={[]}
          allCliIds={[]}
          cliDefinitions={new Map()}
          tasks={[]}
          workspaceName={ws?.name ?? 'Workspace'}
          onLaunch={() => {}}
          onBack={() => navigate('home')}
        />
      );
    case 'task-editor':
      return (
        <TaskEditorView
          templates={[]}
          onSave={() => {}}
          onCancel={() => navigate('home')}
        />
      );
    case 'workspace-panels': {
      return (
        <WorkspacePanelsView
          repoPath={ws?.path ?? null}
          aidfPath={ws?.aidfPath ?? null}
          termWidth={process.stdout.columns ?? 80}
          termHeight={process.stdout.rows ?? 24}
        />
      );
    }
    case 'execution-dashboard':
      return (
        <ExecutionDashboard
          executions={[]}
          serverConnected={false}
          onBack={() => navigate('home')}
        />
      );
    default:
      return <Home />;
  }
}

/**
 * Root application component for the DitLoop TUI.
 * Composes ThemeProvider, SplitView with Sidebar, Header, main content, and ShortcutsBar.
 */
export function App() {
  const { exit } = useApp();
  const [termHeight, setTermHeight] = useState(process.stdout.rows ?? 24);

  useEffect(() => {
    const onResize = () => setTermHeight(process.stdout.rows ?? 24);
    process.stdout.on('resize', onResize);
    return () => { process.stdout.off('resize', onResize); };
  }, []);

  const workspaces = useAppStore((s) => s.workspaces);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const currentView = useAppStore((s) => s.currentView);
  const currentProfile = useAppStore((s) => s.currentProfile);
  const activeIndex = useAppStore((s) => s.activeWorkspaceIndex);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const activateWorkspace = useAppStore((s) => s.activateWorkspace);
  const navigate = useAppStore((s) => s.navigate);

  useKeyboardManager({
    onQuit: () => exit(),
    onAction: (action, _panelId) => {
      if (action === 'toggle-sidebar') {
        toggleSidebar();
        return;
      }
      if (action === 'navigate-home') {
        const { currentView: cv } = useAppStore.getState();
        if (cv === 'workspace-panels') {
          useAppStore.getState().clearWorkspaceDetailData();
          useKeyboardStore.getState().setPanelOrder([]);
        }
        navigate('home');
        return;
      }
      if (action === 'resize-grow') {
        useLayoutStore.getState().resizePanel(_panelId, 'v', RESIZE_STEP);
        return;
      }
      if (action === 'resize-shrink') {
        useLayoutStore.getState().resizePanel(_panelId, 'v', -RESIZE_STEP);
        return;
      }
      if (action === 'reset-layout') {
        useLayoutStore.getState().resetLayout();
        return;
      }
    },
  });

  const handleWorkspaceSelect = (_ws: WorkspaceItemData, index: number) => {
    activateWorkspace(index);
  };

  // Build breadcrumb segments
  const breadcrumbs = ['ditloop'];
  if ((currentView === 'workspace-detail' || currentView === 'workspace-panels') && activeIndex !== null) {
    breadcrumbs.push(workspaces[activeIndex]?.name ?? 'Workspace');
  } else {
    breadcrumbs.push(getViewTitle(currentView));
  }

  const sidebar = (
    <Sidebar
      workspaces={workspaces}
      onSelect={handleWorkspaceSelect}
      visible={sidebarVisible}
      isFocused={sidebarVisible}
    />
  );

  return (
    <ThemeProvider>
      <Box flexDirection="column" width="100%" height={termHeight}>
        <Header segments={breadcrumbs} rightText={currentProfile ?? undefined} />
        <Box flexDirection="column" width="100%" flexGrow={1} overflow="hidden">
          {sidebarVisible && currentView !== 'workspace-panels' ? (
            <SplitView left={sidebar} right={<MainContent />} ratio={[30, 70]} />
          ) : (
            <MainContent />
          )}
        </Box>
        <ShortcutsBar shortcuts={SHORTCUTS} />
      </Box>
    </ThemeProvider>
  );
}
