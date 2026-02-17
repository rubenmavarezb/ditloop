# PLAN: v0.8-TUI — DitLoop TUI: tmux-powered Terminal IDE

## Vision

Transform DitLoop TUI from a panel dashboard into a tmux-powered terminal IDE. DitLoop manages tmux panes programmatically — Ink/React panels surround a real native terminal where the developer runs any command (claude, aider, git, pnpm, vim, etc.). DitLoop is NOT a terminal emulator — it's a smart tmux layout manager with contextual panels.

**Design Reference:** SuperDesign TUI mockups — 5 layout variants (Default, Code Focus, Git Focus, Multi-Terminal, Zen)

**Key Insight:** There is no "chat panel." The center pane IS the real terminal. The user runs `claude`, `aider`, or any AI CLI directly. DitLoop provides context (AIDF, git identity, workspace path) and orchestration (switching projects, showing git status, identity warnings) around the terminal.

---

## Architecture

### How it works

```
┌──────────────────────────────────────────────────────────────┐
│                        tmux session                          │
│                                                              │
│  ┌─────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│  │ Ink pane │  │  Real terminal pane  │  │   Ink pane      │ │
│  │ (sidebar)│  │  (native shell)      │  │   (git status)  │ │
│  │          │  │                      │  │                 │ │
│  │ DitLoop  │  │  $ claude            │  │  DitLoop        │ │
│  │ process  │  │  $ pnpm test         │  │  process        │ │
│  │          │  │  $ vim file.ts       │  │  (or same proc) │ │
│  └─────────┘  └──────────────────────┘  └─────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Status bar (Ink)                                         ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

1. `ditloop` starts, creates/attaches a tmux session
2. DitLoop creates panes: sidebar (left), terminal (center), git (right)
3. Left + right panes run DitLoop Ink processes (panels mode)
4. Center pane is a raw shell — user types whatever they want
5. When user switches workspace, DitLoop sends tmux commands to:
   - `cd` the center terminal to the new workspace path
   - Update git identity (`git config user.email`)
   - Refresh side panels (git status, AIDF context)
6. DitLoop watches filesystem for git changes and updates panels live

### Why tmux

- Real terminal in center pane — vim, htop, claude, everything works natively
- Side-by-side: panels + terminal visible simultaneously
- Battle-tested multiplexer — every developer has it
- Programmatic API via `tmux` commands from Node.js
- Pane resizing, splitting, and layout management built-in
- Fallback: fullscreen toggle for users without tmux

### Package Changes

- `@ditloop/tui` — New tmux session manager, panel-mode rendering, layout presets
- `@ditloop/ui` — Enhanced panels (commit input, AIDF context card, status bar)
- `@ditloop/core` — No changes (already has all needed logic)

---

## Task Breakdown

### Phase 1: tmux Foundation (Tasks T01–T03)

| Task | Name | Priority |
|------|------|----------|
| T01 | tmux session manager | critical |
| T02 | Panel-mode Ink rendering | critical |
| T03 | Workspace context switching via tmux | high |

### Phase 2: Enhanced Panels (Tasks T04–T07)

| Task | Name | Priority |
|------|------|----------|
| T04 | Enhanced sidebar with AIDF context | high |
| T05 | Source Control panel with commit input | high |
| T06 | Status bar component | medium |
| T07 | Identity mismatch warnings | high |

### Phase 3: Layout Presets (Tasks T08–T09)

| Task | Name | Priority |
|------|------|----------|
| T08 | 5 tmux layout presets | medium |
| T09 | Multi-terminal layout | medium |

### Phase 4: Polish (Tasks T10–T11)

| Task | Name | Priority |
|------|------|----------|
| T10 | AI CLI launcher with context injection | medium |
| T11 | Fullscreen toggle fallback (no-tmux mode) | low |

---

## Task Details

### T01: tmux session manager

**Goal:** Node.js module that creates, manages, and controls tmux sessions/panes programmatically.

**Scope:** packages/tui/src/tmux/

**Requirements:**
1. Detect if tmux is installed and available
2. Create a named tmux session (`ditloop-{workspace}`)
3. Create pane layout: left (25%) | center (50%) | right (25%)
4. Send commands to specific panes (`tmux send-keys`)
5. Resize panes programmatically
6. Kill panes/session on exit
7. Detect if already inside a tmux session (attach vs create)
8. Handle tmux version differences (3.x+)

**API sketch:**
```typescript
class TmuxManager {
  async createSession(name: string): Promise<void>
  async createPane(position: 'left'|'right'|'bottom', size: number): Promise<string>
  async sendKeys(paneId: string, keys: string): Promise<void>
  async resizePane(paneId: string, size: number): Promise<void>
  async selectPane(paneId: string): Promise<void>
  async killSession(): Promise<void>
  isInsideTmux(): boolean
  isTmuxAvailable(): boolean
}
```

**Definition of Done:**
- [ ] TmuxManager class with all methods
- [ ] Session lifecycle: create, attach, kill
- [ ] Pane management: create, resize, send-keys, select
- [ ] Error handling for missing tmux
- [ ] Unit tests with tmux mocking

---

### T02: Panel-mode Ink rendering

**Goal:** Run DitLoop Ink app in "panel mode" — renders only specific panels (sidebar OR git status) designed to fit in a narrow tmux pane.

**Scope:** packages/tui/src/

**Requirements:**
1. New CLI flag: `ditloop --panel <sidebar|git|status>`
2. Sidebar panel mode: renders workspace list + AIDF context only
3. Git panel mode: renders Source Control panel only
4. Status panel mode: renders status bar only (1 row)
5. Panels communicate via IPC or shared file (workspace changes, git updates)
6. Panels auto-resize to fit tmux pane dimensions (use `process.stdout.columns/rows`)
7. Panels react to SIGWINCH for resize events

**Definition of Done:**
- [ ] `--panel` CLI flag works
- [ ] Sidebar renders correctly in 30-col pane
- [ ] Git panel renders correctly in 30-col pane
- [ ] Panels update when workspace changes
- [ ] Resize handling works

---

### T03: Workspace context switching via tmux

**Goal:** When user selects a different workspace in the sidebar, DitLoop updates the center terminal pane and all side panels.

**Scope:** packages/tui/src/tmux/, packages/core/

**Requirements:**
1. Sidebar selection (j/k + Enter) triggers workspace switch
2. DitLoop sends to center terminal: `cd /path/to/workspace` + Enter
3. DitLoop switches git identity: `git config user.email` (via core ProfileManager)
4. Right panel refreshes: new git status, branches, commits
5. Sidebar updates: active indicator moves, AIDF context reloads
6. Status bar updates: branch, identity, AIDF status
7. IPC between sidebar and git panel processes (or single process managing both)

**Definition of Done:**
- [ ] Workspace switch updates center terminal cd
- [ ] Git identity switches automatically
- [ ] Side panels refresh with new workspace data
- [ ] Status bar reflects current workspace
- [ ] No flicker during switch

---

### T04: Enhanced sidebar with AIDF context

**Goal:** Upgrade sidebar to show workspace list with git provider badges, AIDF context section, and quick actions.

**Scope:** packages/ui/src/components/

**Requirements:**
1. Workspace entries show: number, name, branch, identity email, provider badge (gh/bb/az)
2. Active workspace highlighted with `>` and green color
3. Dirty branch indicator (`*` after branch name)
4. AIDF context section below workspaces: loaded role, task, plan
5. Quick actions: [n] New, [c] Clone, [s] Switch, [l] Launch AI
6. [E] toggle to Explorer mode (file tree of active workspace)
7. Scrollable workspace list for 10+ projects

**Definition of Done:**
- [ ] Provider badges render (gh/bb/az)
- [ ] AIDF context section with loaded files
- [ ] Quick actions functional
- [ ] Explorer toggle works
- [ ] Scroll for long workspace lists

---

### T05: Source Control panel with commit input

**Goal:** Enhance GitStatusPanel with commit message input, staging actions, stash support, and recent commits.

**Scope:** packages/ui/src/panels/

**Requirements:**
1. Commit message text input at top (multi-line, Ctrl+Enter to commit)
2. Current identity display with mismatch warning
3. Staged/unstaged/untracked sections with [+]/[-] actions
4. Stage all / unstage all shortcuts
5. Discard changes with confirmation
6. Recent commits section (last 5, collapsible)
7. Stash section: list, create [S], pop [P]
8. Click file to show diff in center terminal (`git diff <file>`)

**Definition of Done:**
- [ ] Commit input works with Ctrl+Enter
- [ ] Stage/unstage from keyboard
- [ ] Stash operations work
- [ ] Recent commits visible
- [ ] Identity display with warning

---

### T06: Status bar component

**Goal:** Single-row status bar showing mode, branch, identity, AIDF, errors, and file info.

**Scope:** packages/ui/src/primitives/StatusBar/

**Requirements:**
1. Mode indicator: NORMAL (green), INSERT (blue), SEARCH (yellow)
2. Branch with dirty indicator: `⎇ main*`
3. Identity: `personal (rubennmavarezb@gmail.com)`
4. Error/warning count: `0E 2W`
5. AIDF status: `✦ AIDF: 2 tasks`
6. Active workspace: `ditloop/core`
7. Memory: `MEM: 450MB`
8. All segments space-separated with `│` dividers
9. Responsive: hide less important segments on narrow terminals

**Definition of Done:**
- [ ] StatusBar component with all segments
- [ ] Updates in real-time
- [ ] Responsive to terminal width
- [ ] Mode reflects keyboard state

---

### T07: Identity mismatch warnings

**Goal:** Warn when git identity doesn't match workspace's configured profile.

**Scope:** packages/tui/src/, packages/ui/src/

**Requirements:**
1. On workspace switch: compare active identity with workspace profile
2. Sidebar: orange dot on mismatched workspace
3. Source Control: warning banner above commit input
4. Status bar: orange warning segment
5. Quick fix: [!] Switch to correct identity
6. Auto-switch option: always switch identity on workspace change

**Definition of Done:**
- [ ] Mismatch detected on workspace switch
- [ ] Warnings in 3 locations
- [ ] Quick fix action works
- [ ] Auto-switch setting

---

### T08: 5 tmux layout presets

**Goal:** Implement 5 tmux layouts switchable with Ctrl+1 through Ctrl+5.

**Scope:** packages/tui/src/tmux/

**Requirements:**
1. **Default**: sidebar (25%) | terminal (50%) | git (25%)
2. **Code Focus**: collapsed sidebar (thin strip with dots) | terminal (80%) | collapsed git (thin strip)
3. **Git Focus**: file tree (20%) | diff viewer terminal (50%) | expanded git (30%)
4. **Multi-Terminal**: sidebar (20%) | 2 terminals split vertically (50%) | stacked git (30%)
5. **Zen**: terminal only (100%), status bar hidden, one key to toggle back
6. Ctrl+1-5 switches layouts via tmux resize/split commands
7. Current layout shown in status bar
8. Layout persisted per session

**Definition of Done:**
- [ ] All 5 layouts work via tmux commands
- [ ] Keyboard shortcuts switch layouts
- [ ] Pane sizes correct per layout
- [ ] Layout indicator in status bar

---

### T09: Multi-terminal layout

**Goal:** Support running terminals for 2+ workspaces simultaneously side-by-side.

**Scope:** packages/tui/src/tmux/

**Requirements:**
1. Split center area into 2+ terminal panes
2. Each terminal pane cd'd to a different workspace
3. Git panel shows stacked status for all active terminals
4. Sidebar indicates which workspaces have active terminals
5. Focus cycling between terminal panes (Ctrl+Left/Right)
6. Add/remove terminal splits dynamically

**Definition of Done:**
- [ ] 2 terminals side-by-side work
- [ ] Each in different workspace
- [ ] Git panel shows both statuses
- [ ] Focus cycling works

---

### T10: AI CLI launcher with context injection

**Goal:** `ditloop launch` command that starts an AI CLI in the center terminal with AIDF context auto-injected.

**Scope:** packages/tui/src/commands/, packages/core/src/launcher/

**Requirements:**
1. `[l]` in sidebar opens launcher overlay: select AI CLI + AIDF task
2. DitLoop builds context string from AIDF (roles, tasks, plans)
3. Sends command to center terminal: `claude --context <file>` or generates temp CLAUDE.md
4. For Aider: generates `.aider.conf.yml` with context
5. For generic CLIs: copies context to clipboard with notification
6. Workspace path, git identity, and AIDF context all pre-configured

**Definition of Done:**
- [ ] Launcher overlay works
- [ ] Claude Code launched with AIDF context
- [ ] At least 2 AI CLIs supported
- [ ] Context injection verified

---

### T11: Fullscreen toggle fallback (no-tmux mode)

**Goal:** For users without tmux, DitLoop offers fullscreen toggle mode (like LazyGit).

**Scope:** packages/tui/src/

**Requirements:**
1. Detect tmux not available on startup
2. Show DitLoop panels normally (existing Ink behavior)
3. [Enter] on workspace: unmount Ink, spawn shell with `stdio: 'inherit'`
4. Shell gets workspace path, git identity, env vars
5. On shell exit (Ctrl+D or `exit`): re-render Ink panels
6. Message: "tmux not found — running in toggle mode. Install tmux for side-by-side."

**Definition of Done:**
- [ ] Detects missing tmux
- [ ] Toggle mode works: Ink → shell → Ink
- [ ] Shell inherits workspace context
- [ ] Graceful messaging

---

## Dependencies

```
Phase 1 (tmux Foundation)
  T01 (tmux manager) → T02 (panel mode) → T03 (context switching)

