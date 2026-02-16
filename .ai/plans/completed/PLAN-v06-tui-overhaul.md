# PLAN: v0.6 TUI Overhaul (LazyGit-inspired)

## Overview

Transform DitLoop's TUI from a sidebar + single-view dashboard into a dense, multi-panel terminal IDE. Inspired by LazyGit's panel-based layout and Yazi's file browser, the new TUI displays git status, AIDF tasks, branches, commits, file trees, and a command log simultaneously on a single screen. Navigation is vim-style (h/j/k/l) with panel focus cycling, and a fuzzy finder overlay provides instant search across all entities.

**Packages affected:** `@ditloop/ui` (new layout and panel components), `@ditloop/tui` (new views, stores, keyboard manager)

**Prerequisite versions:** v0.4 (Server & API) should be complete so the command log can capture remote events. v0.3.1 (Docs) is independent and can run in parallel.

## Goals

- Multi-panel workspace view showing git status, AIDF tasks, branches, and recent commits in a single screen
- Vim-style keyboard navigation (h/j/k/l, g/G, /, etc.) across all panels and views
- File tree browser for `.ai/` context files with inline preview
- Command log capturing all EventBus events (git ops, AI launches, approvals)
- Git worktree detection displayed in the branches panel
- Panel resizing with keyboard shortcuts and layout persistence to disk
- Fuzzy finder overlay for workspaces, tasks, branches, and files
- Inline diff preview when selecting files in git status or file tree panels

## Non-Goals

- Mouse support (terminal-only, keyboard-driven)
- Custom terminal rendering engine (we stay on Ink/React)
- Remote panel streaming (panels consume local Zustand state, not WebSocket directly)
- Syntax highlighting in file previews (plain text with line numbers is sufficient for v0.6)
- Theming engine overhaul (reuse existing `ThemeColors`; cosmetic refresh is a separate effort)
- Replacing existing views (Home, WorkspaceDetail, etc.) — the panel workspace is a new view mode that coexists with the current navigation

---

## Architecture

### Panel System

The core abstraction is a **LayoutEngine** that manages a grid of named panels. Each panel has:

- A unique `panelId` (e.g., `'git-status'`, `'tasks'`, `'branches'`, `'commits'`, `'file-tree'`, `'preview'`, `'command-log'`)
- A position in the grid (row, column, rowSpan, colSpan)
- A minimum size (minWidth, minHeight in terminal columns/rows)
- A `focused` flag — only one panel is focused at a time

The layout is defined as a **LayoutConfig** — a declarative JSON structure describing rows and columns with percentage-based sizing. The default layout resembles LazyGit:

```
+--------------------+------------------------+
|   Git Status (1)   |   Commits / Log (4)    |
+--------------------+------------------------+
|   AIDF Tasks (2)   |   Preview / Diff (5)   |
+--------------------+                        |
|   Branches (3)     |                        |
+--------------------+------------------------+
|              Command Log (6)                |
+---------------------------------------------+
```

**File locations:**

- `packages/ui/src/layout/LayoutEngine/` — layout calculation logic (pure functions, no React)
- `packages/ui/src/layout/PanelContainer/` — Ink component that renders the grid
- `packages/ui/src/layout/FocusablePanel/` — wrapper that applies focused/unfocused border styles
- `packages/tui/src/state/layout-store.ts` — Zustand store for layout state + persistence

### Layout Manager

The `LayoutEngine` is a set of pure functions that:

1. Accept a `LayoutConfig` (rows/cols with percentages) + terminal dimensions (`stdout.columns`, `stdout.rows`)
2. Output absolute positions and sizes for each panel (in columns/rows)
3. Handle resize events by recalculating from percentages
4. Support panel size adjustment (increase/decrease a split by N columns)

```typescript
// packages/ui/src/layout/LayoutEngine/layout-engine.ts

interface PanelSlot {
  panelId: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

interface LayoutConfig {
  rows: LayoutRow[];
  bottomBar?: { panelId: string; height: number };
}

interface LayoutRow {
  height: string; // e.g., '33%', '6'
  columns: LayoutColumn[];
}

interface LayoutColumn {
  panelId: string;
  width: string; // e.g., '40%', '60%'
  rowSpan?: number; // span multiple rows in this column
}

interface ResolvedPanel {
  panelId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function resolveLayout(config: LayoutConfig, termWidth: number, termHeight: number): ResolvedPanel[];
function adjustSplit(config: LayoutConfig, splitIndex: number, axis: 'h' | 'v', delta: number): LayoutConfig;
```

### Keyboard Handler

A centralized `KeyboardManager` replaces the current scattered `useInput` calls. It uses a **mode-based** system inspired by vim:

