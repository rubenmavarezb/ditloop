import React from 'react';
import { Box } from 'ink';
import {
  resolveLayout,
  PanelContainer,
  FocusablePanel,
  GitStatusPanel,
  TasksPanel,
  BranchesPanel,
  CommitsPanel,
  FileTreePanel,
  PreviewPanel,
  CommandLogPanel,
  FuzzyFinder,
  ShortcutsBar,
} from '@ditloop/ui';
import type { Shortcut } from '@ditloop/ui';
import { useLayoutStore } from '../../state/layout-store.js';
import { useKeyboardStore } from '../../state/keyboard-store.js';
import { useGitStatusPanel } from '../../hooks/useGitStatusPanel.js';
import { useTasksPanel } from '../../hooks/useTasksPanel.js';
import { useBranchesPanel } from '../../hooks/useBranchesPanel.js';
import { useCommitsPanel } from '../../hooks/useCommitsPanel.js';
import { useFileTreePanel } from '../../hooks/useFileTreePanel.js';
import { useCommandLog } from '../../hooks/useCommandLog.js';
import { useFuzzyFinder } from '../../hooks/useFuzzyFinder.js';

/** Props for the WorkspacePanelsView. */
export interface WorkspacePanelsViewProps {
  /** Path to the active workspace repository. */
  repoPath: string | null;
  /** Path to the .ai/ directory for file tree. */
  aidfPath: string | null;
  /** Terminal width in columns. */
  termWidth: number;
  /** Terminal height in rows. */
  termHeight: number;
}

/** Context-sensitive shortcuts for the bottom bar. */
const PANEL_SHORTCUTS: Shortcut[] = [
  { key: 'Tab', label: 'Next panel' },
  { key: 'h/l', label: 'Left/Right' },
  { key: 'j/k', label: 'Up/Down' },
  { key: '/', label: 'Search' },
  { key: '+/-', label: 'Resize' },
  { key: '=', label: 'Reset layout' },
  { key: '?', label: 'Help' },
  { key: 'q', label: 'Quit' },
];

/**
 * Multi-panel workspace view composing all panels into a LazyGit-inspired layout.
 * Renders the layout grid, all panels, fuzzy finder overlay, and shortcuts bar.
 *
 * @param props - Workspace context and terminal dimensions
 */
export function WorkspacePanelsView({
  repoPath,
  aidfPath,
  termWidth,
  termHeight,
}: WorkspacePanelsViewProps) {
  const layoutConfig = useLayoutStore((s) => s.layoutConfig);
  const focusedPanelId = useKeyboardStore((s) => s.focusedPanelId);
  const panelOrder = useKeyboardStore((s) => s.panelOrder);
  const mode = useKeyboardStore((s) => s.mode);

  // Wire up panel hooks
  const gitStatus = useGitStatusPanel(repoPath);
  const tasks = useTasksPanel(repoPath);
  const branches = useBranchesPanel(repoPath);
  const commits = useCommitsPanel(repoPath);
  const fileTree = useFileTreePanel(aidfPath);
  const commandLog = useCommandLog();

  // Fuzzy finder with placeholder items (will be populated from panel data)
  const fuzzyFinder = useFuzzyFinder([]);

  // Resolve layout to absolute positions
  const resolvedPanels = resolveLayout(layoutConfig, termWidth, termHeight - 2); // -2 for shortcuts bar

  /** Render the content of a panel by its ID. */
  const renderPanel = (panelId: string, width: number, height: number) => {
    const panelIndex = panelOrder.indexOf(panelId);
    const isFocused = panelId === focusedPanelId;
    const panelNumber = panelIndex + 1;

    const content = (() => {
      switch (panelId) {
        case 'git-status':
          return (
            <GitStatusPanel
              staged={gitStatus.staged}
              unstaged={gitStatus.unstaged}
              untracked={gitStatus.untracked}
              selectedIndex={gitStatus.selectedIndex}
            />
          );
        case 'tasks':
          return (
            <TasksPanel
              tasks={tasks.tasks}
              selectedIndex={tasks.selectedIndex}
              filter={tasks.filter}
            />
          );
        case 'branches':
          return (
            <BranchesPanel
              local={branches.local}
              remote={branches.remote}
              selectedIndex={branches.selectedIndex}
            />
          );
        case 'commits':
          return (
            <CommitsPanel
              commits={commits.commits}
              selectedIndex={commits.selectedIndex}
            />
          );
        case 'file-tree':
          return (
            <FileTreePanel
              nodes={fileTree.nodes}
              selectedIndex={fileTree.selectedIndex}
            />
          );
        case 'preview':
          return (
            <PreviewPanel
              title={fileTree.selectedPath ?? 'Preview'}
              lines={[]}
              scrollOffset={0}
              maxLines={height - 2}
            />
          );
        case 'command-log':
          return (
            <CommandLogPanel
              entries={commandLog.entries}
              maxEntries={height - 1}
            />
          );
        default:
          return null;
      }
    })();

    const panelLabel = panelId
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return (
      <FocusablePanel
        title={panelLabel}
        focused={isFocused}
        panelNumber={panelNumber > 0 ? panelNumber : undefined}
        width={width}
        height={height}
      >
        {content}
      </FocusablePanel>
    );
  };

  return (
    <Box flexDirection="column">
      <PanelContainer panels={resolvedPanels} renderPanel={renderPanel} />
      {mode === 'search' && (
        <Box position="absolute" marginLeft={Math.floor(termWidth * 0.2)}>
          <FuzzyFinder
            visible={fuzzyFinder.visible || mode === 'search'}
            query={fuzzyFinder.query}
            results={fuzzyFinder.results}
            selectedIndex={fuzzyFinder.selectedIndex}
            termWidth={termWidth}
            termHeight={termHeight}
          />
        </Box>
      )}
      <ShortcutsBar shortcuts={PANEL_SHORTCUTS} />
    </Box>
  );
}