Phase 2 (Enhanced Panels) — all depend on T02
  T04 (sidebar)          ← independent
  T05 (source control)   ← independent
  T06 (status bar)       ← independent
  T07 (identity warnings) ← depends on T03

Phase 3 (Layouts) — depends on T01
  T08 (layout presets)   ← depends on T01
  T09 (multi-terminal)   ← depends on T08

Phase 4 (Polish)
  T10 (AI launcher)      ← depends on T03
  T11 (fallback)         ← independent, can start anytime
```

**Critical path:** T01 → T02 → T03 → T04/T05/T06 → T08

**Parallelizable:** After T02, tasks T04/T05/T06 can run concurrently. T11 is independent.

---

## Risks

1. **tmux version differences** — API varies between tmux 2.x and 3.x. Mitigation: target 3.0+ only, check version on startup.
2. **IPC between Ink processes** — Sidebar and git panel need to communicate workspace changes. Mitigation: use Unix domain sockets or shared temp files.
3. **Pane resize coordination** — When user resizes tmux panes manually, Ink panels need to adapt. Mitigation: handle SIGWINCH, use `process.stdout.columns`.
4. **Single vs multi-process** — Running 2-3 Ink processes (sidebar, git, status) adds complexity. Alternative: single DitLoop process that renders across multiple tmux panes via cursor positioning.

---

## Success Criteria

- [ ] `ditloop` starts a tmux session with 3-pane layout
- [ ] Center pane is a real terminal where any command works
- [ ] Switching workspaces updates terminal cd + git identity + panels
- [ ] 5 layout presets switchable with Ctrl+1-5
- [ ] Git staging, commit from Source Control panel
- [ ] AIDF context visible and auto-loaded per workspace
- [ ] Identity mismatch warnings
- [ ] AI CLI launcher injects AIDF context
- [ ] Fallback mode works without tmux
- [ ] All existing 654+ tests still passing

---

## Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: tmux Foundation | T01–T03 | 1–2 weeks |
| Phase 2: Enhanced Panels | T04–T07 | 1–2 weeks |
| Phase 3: Layout Presets | T08–T09 | 1 week |
| Phase 4: Polish | T10–T11 | 1 week |
| **Total** | **T01–T11** | **~4–5 weeks** |

---

**Plan created:** February 16, 2026
**Version:** v0.8-TUI
**Status:** PLANNED
**Depends on:** v0.6 (TUI Overhaul) ✅ + v0.7 (Desktop) ✅
**Branch:** `feat/v08-tui`
**Tasks:** T01–T11 (11 tasks across 4 phases)
**Parallel with:** v0.8-IDE (Desktop)