- **Normal mode** — panel navigation (h/j/k/l moves focus, Tab cycles), list scrolling (j/k within panel), actions (Enter to select, d for diff, etc.)
- **Search mode** — fuzzy finder overlay is active, all keys go to the search input
- **Command mode** — `:` prefix for commands (future extensibility)

The manager is implemented as a Zustand store + a single root `useInput` hook in `App.tsx`. Each panel registers its own key bindings via a `usePanelKeys` hook that activates only when that panel is focused.

```typescript
// packages/tui/src/state/keyboard-store.ts

type KeyMode = 'normal' | 'search' | 'command';

interface KeyBinding {
  key: string;            // e.g., 'j', 'k', 'enter', 'ctrl+f'
  mode: KeyMode;
  panelId?: string;       // if set, only active when this panel is focused
  action: string;         // action identifier
  description: string;    // for help overlay
}

interface KeyboardState {
  mode: KeyMode;
  focusedPanelId: string;
  bindings: KeyBinding[];
  setMode: (mode: KeyMode) => void;
  setFocus: (panelId: string) => void;
  registerBindings: (bindings: KeyBinding[]) => void;
  unregisterBindings: (panelId: string) => void;
}
```

**Navigation logic (Normal mode):**

| Key | Action |
|-----|--------|
| `h` / `l` | Move focus to panel left / right |
| `j` / `k` | Scroll down / up within focused panel list |
| `Tab` / `Shift+Tab` | Cycle panel focus forward / backward |
| `Enter` | Select / expand item in focused panel |
| `g` / `G` | Jump to top / bottom of list |
| `/` or `Ctrl+f` | Open fuzzy finder |
| `1`-`6` | Jump to panel by number |
| `q` | Quit (with confirmation if dirty) |
| `Esc` | Back to home / close overlay |
| `?` | Show keybindings help overlay |
| `+` / `-` | Resize focused panel larger / smaller |
| `=` | Reset layout to defaults |
| `d` | Show diff for selected file (git status / file tree panels) |

---

## Task Breakdown

### Task 053: Layout Engine and Panel System

**Scope:** Build the foundational layout engine that calculates panel positions from a declarative config, and the `PanelContainer` / `FocusablePanel` Ink components that render the grid.

**Files to create:**

- `packages/ui/src/layout/LayoutEngine/layout-engine.ts` — pure layout calculation functions
- `packages/ui/src/layout/LayoutEngine/layout-engine.test.ts` — unit tests
- `packages/ui/src/layout/LayoutEngine/index.ts` — barrel
- `packages/ui/src/layout/PanelContainer/PanelContainer.tsx` — Ink component rendering resolved panels using absolute positioning
- `packages/ui/src/layout/PanelContainer/PanelContainer.test.tsx` — component tests
- `packages/ui/src/layout/PanelContainer/index.ts` — barrel
- `packages/ui/src/layout/FocusablePanel/FocusablePanel.tsx` — panel wrapper with focused/unfocused border styling
- `packages/ui/src/layout/FocusablePanel/FocusablePanel.test.tsx` — component tests
- `packages/ui/src/layout/FocusablePanel/index.ts` — barrel
- `packages/ui/src/layout/index.ts` — layout domain barrel

**Files to modify:**

- `packages/ui/src/index.ts` — export new layout components

**Deliverables:**

- `resolveLayout()` correctly maps percentages to absolute col/row positions given terminal size
- `adjustSplit()` modifies a split boundary by delta, clamped to minimum sizes
- `PanelContainer` renders N panels at their calculated positions using Ink `<Box>`
- `FocusablePanel` applies `borderColor={theme.accent}` when focused, `borderColor={theme.border}` when not
- Default layout config constant exported: `DEFAULT_WORKSPACE_LAYOUT`

**Definition of Done:**

- [ ] `resolveLayout()` passes tests with 3 different terminal sizes (80x24, 120x40, 200x60)
- [ ] Panels respect minWidth/minHeight constraints
- [ ] `adjustSplit()` clamps to min sizes and preserves total
- [ ] `PanelContainer` renders with ink-testing-library
- [ ] `FocusablePanel` toggles border color based on `focused` prop
- [ ] Exported from `@ditloop/ui`
- [ ] JSDoc on all public APIs
- [ ] Playground story for `PanelContainer` with mock panels

**Dependencies:** None (foundation task)

---

### Task 054: Vim-style Keyboard Navigation Manager

**Scope:** Build the centralized keyboard management system with mode support, panel focus cycling, and per-panel key binding registration. Replace the ad-hoc `useInput` in `App.tsx` with the new manager.

**Files to create:**

