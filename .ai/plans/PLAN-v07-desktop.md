# PLAN: v0.7 Desktop App (Tauri) — REVISED

## ⚠️ Architecture Correction

### What was built (wrong)

The first implementation (branch `feat/v07-desktop`, worktree at `/Users/ruben/Documentos/ditloop-v07-desktop`) treated the desktop app as a **remote client** — identical to the mobile PWA — that connects to a DitLoop server via REST API + WebSocket to function.

```
WRONG architecture:
@ditloop/core → @ditloop/server → HTTP/WS API
                                      ↓
                              @ditloop/web-ui (extracted from mobile)
                                ↓         ↓
                           mobile      desktop (Tauri shell around web-ui)
```

This is wrong because the desktop app **runs on the developer's machine**. It has direct access to the filesystem, git, config, `.ai/` folders, and everything else. It does NOT need a server to mediate access to local resources. That's what mobile needs (your phone can't access your PC filesystem), but not desktop.

### What was implemented

The worktree contains 13 commits with ~9,700 lines across 115 files:

1. **`@ditloop/web-ui`** — Extracted API client, WebSocket, Zustand stores, views, and components from mobile. Does NOT depend on `@ditloop/core`. Types (Workspace, Execution, Approval, GitStatus) are redefined ad hoc instead of importing from core.
2. **Desktop shell** — Sidebar, TitleBar, routing, `DesktopConnectionSetup` with server auto-detect.
3. **System tray** (Rust) — Context menu, dynamic counters. BUT the `useTray` hook is dead code (never called in App.tsx).
4. **Notifications** (Rust) — OS notification support. BUT `useNotifications` hook is dead code.
5. **File browser** — `FileBrowser` + `FileTree` components with Rust filesystem commands.
6. **Auto-connect** — Scans local ports for a DitLoop server. Requires server to do anything.
7. **Git/AI CLI** (Rust) — Git status/log/diff/branch/commit/checkout + AI tool detection. Uses `std::process::Command` (sync/blocking) instead of `tokio` async.
8. **Command palette** — Ctrl+K fuzzy search. Working implementation.
9. **Deep links** — `ditloop://` protocol. Hooks exist but never wired into App.tsx. Token exposed in URL params.
10. **Auto-updater** — CI workflow + hooks. `pubkey` is empty. `UpdateBanner` never rendered.
11. **Security issues** — CSP disabled (`null`), `shell:allow-execute` overly broad, command injection vulnerability in `launch_ai_cli` on Windows.

### What it should be

The desktop app is simply **DitLoop with a GUI instead of a TUI**. It consumes `@ditloop/core` directly, the same way `@ditloop/tui` does. No server required.

```
CORRECT architecture:
@ditloop/core              ← business logic (workspaces, profiles, git, AIDF, events)
    ↓                ↓
@ditloop/tui         @ditloop/desktop
(Ink + terminal)     (Tauri + React)
    ↓                    ↓
@ditloop/ui          @ditloop/web-ui
(Ink components)     (React DOM components)
```

Both TUI and desktop are **local-first** apps. They read `~/.ditloop/config.yml`, resolve workspaces, manage profiles, and interact with git — all via `@ditloop/core`. The server (`@ditloop/server`) is optional and only needed for remote access from mobile.

### What can be salvaged

Not everything needs to be thrown away. These pieces are valid and can be kept:

- **Tauri scaffold** (`src-tauri/`) — project structure, Cargo.toml, icons, capabilities (with fixes)
- **Desktop shell** — Sidebar, TitleBar, DesktopShell layout (re-wired to core instead of server)
- **Rust commands** — git.rs, filesystem.rs, workspace.rs, ai_cli.rs (fix to async + fix security)
- **Command palette** — good implementation, keep as-is
- **File browser** — FileBrowser + FileTree components (already local, no server dependency)
- **System tray** (Rust) — tray.rs works, just needs to be wired
- **Notifications** (Rust) — notifications.rs works, just needs to be wired
- **CI workflow** — desktop-release.yml structure is valid

### What needs to be removed/replaced

- **`@ditloop/web-ui` API client + WebSocket** — Desktop doesn't call HTTP API. Remove `client.ts`, `websocket.ts`, `useApiFetch.ts`, `useConnection.ts`, connection store.
- **`DesktopConnectionSetup`** — No server connection needed. Replace with a first-run config wizard (or detect `~/.ditloop/config.yml` automatically).
- **`useAutoConnect`** — Scans for servers. Irrelevant for desktop.
- **All server-dependent views** — Approvals, Chat, Executions from web-ui assume HTTP API. Desktop needs its own views that read from core.
- **Deep link `connect?token=`** — Security issue + wrong architecture. Deep links should open workspaces/files, not configure server connections.

---

## Overview (Revised)

Native desktop application using Tauri 2.x. The desktop GUI equivalent of `ditloop` (the TUI). Consumes `@ditloop/core` directly for workspace management, git operations, profile switching, and AIDF integration. Runs locally with no server dependency.

The desktop app provides a persistent, always-on GUI with system-level integrations: tray icon, OS notifications, filesystem browsing, command palette, multi-window — all powered by the same `@ditloop/core` that drives the TUI.

### Goals

- **Local-first**: works without any server, same as the TUI
- Consume `@ditloop/core` directly for workspaces, profiles, git, AIDF, config
- System tray with workspace status and quick actions
- Native OS notifications for git events, task completion
- Filesystem browser with `.ai/` folder awareness
- Rust-backed git/AI CLI execution for performance
- Command palette (Cmd+K / Ctrl+K) for keyboard-driven workflows
- Multi-window support (one workspace per window)
- Deep linking via `ditloop://` protocol
- Auto-updates via Tauri's built-in updater
- Cross-platform: macOS, Windows, Linux

### Non-Goals

- Server dependency for local operations
- Replacing the TUI — desktop complements it
- Full IDE/editor capabilities
- Sharing views/stores with mobile — mobile is a remote client, desktop is local

### Architecture

```
packages/
├── core/                    # Business logic (existing)
├── ui/                      # Ink terminal components (existing)
├── tui/                     # Terminal app (existing)
├── web-ui/                  # Shared React DOM components (NEW — visual only)
│   ├── src/
│   │   ├── components/      # WorkspaceCard, DiffViewer, ExecutionCard, etc.
│   │   ├── theme/           # Tailwind preset, design tokens
│   │   └── index.ts
│   └── package.json         # deps: react, react-dom, tailwindcss
├── desktop/                 # Tauri desktop app (NEW)
│   ├── src/                 # React frontend
│   │   ├── App.tsx
│   │   ├── views/           # Desktop views (consume core via hooks)
│   │   │   ├── Home/
│   │   │   ├── WorkspaceDetail/
│   │   │   ├── FileBrowser/
│   │   │   ├── TaskEditor/
│   │   │   └── Settings/
│   │   ├── hooks/           # Bridge hooks: core → React state
│   │   │   ├── useWorkspaces.ts    # wraps WorkspaceManager
│   │   │   ├── useProfiles.ts      # wraps ProfileManager
│   │   │   ├── useGitStatus.ts     # wraps GitStatusReader (or Rust cmd)
│   │   │   ├── useAidfContext.ts   # wraps ContextLoader
│   │   │   ├── useTray.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useShortcuts.ts
│   │   ├── components/
│   │   │   ├── Layout/      # DesktopShell, Sidebar, TitleBar
│   │   │   ├── CommandPalette/
│   │   │   └── FileBrowser/
│   │   └── store/
│   │       └── desktop.ts   # Desktop-only state (window, tray)
│   ├── src-tauri/           # Rust backend
│   │   ├── src/
│   │   │   ├── commands/    # git.rs, filesystem.rs, ai_cli.rs
│   │   │   ├── tray.rs
│   │   │   ├── notifications.rs
│   │   │   └── deep_link.rs
│   │   └── tauri.conf.json
│   └── package.json         # deps: @ditloop/core, @ditloop/web-ui, @tauri-apps/api
├── mobile/                  # PWA (existing — keeps server dependency)
└── server/                  # REST/WS API (existing — only for mobile)
```

Key difference: `@ditloop/desktop` depends on `@ditloop/core` and uses it **directly**. The Rust commands supplement core for performance-critical operations (git parsing, filesystem scanning) but core remains the source of truth for types and business logic.

### `@ditloop/web-ui` — Corrected Scope

`@ditloop/web-ui` should be a **visual component library only** — the React DOM equivalent of `@ditloop/ui` (which is Ink components). It should NOT contain:
- ❌ API client / WebSocket
- ❌ Connection stores
- ❌ Business logic views (Approvals, Executions)

It SHOULD contain:
- ✅ Presentational components (WorkspaceCard, DiffViewer, StatusBadge, etc.)
- ✅ Tailwind preset / design tokens
- ✅ Shared layout primitives (Panel, Divider, etc.)

Business logic views live in each app (`desktop/src/views/`, `mobile/src/views/`) because they have different data sources (core vs HTTP API).

---

## Task Breakdown (Revised)

### Task 063-R: Fix Architecture — Rewire Desktop to Core

**Scope:** Refactor the existing desktop implementation to consume `@ditloop/core` instead of the server HTTP API. Strip server-dependent code. Keep salvageable pieces.

**Worktree:** `/Users/ruben/Documentos/ditloop-v07-desktop`
**Branch:** `feat/v07-desktop`

**Deliverables:**

1. **Add `@ditloop/core` as dependency** to `packages/desktop/package.json`

2. **Create bridge hooks** that wrap core classes for React:
   - `src/hooks/useWorkspaces.ts` — instantiates `WorkspaceManager`, calls `.list()`, returns `ResolvedWorkspace[]`
   - `src/hooks/useProfiles.ts` — instantiates `ProfileManager`, provides `.switchTo()`, `.getCurrent()`
   - `src/hooks/useGitStatus.ts` — wraps core's `GitStatusReader` OR invokes Rust `git_status` command
   - `src/hooks/useConfig.ts` — loads config via `loadConfig()` from core

3. **Remove server-dependent code:**
   - Delete `DesktopConnectionSetup.tsx` — replaced by auto-detecting `~/.ditloop/config.yml`
   - Delete `useAutoConnect.ts` — no server to connect to
   - Remove API client / WebSocket imports from desktop views
   - Remove connection store usage from desktop

4. **Slim `@ditloop/web-ui`** to visual components only:
   - Keep: components (WorkspaceCard, DiffViewer, ExecutionCard, ConfirmDialog, MessageBubble), tailwind preset, theme
   - Remove from web-ui: `api/`, `store/connection.ts`, `hooks/useApiFetch.ts`, `hooks/useConnection.ts`
   - Move server-dependent views (Approvals, Chat, Executions, Settings) back to mobile or keep in web-ui but clearly mark as "requires server"

5. **Rewire desktop App.tsx:**
   - On startup: `loadConfig()` from core → init workspaces, profiles
   - Home view shows workspace list from `WorkspaceManager.list()`
   - WorkspaceDetail shows git status from Rust commands + tasks from AIDF detector
   - No connection setup screen — if config missing, show "Run `ditloop init` first"

6. **Fix Rust commands:**
   - Convert `std::process::Command` → `tokio::process::Command` (async)
   - Fix command injection in `ai_cli.rs` Windows path (proper escaping)
   - Add `#[cfg(test)]` modules with basic tests

7. **Fix security:**
   - Set proper CSP in `tauri.conf.json` (not `null`)
   - Scope `shell:allow-execute` → use specific scoped commands instead
   - Remove token from deep link URLs

**Definition of Done:**
- Desktop launches and shows workspaces from `~/.ditloop/config.yml` — no server needed
- `@ditloop/core` types used throughout (no ad hoc type redefinitions)
- All Rust commands are async
- Security issues resolved (CSP, shell scope, deep link tokens)
- `pnpm build` passes for all packages

---

### Task 064-R: Wire Dead Code — Tray, Notifications, Deep Links, Updater

**Scope:** Connect the existing implementations that were built but never wired into App.tsx.

**Depends on:** 063-R

**Deliverables:**

1. **Wire `useTray`** in App.tsx — send workspace count, active status to tray
2. **Wire `useNotifications`** — trigger OS notifications on git events (via core EventBus), task completion
3. **Wire `useDeepLink`** — listen for `ditloop://workspace/{name}` and navigate
4. **Render `UpdateBanner`** in DesktopShell — show when update available
5. **Wire `useUpdater`** — check for updates on launch (pubkey must be configured or updater disabled until keys are generated)
6. **Add capabilities for secondary windows** — `"windows": ["main", "workspace-*"]`

**Definition of Done:**
- Tray icon shows with functioning context menu
- OS notifications fire for relevant events
- Deep links open workspaces
- Update banner renders when update available (or updater gracefully disabled if no pubkey)
- All features visually testable

---

### Task 065-R: Desktop Views — Home, Workspace Detail, Settings

**Scope:** Build desktop-specific views that consume `@ditloop/core` directly instead of HTTP API.

**Depends on:** 063-R

**Deliverables:**

1. **Home view** (`src/views/Home/Home.tsx`):
   - Workspace list from `WorkspaceManager.list()` via `useWorkspaces` hook
   - Current profile display from `ProfileManager.getCurrent()`
   - "Open" navigates to WorkspaceDetail
   - "Open in New Window" creates a Tauri window for the workspace

2. **WorkspaceDetail view** (`src/views/WorkspaceDetail/WorkspaceDetail.tsx`):
   - Git status panel (branch, modified, staged, untracked) — from Rust `git_status`
   - Recent commits — from Rust `git_log`
   - AIDF tasks list — from core `AidfDetector` + `ContextLoader`
   - File tree of `.ai/` folder
   - Actions: "Launch AI CLI", "Open in Terminal", "Open in Editor"

3. **Settings view** (`src/views/Settings/Settings.tsx`):
   - Profile switcher (list profiles from config, switch via `ProfileManager`)
   - Config file path display
   - Notification preferences (OS notification toggle, quiet hours)
   - Theme toggle (light/dark)
   - About section (version, links)

4. **First-run experience:**
   - If `~/.ditloop/config.yml` not found, show message: "No config found. Run `ditloop init` in your terminal to set up DitLoop."
   - If config found but no workspaces, show "No workspaces configured" with link to docs

**Definition of Done:**
- Home shows real workspaces from config
- WorkspaceDetail shows real git status and AIDF data
- Settings allows profile switching
- First-run handles missing config gracefully

---

### Task 066-R: Fix File Browser Integration

**Scope:** The file browser components exist but need to be properly integrated with the workspace navigation flow.

**Depends on:** 065-R

**Deliverables:**

1. **Integrate FileBrowser** into WorkspaceDetail — clicking a workspace shows its file tree
2. **`.ai/` folder highlighting** — visually distinguish `.ai/` directories with DitLoop branding
3. **File preview** — clicking a file shows content with syntax detection (from Rust `read_file`)
4. **Context menu** — right-click: "Open in Terminal", "Open in Editor", "Copy Path"
5. **Breadcrumb navigation** — shows current path, clickable segments

**Definition of Done:**
- File browser works within workspace context
- `.ai/` folders visually highlighted
- File preview renders text content
- Context menu actions work on macOS (Linux/Windows tested separately)

---

### Task 067-R: Command Palette Integration with Core

**Scope:** The command palette UI exists and works. Wire it to real commands from core.

**Depends on:** 065-R

**Deliverables:**

1. **Populate commands from core:**
   - Workspace commands: "Open {workspace name}" for each workspace in config
   - Profile commands: "Switch to {profile name}" for each profile
   - Git commands: "Git status", "Git commit", "Git checkout {branch}" (from Rust git commands)
   - AI commands: "Launch {tool name}" for each detected AI CLI
   - Navigation: "Go to Home", "Go to Settings", etc.
   - System: "Toggle Sidebar", "Toggle Full Screen", "Quit"

2. **Dynamic command refresh** — workspace/profile commands update when config changes

3. **Command execution** — each command executes its action (navigate, invoke Rust command, etc.)

**Definition of Done:**
- Ctrl+K shows real workspace and profile commands from config
- Git commands work for the active workspace
- AI CLI launch commands appear for detected tools
- All commands execute their actions

---

### Task 068-R: Tests

**Scope:** Add tests for desktop-specific code and Rust commands.

**Depends on:** 063-R through 067-R

**Deliverables:**

1. **Rust tests** (`#[cfg(test)]` in each command file):
   - `git.rs` — parse porcelain v2 output, handle empty repos, handle detached HEAD
   - `filesystem.rs` — list directory, handle permissions, hidden files
   - `workspace.rs` — detect workspaces, handle missing `.ai/` folder
   - `ai_cli.rs` — detect tools, validate path escaping

2. **Frontend tests** (Vitest):
   - Bridge hooks — mock `@ditloop/core` classes, verify state mapping
   - CommandPalette — fuzzy search, keyboard navigation
   - Desktop store — state management

3. **Build verification:**
   - `cargo test` passes
   - `pnpm --filter @ditloop/desktop test` passes (frontend)
   - `pnpm build` passes (all packages including web-ui and mobile)
   - `cargo check` passes (Rust typecheck)

**Definition of Done:**
- `cargo test` in `src-tauri/` passes with meaningful test coverage
- Vitest tests pass for desktop hooks and components
- Full monorepo build succeeds

---

### Task 069-R: Auto-Updates + Distribution

**Scope:** Finalize the auto-updater and distribution pipeline. Most of this was already scaffolded.

**Depends on:** 068-R

**Deliverables:**

1. **Generate updater keypair** — `tauri signer generate` for ED25519 keys
2. **Configure pubkey** in `tauri.conf.json` (or disable updater cleanly if keys not ready)
3. **Wire UpdateBanner properly** — show download progress, restart button
4. **Verify CI workflow** — `desktop-release.yml` builds for macOS/Windows/Linux
5. **App icons** — verify icons render on all platforms
6. **Bundle identifiers** — `com.ditloop.desktop` configured correctly

**Definition of Done:**
- Auto-updater either works with real keys or is cleanly disabled
- CI workflow runs (even if artifacts aren't signed)
- App icons display correctly
- `tauri build` produces installable artifacts

---

## Task Dependencies (Revised)

```
063-R (Fix Architecture — rewire to core)
 ├─► 064-R (Wire dead code — tray, notifications, deep links, updater)
 ├─► 065-R (Desktop views — Home, WorkspaceDetail, Settings)
 │    ├─► 066-R (File browser integration)
 │    └─► 067-R (Command palette integration with core)
 └─► 068-R (Tests)
      └─► 069-R (Auto-updates + distribution)
```

**Critical path:** 063-R → 065-R → 067-R → 068-R → 069-R

**Parallelizable after 063-R:** 064-R and 065-R can run concurrently.

---

## Comparison: Original Plan vs Revised

| Aspect | Original (wrong) | Revised (correct) |
|--------|-------------------|-------------------|
| Data source | HTTP API + WebSocket to server | `@ditloop/core` directly |
| Server dependency | Required for all features | Not needed (same as TUI) |
| Types | Redefined ad hoc in web-ui + Rust | Import from `@ditloop/core` |
| `@ditloop/web-ui` | API client + stores + views + components | Visual components only |
| Startup flow | ConnectionSetup → server handshake | loadConfig() → show workspaces |
| Workspaces | Fetched from server API | `WorkspaceManager.list()` from core |
| Git status | Server API call | Rust command (local) or core reader |
| Profiles | Not integrated | `ProfileManager` from core |
| Architecture analog | Mobile clone in a native window | TUI equivalent with GUI |
| Tasks (original) | 063-072 (10 tasks) | 063R-069R (7 tasks, focused) |

---

## What to Tell the Agent

When executing this revised plan, the agent working in the worktree `/Users/ruben/Documentos/ditloop-v07-desktop` should:

1. **Start with 063-R** — this is the most impactful task. It changes the fundamental architecture.
2. **Don't delete everything** — many pieces (Rust commands, Tauri config, shell components, command palette, file browser) are salvageable.
3. **The key change** is replacing all server/API code with direct `@ditloop/core` usage.
4. **Types must come from core** — no more ad hoc interfaces for Workspace, GitStatus, etc.
5. **Rust commands are supplementary** — they provide performance for git/filesystem, but core is the authority for types and business logic.

---

**Last Updated:** February 16, 2026
**Status:** IN PROGRESS — Task 063-R COMPLETED
**Original Tasks:** 063-072 (in worktree, needs fixing)
**Revised Tasks:** 063R-069R
**Task 063-R:** DONE — Architecture rewired to local-first (commit d296d23)
**Branch:** `feat/v07-desktop`
**Worktree:** `/Users/ruben/Documentos/ditloop-v07-desktop`
**Parallel with:** v0.6 (TUI Overhaul)
