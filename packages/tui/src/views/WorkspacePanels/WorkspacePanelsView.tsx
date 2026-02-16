import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { usePanelActionStore } from '../../state/panel-actions.js';
import { useGitStatusPanel } from '../../hooks/useGitStatusPanel.js';
import { useTasksPanel } from '../../hooks/useTasksPanel.js';
import { useBranchesPanel } from '../../hooks/useBranchesPanel.js';
import { useCommitsPanel } from '../../hooks/useCommitsPanel.js';
import { useFileTreePanel } from '../../hooks/useFileTreePanel.js';
import { useCommandLog } from '../../hooks/useCommandLog.js';
import { useFuzzyFinder } from '../../hooks/useFuzzyFinder.js';
import type { FuzzySearchItem } from '../../hooks/useFuzzyFinder.js';
import { HelpOverlay } from './HelpOverlay.js';

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
  const helpVisible = useKeyboardStore((s) => s.helpVisible);
  const setPanelOrder = useKeyboardStore((s) => s.setPanelOrder);

  // Wire up panel hooks
  const gitStatus = useGitStatusPanel(repoPath);
  const tasks = useTasksPanel(repoPath);
  const branches = useBranchesPanel(repoPath);
  const commits = useCommitsPanel(repoPath);
  const fileTree = useFileTreePanel(repoPath);
  const commandLog = useCommandLog();

  // Preview panel state: loads file content when file tree selection changes
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [previewScroll, setPreviewScroll] = useState(0);

  useEffect(() => {
    const selectedPath = fileTree.selectedPath;
    if (!selectedPath) {
      setPreviewLines([]);
      return;
    }

    import('node:fs/promises').then(({ readFile, stat }) => {
      stat(selectedPath).then((s) => {
        if (s.isDirectory()) {
          setPreviewLines(['(directory)']);
          return;
        }
        if (s.size > 100_000) {
          setPreviewLines(['(file too large to preview)']);
          return;
        }
        return readFile(selectedPath, 'utf-8').then((content) => {
          setPreviewLines(content.split('\n'));
          setPreviewScroll(0);
        });
      }).catch(() => setPreviewLines(['(cannot read file)']));
    });
  }, [fileTree.selectedPath]);

  // Subscribe to panel actions and route to the correct panel hook
  const lastAction = usePanelActionStore((s) => s.lastAction);
  useEffect(() => {
    if (!lastAction) return;
    const { panelId, action } = lastAction;

    const handlers: Record<string, { moveUp: () => void; moveDown: () => void; toggleExpand?: () => void }> = {
      'git-status': gitStatus,
      'tasks': tasks,
      'branches': branches,
      'commits': commits,
      'file-tree': fileTree,
    };

    const handler = handlers[panelId];
    if (!handler) return;

    if (action === 'scroll-down') handler.moveDown();
    if (action === 'scroll-up') handler.moveUp();
    if (action === 'activate' || action === 'toggle-expand') handler.toggleExpand?.();
  }, [lastAction]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve layout to absolute positions
  const resolvedPanels = resolveLayout(layoutConfig, termWidth, termHeight - 2); // -2 for shortcuts bar

  // Fix 5: Initialize panelOrder from resolved layout.
  // Depend on layoutConfig (stable ref) rather than resolvedPanels (new array each render).
  const panelOrderInitialized = useRef(false);
  useEffect(() => {
    const panelIds = resolvedPanels
      .filter((p) => p.panelId !== 'command-log') // bottom bar isn't focusable
      .map((p) => p.panelId);
    if (!panelOrderInitialized.current || panelOrder.length === 0) {
      setPanelOrder(panelIds);
      panelOrderInitialized.current = true;
    }
  }, [layoutConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fix 11: Populate fuzzy finder with panel data
  const fuzzyItems = useMemo(() => {
    const items: FuzzySearchItem[] = [];

    for (const b of [...branches.local, ...branches.remote]) {
      items.push({
        label: b.name,
        category: 'branch',
        meta: b.isCurrent ? 'current' : undefined,
        action: () => { /* TODO: switch branch */ },
      });
    }

    for (const t of tasks.tasks) {
      items.push({
        label: `${t.id} ${t.title}`,
        category: 'task',
        meta: t.status,
        action: () => { /* TODO: open task detail */ },
      });
    }

    for (const n of fileTree.nodes) {
      items.push({
        label: n.path,
        category: 'file',
        action: () => { /* TODO: preview file */ },
      });
    }

    return items;
  }, [branches.local, branches.remote, tasks.tasks, fileTree.nodes]);

  const fuzzyFinder = useFuzzyFinder(fuzzyItems);

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
              lines={previewLines}
              scrollOffset={previewScroll}
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
        <FuzzyFinder
          visible={true}
          query={fuzzyFinder.query}
          results={fuzzyFinder.results}
          selectedIndex={fuzzyFinder.selectedIndex}
          termWidth={termWidth}
          termHeight={termHeight}
        />
      )}
      {helpVisible && (
        <HelpOverlay
          visible={true}
          width={Math.floor(termWidth * 0.7)}
        />
      )}
      <ShortcutsBar shortcuts={PANEL_SHORTCUTS} />
    </Box>
  );
}