- `packages/tui/src/state/keyboard-store.ts` — Zustand store for keyboard mode, focus, bindings
- `packages/tui/src/state/keyboard-store.test.ts` — unit tests
- `packages/tui/src/hooks/useKeyboardManager.ts` — root hook that consumes `useInput` and dispatches to store
- `packages/tui/src/hooks/useKeyboardManager.test.ts` — tests
- `packages/tui/src/hooks/usePanelKeys.ts` — hook for panels to register/unregister their key bindings
- `packages/tui/src/hooks/usePanelKeys.test.ts` — tests

**Files to modify:**

- `packages/tui/src/app.tsx` — replace inline `useInput` with `useKeyboardManager`
- `packages/tui/src/state/index.ts` — export `useKeyboardStore`
- `packages/tui/src/hooks/index.ts` — export new hooks

**Deliverables:**

- `useKeyboardStore` Zustand store with mode, focusedPanelId, bindings
- `useKeyboardManager()` single root hook: reads mode and bindings, dispatches actions
- `usePanelKeys(panelId, bindings)` registers bindings on mount, unregisters on unmount
- Panel focus navigation: `Tab`/`Shift+Tab` cycles, `h`/`l` moves left/right, `1`-`6` jumps directly
- Mode switching: `/` enters search mode, `Esc` returns to normal
- `?` toggles a help overlay (renders registered bindings grouped by panel)

**Definition of Done:**

- [ ] Tab cycles through panels in order
- [ ] h/l moves focus to adjacent panel
- [ ] Panel-specific bindings only fire when that panel is focused
- [ ] Mode transitions work (normal -> search -> normal)
- [ ] Help overlay renders all bindings
- [ ] Existing App.tsx keyboard behavior preserved (q to quit, Ctrl+b sidebar, number keys)
- [ ] All tests pass
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (needs panel IDs for focus targets)

---

### Task 055: Git Status Panel

**Scope:** Build the `GitStatusPanel` component that displays the current workspace's git status in LazyGit style — staged files, unstaged files, untracked files as separate scrollable sections. Selecting a file shows its diff in the preview panel.

**Files to create:**

- `packages/ui/src/panels/GitStatusPanel/GitStatusPanel.tsx` — the panel component
- `packages/ui/src/panels/GitStatusPanel/GitStatusPanel.test.tsx` — tests
- `packages/ui/src/panels/GitStatusPanel/index.ts` — barrel
- `packages/ui/src/panels/index.ts` — panels domain barrel
- `packages/tui/src/hooks/useGitStatusPanel.ts` — hook wiring `GitStatusReader` to panel state
- `packages/tui/src/hooks/useGitStatusPanel.test.ts` — tests

**Files to modify:**

- `packages/ui/src/index.ts` — export new panels
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- Three collapsible sections: Staged (green), Unstaged (yellow), Untracked (gray)
- Each section shows file count badge
- File entries show status icon (M/A/D/R/?) and relative path
- j/k scrolls within section, Enter toggles stage/unstage (emits action via callback)
- Selected file emits `onFileSelect(path)` for the preview panel to display diff
- Section collapse/expand with `Enter` on section header
- Subscribes to `git:status-changed` EventBus events for live updates
- Empty state: "Clean working tree" message

**Definition of Done:**

- [ ] Renders staged, unstaged, untracked sections from `GitStatus` data
- [ ] Scrolling works within each section
- [ ] `onFileSelect` fires when a file is highlighted
- [ ] Live updates when `git:status-changed` fires
- [ ] Empty state displayed for clean repos
- [ ] ink-testing-library tests pass
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 056: AIDF Tasks Panel

**Scope:** Build the `TasksPanel` component that lists AIDF tasks for the active workspace. Shows task status, priority, and title. Selecting a task shows its content in the preview panel.

**Files to create:**

- `packages/ui/src/panels/TasksPanel/TasksPanel.tsx` — panel component
- `packages/ui/src/panels/TasksPanel/TasksPanel.test.tsx` — tests
- `packages/ui/src/panels/TasksPanel/index.ts` — barrel
- `packages/tui/src/hooks/useTasksPanel.ts` — hook wiring ContextLoader tasks to panel
- `packages/tui/src/hooks/useTasksPanel.test.ts` — tests

**Files to modify:**

- `packages/ui/src/panels/index.ts` — export TasksPanel
- `packages/ui/src/index.ts` — export TasksPanel
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- Scrollable list of AIDF tasks from active workspace's `.ai/tasks/`
- Each item shows: status icon (pending/in-progress/done/blocked), task ID, title
- Color coding: done=green, in-progress=yellow, blocked=red, pending=dim
- j/k scrolls, Enter opens task detail (navigates to existing TaskDetail view OR shows in preview panel)
- `onTaskSelect(taskId)` callback for preview panel to show task markdown
- Badge showing `[3/12]` (completed/total) in panel title
- Filter by status with `f` key (cycles: all -> pending -> in-progress -> done)
- Subscribes to `aidf:created`, `aidf:updated`, `aidf:deleted` events for live updates

