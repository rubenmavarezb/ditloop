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

  switch (currentView) {
    case 'home':
      return <Home />;
    case 'task-detail':
      return <TaskDetail />;
    case 'workspace-detail':
      return <Home />;
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

  const breadcrumbs = ['ditloop', getViewTitle(currentView)];

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
