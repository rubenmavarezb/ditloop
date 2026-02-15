import { Box, useApp, useInput } from 'ink';
import {
  ThemeProvider,
  SplitView,
  ShortcutsBar,
  Sidebar,
  Header,
} from '@ditloop/ui';
import type { WorkspaceItemData } from '@ditloop/ui';
import { useAppStore } from './state/app-store.js';
import { getViewTitle } from './navigation/router.js';
import { Home } from './views/Home/Home.js';
import { TaskDetail } from './views/TaskDetail/TaskDetail.js';
import { WorkspaceDetail } from './views/WorkspaceDetail/WorkspaceDetail.js';
import { DiffReviewView } from './views/DiffReview/DiffReviewView.js';
import { LauncherView } from './views/Launcher/LauncherView.js';
import { TaskEditorView } from './views/TaskEditor/TaskEditorView.js';

const SHORTCUTS = [
  { key: '↑↓', label: 'navigate' },
  { key: '→←', label: 'expand/collapse' },
  { key: '⏎', label: 'select' },
  { key: 'ctrl+b', label: 'sidebar' },
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
  const workspaces = useAppStore((s) => s.workspaces);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const currentView = useAppStore((s) => s.currentView);
  const currentProfile = useAppStore((s) => s.currentProfile);
  const activeIndex = useAppStore((s) => s.activeWorkspaceIndex);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const activateWorkspace = useAppStore((s) => s.activateWorkspace);
  const navigate = useAppStore((s) => s.navigate);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    // ctrl+b toggles sidebar
    if (input === 'b' && key.ctrl) {
      toggleSidebar();
      return;
    }

    // Number keys 1-9 for workspace shortcuts
    const num = parseInt(input, 10);
    if (num >= 1 && num <= 9 && num <= workspaces.length) {
      activateWorkspace(num - 1);
      return;
    }

    // Escape goes back to home
    if (key.escape) {
      navigate('home');
    }
  });

  const handleWorkspaceSelect = (_ws: WorkspaceItemData, index: number) => {
    activateWorkspace(index);
  };

  // Build breadcrumb segments
  const breadcrumbs = ['ditloop'];
  if (currentView === 'workspace-detail' && activeIndex !== null) {
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

  const mainArea = (
    <Box flexDirection="column" width="100%">
      <Header
        segments={breadcrumbs}
        rightText={currentProfile ?? undefined}
      />
      <MainContent />
    </Box>
  );

  return (
    <ThemeProvider>
      <Box flexDirection="column" width="100%">
        {sidebarVisible ? (
          <SplitView left={sidebar} right={mainArea} ratio={[30, 70]} />
        ) : (
          mainArea
        )}
        <ShortcutsBar shortcuts={SHORTCUTS} />
      </Box>
    </ThemeProvider>
  );
}