**Definition of Done:**

- [ ] Renders tasks from ContextLoader output
- [ ] Status icons and colors match task state
- [ ] Filter cycling works
- [ ] `onTaskSelect` fires on highlight change
- [ ] Live updates from EventBus
- [ ] Tests pass with ink-testing-library
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 057: Branches Panel with Worktree Detection

**Scope:** Build the `BranchesPanel` showing local and remote branches, with visual indicators for the current branch, tracking status (ahead/behind), and git worktree associations.

**Files to create:**

- `packages/ui/src/panels/BranchesPanel/BranchesPanel.tsx` — panel component
- `packages/ui/src/panels/BranchesPanel/BranchesPanel.test.tsx` — tests
- `packages/ui/src/panels/BranchesPanel/index.ts` — barrel
- `packages/core/src/git/git-worktree-reader.ts` — worktree detection logic
- `packages/core/src/git/git-worktree-reader.test.ts` — tests
- `packages/tui/src/hooks/useBranchesPanel.ts` — hook wiring branches + worktrees
- `packages/tui/src/hooks/useBranchesPanel.test.ts` — tests

**Files to modify:**

- `packages/core/src/git/index.ts` — export GitWorktreeReader
- `packages/ui/src/panels/index.ts` — export BranchesPanel
- `packages/ui/src/index.ts` — export BranchesPanel
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- Two sections: Local Branches, Remote Branches (collapsible)
- Current branch marked with `*` and accent color
- Ahead/behind indicators: `+3 -1` next to tracking branches
- Worktree branches marked with `[worktree: /path/to/wt]` suffix
- `GitWorktreeReader` class: `listWorktrees()` returns `{ branch: string; path: string; isMain: boolean }[]` using `git worktree list --porcelain`
- j/k scrolls, Enter switches to branch (with confirmation), `n` creates new branch, `d` deletes (with confirmation)
- `onBranchSelect(branch)` callback for showing recent commits of that branch in the commits panel
- Subscribes to `git:branch-created`, `git:branch-switched`, `git:branch-deleted` events

**Definition of Done:**

- [ ] Local and remote branches listed with correct indicators
- [ ] Current branch highlighted
- [ ] Worktree associations displayed
- [ ] `GitWorktreeReader.listWorktrees()` works with `simple-git`
- [ ] Branch operations (switch, create, delete) emit proper events
- [ ] Tests pass (core unit tests + ink-testing-library)
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 058: Commits / Log Panel

**Scope:** Build the `CommitsPanel` showing recent commits for the current branch, similar to LazyGit's commit panel. Each entry shows abbreviated hash, author, relative time, and subject line.

**Files to create:**

- `packages/ui/src/panels/CommitsPanel/CommitsPanel.tsx` — panel component
- `packages/ui/src/panels/CommitsPanel/CommitsPanel.test.tsx` — tests
- `packages/ui/src/panels/CommitsPanel/index.ts` — barrel
- `packages/core/src/git/git-log-reader.ts` — commit log reader
- `packages/core/src/git/git-log-reader.test.ts` — tests
- `packages/tui/src/hooks/useCommitsPanel.ts` — hook wiring git log to panel
- `packages/tui/src/hooks/useCommitsPanel.test.ts` — tests

**Files to modify:**

- `packages/core/src/git/index.ts` — export GitLogReader
- `packages/ui/src/panels/index.ts` — export CommitsPanel
- `packages/ui/src/index.ts` — export CommitsPanel
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- `GitLogReader` class: `getLog(options: { maxCount?: number; branch?: string })` returns `CommitEntry[]` using `simple-git`
- `CommitEntry`: `{ hash: string; shortHash: string; author: string; date: Date; subject: string; refs: string[] }`
- Scrollable list with format: `abc1234 author 2h ago  commit message`
- HEAD commit marked with accent color
- Commits with tags/refs show them as badges
- Enter on a commit shows its diff in the preview panel (full commit diff)
- `c` key opens commit dialog (stage all + message input) — delegates to existing `GitCommitManager`
- Pagination: loads 50 commits initially, loads more on scroll to bottom
- Subscribes to `git:commit` events to prepend new commits

**Definition of Done:**

- [ ] `GitLogReader.getLog()` returns correctly parsed commits
- [ ] Panel renders commit list with hash, author, time, message
- [ ] HEAD commit highlighted
- [ ] Selecting a commit triggers `onCommitSelect(hash)` for preview
- [ ] Pagination works (loads more on scroll)
- [ ] Live updates on `git:commit` event
- [ ] Tests pass (core + ink-testing-library)
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 059: File Tree Browser for `.ai/` (Yazi-inspired)

**Scope:** Build a file tree panel that browses the `.ai/` directory of the active workspace. Inspired by Yazi's file tree with expand/collapse, file type icons, and inline preview of selected files.

**Files to create:**

- `packages/ui/src/panels/FileTreePanel/FileTreePanel.tsx` — tree panel component
- `packages/ui/src/panels/FileTreePanel/FileTreePanel.test.tsx` — tests
- `packages/ui/src/panels/FileTreePanel/index.ts` — barrel
- `packages/ui/src/panels/PreviewPanel/PreviewPanel.tsx` — file content preview component
- `packages/ui/src/panels/PreviewPanel/PreviewPanel.test.tsx` — tests
- `packages/ui/src/panels/PreviewPanel/index.ts` — barrel
- `packages/core/src/aidf/file-tree-builder.ts` — builds tree structure from `.ai/` directory
- `packages/core/src/aidf/file-tree-builder.test.ts` — tests
- `packages/tui/src/hooks/useFileTreePanel.ts` — hook wiring file tree + preview
- `packages/tui/src/hooks/useFileTreePanel.test.ts` — tests

**Files to modify:**

- `packages/core/src/aidf/index.ts` — export FileTreeBuilder
- `packages/ui/src/panels/index.ts` — export FileTreePanel, PreviewPanel
- `packages/ui/src/index.ts` — export FileTreePanel, PreviewPanel
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- `FileTreeBuilder`: scans `.ai/` recursively, returns `TreeNode[]` with `{ name, path, type: 'file' | 'dir', children? }`
- Tree rendering with indent levels and connector lines (`|-- `, `\-- `)
- File type icons: folder, task file, role file, skill file, plan file, template file, markdown
- Expand/collapse directories with Enter or `l`/`h`
- Selecting a file shows its content in `PreviewPanel` (scrollable, with line numbers)
- `PreviewPanel` renders markdown/YAML frontmatter with basic formatting (bold headers, dim frontmatter)
- `y` key copies file path to clipboard
- `e` key emits `onEditFile(path)` for future integration with TaskEditor

**Definition of Done:**

- [ ] File tree renders `.ai/` structure with correct indentation
- [ ] Directories expand/collapse
- [ ] File icons displayed by type
- [ ] `PreviewPanel` shows file content with line numbers
- [ ] Scrolling works in both tree and preview
- [ ] `FileTreeBuilder` handles missing `.ai/` gracefully (empty state)
- [ ] Tests pass (core + ink-testing-library)
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 060: Command Log Panel

**Scope:** Build a `CommandLogPanel` that subscribes to the EventBus and displays a real-time scrollable log of all DitLoop events. Acts as the "activity monitor" at the bottom of the workspace view.

**Files to create:**

- `packages/ui/src/panels/CommandLogPanel/CommandLogPanel.tsx` — panel component
- `packages/ui/src/panels/CommandLogPanel/CommandLogPanel.test.tsx` — tests
- `packages/ui/src/panels/CommandLogPanel/index.ts` — barrel
- `packages/tui/src/hooks/useCommandLog.ts` — hook that subscribes to all EventBus events
- `packages/tui/src/hooks/useCommandLog.test.ts` — tests

**Files to modify:**

- `packages/ui/src/panels/index.ts` — export CommandLogPanel
- `packages/ui/src/index.ts` — export CommandLogPanel
- `packages/tui/src/hooks/index.ts` — export hook

**Deliverables:**

- `useCommandLog(eventBus, maxEntries = 200)` hook: subscribes to `ALL_EVENT_NAMES`, builds a log ring buffer
- Each log entry: `{ timestamp: Date; event: DitLoopEventName; payload: unknown; level: 'info' | 'warn' | 'error' }`
- Level inference: `*:error` and `*:failed` events are `error`, `*:mismatch` and `*:guard-blocked` are `warn`, rest are `info`
- Panel renders entries with: `[HH:MM:SS] [level-icon] event-name  summary`
- Color coding: info=dim, warn=yellow, error=red
- Auto-scrolls to bottom (tail mode), pressing `j`/`k` pauses auto-scroll, `G` resumes
- `c` key clears the log
- Filter by event domain with `f` key (cycles: all -> git -> execution -> aidf -> launcher -> approval)

**Definition of Done:**

- [ ] Subscribes to all EventBus events
- [ ] Renders timestamped log entries with level colors
- [ ] Auto-scroll follows new entries
- [ ] Manual scroll pauses auto-scroll, `G` resumes
- [ ] Filter cycling works
- [ ] Clear with `c`
- [ ] Ring buffer caps at maxEntries
- [ ] Tests pass
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (FocusablePanel), Task 054 (usePanelKeys)

---

### Task 061: Fuzzy Finder Overlay

**Scope:** Build a fuzzy finder overlay (like fzf / Telescope) that provides instant search across workspaces, AIDF tasks, git branches, and `.ai/` files. Activates with `/` or `Ctrl+f`, renders as a centered overlay on top of the panel layout.

**Files to create:**

- `packages/ui/src/overlay/FuzzyFinder/FuzzyFinder.tsx` — overlay component
- `packages/ui/src/overlay/FuzzyFinder/FuzzyFinder.test.tsx` — tests
- `packages/ui/src/overlay/FuzzyFinder/index.ts` — barrel
- `packages/ui/src/overlay/index.ts` — overlay domain barrel
- `packages/tui/src/hooks/useFuzzyFinder.ts` — hook that aggregates search sources
- `packages/tui/src/hooks/useFuzzyFinder.test.ts` — tests

**Files to modify:**

- `packages/ui/src/index.ts` — export overlay components
- `packages/tui/src/hooks/index.ts` — export hook
- `packages/tui/src/app.tsx` — render FuzzyFinder overlay conditionally
- `packages/tui/src/state/keyboard-store.ts` — search mode integration

**Deliverables:**

- `FuzzyFinder` component: centered box overlay (60% width, 70% height) with:
  - Text input at top with search icon
  - Results list below with category badges: `[ws]`, `[task]`, `[branch]`, `[file]`
  - Match highlighting (matched characters in accent color)
  - j/k or arrow keys to navigate results, Enter to select, Esc to close
- Uses `fuse.js` (already a dependency of `@ditloop/ui`) for fuzzy matching
- `useFuzzyFinder` hook:
  - Collects items from: workspaces (app store), tasks (context loader), branches (git), files (file tree builder)
  - Each item: `{ label: string; category: string; meta?: string; action: () => void }`
  - On select, executes the item's action (navigate to workspace, focus task, switch branch, preview file)
- Category prefix filter: typing `t:` filters to tasks only, `b:` to branches, `w:` to workspaces, `f:` to files

**Definition of Done:**

- [ ] Overlay renders centered with input and results
- [ ] Fuzzy search returns ranked results across all categories
- [ ] Category badges displayed
- [ ] Match highlighting works
- [ ] Category prefix filtering works (`t:`, `b:`, `w:`, `f:`)
- [ ] Selection triggers correct action (navigation, focus change, etc.)
- [ ] Esc closes overlay and returns to normal mode
- [ ] Tests pass
- [ ] JSDoc on all public APIs

**Dependencies:** Task 054 (keyboard mode switching), Task 055-059 (search sources from panels)

---

### Task 062: Panel Resizing and Layout Persistence

**Scope:** Enable keyboard-driven panel resizing and persist layout preferences to disk. Users can adjust split ratios with `+`/`-` and save/restore their preferred layout.

**Files to create:**

- `packages/tui/src/state/layout-store.ts` — Zustand store for layout config, resize actions, persistence
- `packages/tui/src/state/layout-store.test.ts` — tests
- `packages/core/src/config/layout-persistence.ts` — save/load layout config to `~/.ditloop/layout.json`
- `packages/core/src/config/layout-persistence.test.ts` — tests

**Files to modify:**

- `packages/core/src/config/index.ts` — export layout persistence
- `packages/tui/src/state/index.ts` — export layout store
- `packages/tui/src/app.tsx` — integrate layout store with PanelContainer
- Layout engine files from Task 053 (if `adjustSplit` needs refinement)

**Deliverables:**

- `useLayoutStore` Zustand store:
  - `layoutConfig: LayoutConfig` — current layout
  - `resizePanel(panelId, axis, delta)` — adjust split containing the focused panel
  - `resetLayout()` — restore `DEFAULT_WORKSPACE_LAYOUT`
  - `saveLayout()` — persist to disk
  - `loadLayout()` — read from disk on startup
- `LayoutPersistence` class:
  - `save(config: LayoutConfig): Promise<void>` — writes to `~/.ditloop/layout.json`
  - `load(): Promise<LayoutConfig | undefined>` — reads from disk, returns undefined if no file
  - Uses Zod schema to validate saved layout (reject corrupted files)
- Keyboard integration:
  - `+` increases focused panel by 5% (horizontal or vertical depending on context)
  - `-` decreases focused panel by 5%
  - `=` resets to default layout
  - Layout auto-saves on resize (debounced 2s)
- Terminal resize handling: on `SIGWINCH` / `stdout.on('resize')`, recalculate layout

**Definition of Done:**

- [ ] `+`/`-` resizes the focused panel's split
- [ ] Resize respects min sizes from LayoutEngine
- [ ] `=` resets to default layout
- [ ] Layout persists to `~/.ditloop/layout.json`
- [ ] Layout loads on startup
- [ ] Corrupted layout file handled gracefully (falls back to default)
- [ ] Terminal resize triggers recalculation
- [ ] Debounced auto-save works
- [ ] Tests pass (core persistence + Zustand store)
- [ ] JSDoc on all public APIs

**Dependencies:** Task 053 (LayoutEngine), Task 054 (keyboard integration)

---

## Workspace View Composition

After all tasks are complete, the `WorkspacePanelView` composes everything into a single view.

**File:** `packages/tui/src/views/WorkspacePanels/WorkspacePanelsView.tsx`

This view:

1. Reads layout config from `useLayoutStore`
2. Passes it to `PanelContainer` with `resolveLayout()`
3. Renders each panel inside a `FocusablePanel`:
   - `git-status` -> `GitStatusPanel`
   - `tasks` -> `TasksPanel`
   - `branches` -> `BranchesPanel`
   - `commits` -> `CommitsPanel`
   - `preview` -> `PreviewPanel` (content from whichever panel's selection feeds it)
   - `command-log` -> `CommandLogPanel`
4. Conditionally renders `FuzzyFinder` overlay on top when search mode is active
5. Renders `ShortcutsBar` at the very bottom with context-sensitive shortcuts

This view is registered as `'workspace-panels'` in the `ViewName` union and is accessible from the home screen or via `Ctrl+p` shortcut.

---

## Dependencies Between Tasks

```
053 Layout Engine ──────┬──> 055 Git Status Panel
                        ├──> 056 Tasks Panel
                        ├──> 057 Branches Panel
                        ├──> 058 Commits Panel
                        ├──> 059 File Tree Panel
                        ├──> 060 Command Log Panel
                        └──> 062 Panel Resizing

054 Keyboard Manager ───┬──> 055 Git Status Panel
                        ├──> 056 Tasks Panel
                        ├──> 057 Branches Panel
                        ├──> 058 Commits Panel
                        ├──> 059 File Tree Panel
                        ├──> 060 Command Log Panel
                        ├──> 061 Fuzzy Finder
                        └──> 062 Panel Resizing

055-060 (all panels) ───┬──> 061 Fuzzy Finder (needs search sources)
                        └──> WorkspacePanelsView (final composition)

062 Panel Resizing ─────┘
```

**Recommended execution order:**

1. **Wave 1** (foundation): 053, 054 — can run in parallel
2. **Wave 2** (panels): 055, 056, 057, 058, 059, 060 — all six can run in parallel after Wave 1
3. **Wave 3** (integration): 061, 062 — can run in parallel after Wave 2
4. **Final**: Compose `WorkspacePanelsView` (part of 062 or a small follow-up)

---

## Testing Strategy

### Unit Tests (Vitest)

| Module | Location | Coverage Focus |
|--------|----------|---------------|
| LayoutEngine | `packages/ui/src/layout/LayoutEngine/layout-engine.test.ts` | Percentage-to-absolute conversion, min-size clamping, resize delta |
| KeyboardStore | `packages/tui/src/state/keyboard-store.test.ts` | Mode transitions, binding registration, focus cycling |
| LayoutStore | `packages/tui/src/state/layout-store.test.ts` | Resize actions, save/load, reset |
| LayoutPersistence | `packages/core/src/config/layout-persistence.test.ts` | File I/O, Zod validation, corrupt file handling |
| GitWorktreeReader | `packages/core/src/git/git-worktree-reader.test.ts` | Parse `git worktree list --porcelain` output |
| GitLogReader | `packages/core/src/git/git-log-reader.test.ts` | Parse git log output, pagination |
| FileTreeBuilder | `packages/core/src/aidf/file-tree-builder.test.ts` | Directory traversal, tree structure, missing dir |
| useCommandLog | `packages/tui/src/hooks/useCommandLog.test.ts` | Event subscription, ring buffer, level inference |
| useFuzzyFinder | `packages/tui/src/hooks/useFuzzyFinder.test.ts` | Item aggregation, fuse.js integration, category filtering |

### Component Tests (ink-testing-library)

| Component | Location | Coverage Focus |
|-----------|----------|---------------|
| PanelContainer | `packages/ui/src/layout/PanelContainer/PanelContainer.test.tsx` | Renders N panels, handles resize |
| FocusablePanel | `packages/ui/src/layout/FocusablePanel/FocusablePanel.test.tsx` | Border color toggle |
| GitStatusPanel | `packages/ui/src/panels/GitStatusPanel/GitStatusPanel.test.tsx` | Section rendering, empty state |
| TasksPanel | `packages/ui/src/panels/TasksPanel/TasksPanel.test.tsx` | Task list, status icons, filter |
| BranchesPanel | `packages/ui/src/panels/BranchesPanel/BranchesPanel.test.tsx` | Branch list, current marker, worktree |
| CommitsPanel | `packages/ui/src/panels/CommitsPanel/CommitsPanel.test.tsx` | Commit list, HEAD marker, pagination |
| FileTreePanel | `packages/ui/src/panels/FileTreePanel/FileTreePanel.test.tsx` | Tree rendering, expand/collapse |
| PreviewPanel | `packages/ui/src/panels/PreviewPanel/PreviewPanel.test.tsx` | File content, line numbers, scrolling |
| CommandLogPanel | `packages/ui/src/panels/CommandLogPanel/CommandLogPanel.test.tsx` | Log entries, auto-scroll, filter |
| FuzzyFinder | `packages/ui/src/overlay/FuzzyFinder/FuzzyFinder.test.tsx` | Search input, results, match highlighting |

### Integration Tests

- **Full workspace view test** in `packages/tui/src/views/WorkspacePanels/WorkspacePanelsView.test.tsx`: render the composed view with mock data, verify all panels appear, keyboard navigation cycles focus, fuzzy finder opens/closes
- **Layout persistence round-trip**: write config -> read config -> verify identical
- **EventBus -> CommandLog**: emit events from core, verify they appear in the log panel

### Playground Stories

Each panel component gets a `.story.tsx` in `packages/playground/src/stories/Panels/`:

- `GitStatusPanel.story.tsx` — with sample dirty repo data
- `TasksPanel.story.tsx` — with mixed task statuses
- `BranchesPanel.story.tsx` — with worktree branches
- `CommitsPanel.story.tsx` — with 20 sample commits
- `FileTreePanel.story.tsx` — with sample `.ai/` tree
- `CommandLogPanel.story.tsx` — with streaming events
- `FuzzyFinder.story.tsx` — with sample items

### Performance Targets

| Metric | Target |
|--------|--------|
| Layout resolution time | < 1ms for 10 panels |
| Panel re-render on focus change | < 16ms (60fps) |
| Fuzzy search latency (1000 items) | < 50ms |
| Command log append | < 1ms per entry |
| Layout persistence write | < 50ms (debounced) |
| Terminal resize -> layout update | < 100ms |

---

## Theme Additions

The existing `ThemeColors` interface needs two new tokens for the panel system:

```typescript
// Add to packages/ui/src/theme/colors.ts
export interface ThemeColors {
  // ... existing tokens ...
  /** Focused panel border color (brighter than default border). */
  borderFocused: string;
  /** Panel header background hint. */
  panelHeader: string;
}
```

Default values: `borderFocused: '#00bcd4'` (matches accent), `panelHeader: '#2c3e50'`.

---

## New Event Types

Add to `packages/core/src/events/events.ts`:

```typescript
export interface TuiEvents {
  'tui:panel-focused': { panelId: string };
  'tui:layout-changed': { layout: string };
  'tui:fuzzy-opened': { query: string };
  'tui:fuzzy-selected': { category: string; label: string };
}
```

Merge `TuiEvents` into `DitLoopEventMap` and add names to `ALL_EVENT_NAMES`.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ink lacks absolute positioning for grid | Medium | High | Use nested `<Box>` with calculated widths/heights; worst case, use `<Static>` + manual ANSI |
| Panel count exceeds small terminal (80x24) | High | Medium | Collapse panels at small sizes, show only 2-3 panels with Tab to cycle hidden ones |
| Keyboard conflicts between panels and modes | Medium | Medium | Strict mode-based dispatch; panel bindings only fire when focused |
| Performance with many EventBus events | Low | Medium | Ring buffer in command log, throttle renders to 10fps max |
| Ink re-render jitter on complex layouts | Medium | Medium | Memoize panel components, use `React.memo` + stable keys |

---

## Success Criteria

- [ ] Workspace panel view renders all 6 panels simultaneously
- [ ] Vim navigation (h/j/k/l, Tab, 1-6) moves focus reliably across all panels
- [ ] Git status, tasks, branches, commits update live from EventBus
- [ ] File tree browses `.ai/` with expand/collapse and preview
- [ ] Command log streams all events in real time
- [ ] Fuzzy finder searches across all entities with category filtering
- [ ] Panel resizing persists across sessions
- [ ] Works on terminal sizes from 100x30 to 240x80
- [ ] All tests pass (target: 80+ new tests across 10 task files)
- [ ] Performance targets met
- [ ] No regressions in existing views (Home, WorkspaceDetail, Launcher, etc.)

---

**Last Updated:** February 16, 2026
**Status:** PLANNED
**Tasks:** 053-062 (10 tasks, 3 waves)
**Estimated effort:** 3-4 weeks
