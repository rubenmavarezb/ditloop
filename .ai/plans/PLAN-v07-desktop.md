# PLAN: v0.7 Desktop App (Tauri)

## Overview

Native desktop application using Tauri 2.x that reuses the React + Tailwind UI from `@ditloop/mobile`, packaged as a lightweight native app (~5MB) with system-level integrations. Runs in PARALLEL with v0.6 (TUI Overhaul).

The desktop app gives DitLoop a persistent, always-on presence on the developer's machine: system tray status, OS notifications, filesystem browsing, and direct git/AI CLI execution via Rust commands — all without the overhead of Electron.

### Goals

- Reuse maximum code from `@ditloop/mobile` (components, stores, API client, hooks)
- System tray with live execution status and quick actions
- Native OS notifications replacing Web Push
- Direct filesystem access for workspace browsing (no server required for local workspaces)
- Rust-backed git/AI CLI execution for local workspaces
- Command palette (Cmd+K / Ctrl+K) for keyboard-driven workflows
- Multi-window support (one workspace per window)
- Deep linking via `ditloop://` protocol
- Auto-updates via Tauri's built-in updater
- Cross-platform: macOS (DMG), Windows (MSI), Linux (AppImage/deb)

### Non-Goals

- Replacing the TUI — desktop complements it, not replaces it
- Full IDE/editor capabilities — no inline code editing
- Mobile platform support — that remains the PWA (v0.5)
- Cloud/SaaS hosting — desktop is a local-first app
- Custom webview engine — relies on system webview (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux)
- Offline AI execution — still requires provider API keys or local AI tools

## Architecture

### Package Layout

```
packages/
├── web-ui/                          # NEW — shared React components
│   ├── src/
│   │   ├── components/              # Extracted from mobile
│   │   │   ├── ConfirmDialog/
│   │   │   ├── DiffViewer/
│   │   │   ├── ExecutionCard/
│   │   │   ├── MessageBubble/
│   │   │   ├── WorkspaceCard/
│   │   │   └── index.ts
│   │   ├── views/                   # Extracted from mobile
│   │   │   ├── Approvals/
│   │   │   ├── Chat/
│   │   │   ├── Executions/
│   │   │   ├── Settings/
│   │   │   ├── Workspaces/
│   │   │   └── index.ts
│   │   ├── api/                     # Extracted from mobile
│   │   │   ├── client.ts
│   │   │   ├── websocket.ts
│   │   │   └── index.ts
│   │   ├── store/                   # Extracted from mobile
│   │   │   ├── connection.ts
│   │   │   ├── theme.ts
│   │   │   └── index.ts
│   │   ├── hooks/                   # Extracted from mobile
│   │   │   ├── useApiFetch.ts
│   │   │   ├── useConnection.ts
│   │   │   ├── useTheme.ts
│   │   │   └── index.ts
│   │   ├── tailwind.preset.ts       # Shared Tailwind preset (ditloop colors, etc.)
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── mobile/                          # Slimmed — imports from @ditloop/web-ui
│   ├── src/
│   │   ├── App.tsx                  # Mobile-specific shell (BrowserRouter, BottomNav)
│   │   ├── components/Layout/       # Mobile-only: AppShell, BottomNav
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts               # PWA config stays here
│   └── tailwind.config.ts           # extends @ditloop/web-ui/tailwind.preset
├── desktop/                         # NEW — Tauri app
│   ├── src/                         # Frontend (React)
│   │   ├── App.tsx                  # Desktop-specific shell (sidebar nav, title bar)
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── DesktopShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TitleBar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── CommandPalette/
│   │   │   │   ├── CommandPalette.tsx
│   │   │   │   └── index.ts
│   │   │   ├── FileBrowser/
│   │   │   │   ├── FileBrowser.tsx
│   │   │   │   ├── FileTree.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTauriCommand.ts
│   │   │   ├── useShortcuts.ts
│   │   │   ├── useDeepLink.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── desktop.ts           # Desktop-specific state (tray, windows)
│   │   │   └── index.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── src-tauri/                   # Rust backend
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   ├── capabilities/
│   │   │   └── default.json         # Tauri 2 permissions
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── lib.rs
│   │   │   ├── commands/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── git.rs           # Git status, commit, branch
│   │   │   │   ├── ai_cli.rs        # Launch AI CLI tools
│   │   │   │   ├── filesystem.rs    # Directory listing, file reading
│   │   │   │   └── workspace.rs     # Workspace detection & management
│   │   │   ├── tray.rs              # System tray setup & handlers
│   │   │   ├── notifications.rs     # OS notification center
│   │   │   └── deep_link.rs         # ditloop:// protocol handler
│   │   └── icons/                   # App icons (macOS icns, Windows ico, Linux png)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts           # extends @ditloop/web-ui/tailwind.preset
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
```

### Code Sharing Strategy

The key architectural decision is extracting a **shared UI package** (`@ditloop/web-ui`) rather than having desktop import directly from mobile. This is cleaner because:

1. **Mobile has PWA-specific concerns** (service worker, BottomNav, safe-area insets) that desktop does not need
2. **Desktop has native-specific concerns** (Tauri commands, system tray, title bar) that mobile does not need
3. **Shared code is truly shared** — API client, stores, views, and reusable components belong in neither app
4. **Independent versioning** — mobile and desktop can evolve their shells independently

The extraction follows this split:

| Layer | Package | Why |
|-------|---------|-----|
| API client (`client.ts`, `websocket.ts`) | `@ditloop/web-ui` | Same server API, same auth |
| Zustand stores (`connection.ts`, `theme.ts`) | `@ditloop/web-ui` | Same state management |
| View components (Approvals, Chat, Executions, Workspaces, Settings) | `@ditloop/web-ui` | Same business UI |
| Reusable components (DiffViewer, WorkspaceCard, ExecutionCard, etc.) | `@ditloop/web-ui` | Same design system |
| Hooks (`useApiFetch`, `useConnection`, `useTheme`) | `@ditloop/web-ui` | Same data fetching |
| Tailwind preset (colors, tokens) | `@ditloop/web-ui` | Same design tokens |
| BottomNav, AppShell, safe-area spacing | `@ditloop/mobile` | Mobile-only layout |
| PWA manifest, service worker, Workbox | `@ditloop/mobile` | Mobile-only |
| Sidebar, TitleBar, DesktopShell | `@ditloop/desktop` | Desktop-only layout |
| CommandPalette, FileBrowser | `@ditloop/desktop` | Desktop-only features |
| Tauri Rust commands | `@ditloop/desktop` | Desktop-only backend |

### Tauri 2.x Setup

Tauri 2 uses a capability-based permission system. The desktop app needs these permissions:

```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default permissions for the DitLoop desktop app",
  "windows": ["main", "workspace-*"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "shell:allow-execute",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:allow-read",
    "fs:allow-exists",
    "notification:default",
    "os:default",
    "process:default",
    "updater:default",
    "window:default",
    "deep-link:default",
    "tray:default"
  ]
}
```

### Rust Command Pattern

All Tauri commands follow this pattern:

```rust
// src-tauri/src/commands/git.rs
use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
pub struct GitStatus {
    pub branch: String,
    pub modified: Vec<String>,
    pub untracked: Vec<String>,
    pub staged: Vec<String>,
    pub ahead: u32,
    pub behind: u32,
}

/// Get the git status for a workspace directory.
#[command]
pub async fn git_status(workspace_path: String) -> Result<GitStatus, String> {
    let output = tokio::process::Command::new("git")
        .args(["status", "--porcelain=v2", "--branch"])
        .current_dir(&workspace_path)
        .output()
        .await
        .map_err(|e| format!("Failed to execute git: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Parse porcelain v2 output...
    Ok(parse_git_status(&output.stdout))
}
```

Frontend invocation:

```typescript
// packages/desktop/src/hooks/useTauriCommand.ts
import { invoke } from '@tauri-apps/api/core';

export async function gitStatus(workspacePath: string): Promise<GitStatus> {
  return invoke<GitStatus>('git_status', { workspacePath });
}
```

### Connection Modes

The desktop app supports two connection modes:

1. **Remote mode** — connects to a running DitLoop server (same as mobile), uses `@ditloop/web-ui` API client
2. **Local mode** — uses Tauri Rust commands directly for git/filesystem/AI CLI operations, no server required

The connection store is extended with a `mode` field:

```typescript
type ConnectionMode = 'remote' | 'local';
```

In local mode, the desktop app bypasses the HTTP API and invokes Tauri commands directly. View components accept a data-fetching abstraction (hook) that switches between remote API calls and local Tauri commands.

## Task Breakdown

### Task 063: Tauri Project Scaffold + Shared UI Extraction

**Scope:** Create `packages/web-ui/` by extracting shared code from `packages/mobile/`. Create `packages/desktop/` with Tauri 2.x scaffold. Update `packages/mobile/` to import from `@ditloop/web-ui`.

**Deliverables:**

1. **`packages/web-ui/`** package:
   - `package.json` with name `@ditloop/web-ui`, deps: `react`, `react-dom`, `react-router-dom`, `zustand`
   - `tsconfig.json` extending `../../tsconfig.base.json`
   - Move from mobile to web-ui:
     - `src/api/client.ts`, `src/api/websocket.ts`, `src/api/index.ts`
     - `src/store/connection.ts`, `src/store/theme.ts`, `src/store/index.ts`
     - `src/hooks/useApiFetch.ts`, `src/hooks/useConnection.ts`, `src/hooks/useTheme.ts`, `src/hooks/index.ts`
     - `src/components/ConfirmDialog/`, `src/components/DiffViewer/`, `src/components/ExecutionCard/`, `src/components/MessageBubble/`, `src/components/WorkspaceCard/`
     - `src/views/Approvals/`, `src/views/Chat/`, `src/views/Executions/`, `src/views/Settings/`, `src/views/Workspaces/`
   - `src/tailwind.preset.ts` — shared Tailwind preset with `ditloop` color palette, tap target, safe-area spacing
   - `src/index.ts` — barrel exporting all public APIs

2. **`packages/mobile/`** updated:
   - `package.json` adds `@ditloop/web-ui` as workspace dependency
   - `src/App.tsx` imports views from `@ditloop/web-ui`
   - Keep only: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/components/Layout/` (AppShell, BottomNav), `vite.config.ts` (PWA config), `index.html`, `public/`
   - `tailwind.config.ts` uses `presets: [webUiPreset]`

3. **`packages/desktop/`** Tauri scaffold:
   - `pnpm create tauri-app` with Vite + React template
   - `package.json` with name `@ditloop/desktop`, deps: `@ditloop/web-ui`, `@tauri-apps/api`, `react`, `react-dom`, `react-router-dom`, `zustand`, `tailwindcss`
   - `src-tauri/Cargo.toml` with Tauri 2.x deps
   - `src-tauri/tauri.conf.json` — window config (title "DitLoop", 1200x800 default, min 800x600)
   - `src-tauri/capabilities/default.json` — base permissions
   - `src-tauri/src/main.rs` — minimal Tauri app entry
   - `src-tauri/src/lib.rs` — `tauri::Builder` setup
   - `index.html`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`
   - Minimal `src/App.tsx` that renders "DitLoop Desktop" placeholder
   - `src/main.tsx` entry point

4. **Monorepo updates:**
   - `pnpm-workspace.yaml` already covers `packages/*` — no change needed
   - `turbo.json` — no change needed (existing task config works)

**Definition of Done:**
- `pnpm install` succeeds in the monorepo root
- `pnpm --filter @ditloop/web-ui build` succeeds
- `pnpm --filter @ditloop/mobile build` succeeds with imports from `@ditloop/web-ui`
- `pnpm --filter @ditloop/mobile test` passes (no regressions)
- `pnpm --filter @ditloop/desktop tauri dev` launches a native window with the placeholder UI
- All existing mobile tests pass with the new import paths

---

### Task 064: Desktop Shell (Window, Navigation, Routing)

**Scope:** Build the desktop-specific application shell: sidebar navigation (replacing mobile's BottomNav), title bar with connection status, and full routing setup importing views from `@ditloop/web-ui`.

**Depends on:** 063

**Deliverables:**

1. **`packages/desktop/src/components/Layout/DesktopShell.tsx`**
   - Sidebar + main content area layout
   - Connection status indicator in the title bar area
   - Responsive: sidebar collapses to icons at narrow widths

2. **`packages/desktop/src/components/Layout/Sidebar.tsx`**
   - Vertical nav items: Workspaces, Chat, Approvals, Executions, Settings
   - Active route highlighting
   - Workspace quick-switcher at the top
   - Collapse/expand toggle

3. **`packages/desktop/src/components/Layout/TitleBar.tsx`**
   - Custom title bar (Tauri `decorations: false` for frameless window)
   - Drag region for window movement
   - Window controls (minimize, maximize, close) via `@tauri-apps/api/window`
   - Connection status dot + label

4. **`packages/desktop/src/App.tsx`**
   - `BrowserRouter` with routes matching mobile (same paths)
   - Desktop-specific route: `/files` for filesystem browser (placeholder)
   - Wraps content in `DesktopShell`
   - Connection check: if not configured, show `ConnectionSetup` from `@ditloop/web-ui`

5. **`src-tauri/tauri.conf.json`** updates:
   - `decorations: false` for custom title bar
   - Window title, default size, min size

**Definition of Done:**
- App launches with sidebar navigation
- All routes from mobile work (workspaces, chat, approvals, executions, settings)
- Custom title bar with working window controls (drag, minimize, maximize, close)
- Connection setup flow works (configure server URL + token)
- Views from `@ditloop/web-ui` render correctly in the desktop shell

---

### Task 065: System Tray Integration

**Scope:** Add a system tray icon with a context menu showing execution status, quick actions, and the ability to show/hide the main window.

**Depends on:** 064

**Deliverables:**

1. **`src-tauri/src/tray.rs`**
   - Create system tray with DitLoop icon
   - Context menu items:
     - "Show DitLoop" / "Hide DitLoop" — toggle main window visibility
     - Separator
     - "Active Executions: N" — dynamic count (disabled/info item)
     - "Pending Approvals: N" — dynamic count
     - Separator
     - "New Execution..." — opens execution dialog
     - "Open Workspace..." — opens workspace selector
     - Separator
     - "Preferences..." — opens settings view
     - "Quit DitLoop" — exit app
   - Tray icon state changes based on status:
     - Idle: default icon
     - Running: animated/badge icon (execution in progress)
     - Attention: alert icon (pending approvals)

2. **`src-tauri/src/lib.rs`** updates:
   - Register tray plugin and menu handlers
   - Event listeners to update tray state from frontend

3. **`packages/desktop/src/hooks/useTray.ts`**
   - Hook to send tray updates from React (execution count, approval count)
   - Uses `invoke` to call Rust commands for tray updates

4. **Tray icon assets:**
   - `src-tauri/icons/tray-idle.png` (16x16, 32x32)
   - `src-tauri/icons/tray-running.png`
   - `src-tauri/icons/tray-attention.png`

**Definition of Done:**
- System tray icon appears on macOS menu bar / Windows taskbar / Linux tray
- Context menu shows all items
- "Show/Hide" toggles main window
- Execution and approval counts update in real-time via WebSocket events
- Tray icon changes state based on execution status
- "Quit" exits the app cleanly

---

### Task 066: Native OS Notifications

**Scope:** Replace Web Push notifications with native OS notification center integration via Tauri's notification plugin.

**Depends on:** 064

**Deliverables:**

1. **`src-tauri/src/notifications.rs`**
   - Notification types matching existing server events:
     - `approval:requested` — "Approval Needed: {task name}"
     - `execution:completed` — "Execution Complete: {task name}"
     - `execution:failed` — "Execution Failed: {task name}"
     - `execution:started` — "Execution Started: {task name}" (optional, configurable)
   - Notification actions: clicking opens the relevant view in the app
   - Sound: use system default notification sound
   - Grouping: group by workspace

2. **`packages/desktop/src/hooks/useNotifications.ts`**
   - Listen to WebSocket events and trigger OS notifications via Tauri
   - Respect notification preferences from Settings view
   - `requestPermission()` — check and request OS notification permission
   - Quiet hours support (reuse logic from `@ditloop/web-ui` Settings)

3. **`src-tauri/Cargo.toml`** additions:
   - `tauri-plugin-notification`

4. **`src-tauri/capabilities/default.json`** additions:
   - `notification:default`, `notification:allow-notify`, `notification:allow-request-permission`

**Definition of Done:**
- OS notifications appear for approval requests, execution completions, and failures
- Clicking a notification opens the app and navigates to the relevant view
- Notifications respect quiet hours configuration
- Notification permission is requested on first launch
- Works on macOS (Notification Center), Windows (Action Center), and Linux (libnotify)

---

### Task 067: Workspace Browser with Filesystem Access

**Scope:** Build a filesystem browser that lets users navigate workspace directories, view file trees, and read file contents — all via Tauri Rust commands (no server required).

**Depends on:** 064

**Deliverables:**

1. **`src-tauri/src/commands/filesystem.rs`**
   - `list_directory(path: String) -> Vec<FileEntry>` — returns files/dirs with metadata (name, size, modified, is_dir, is_hidden)
   - `read_file(path: String) -> FileContent` — reads text files up to 1MB, returns content + detected language
   - `file_exists(path: String) -> bool`
   - `get_home_dir() -> String`
   - Respects `.gitignore` patterns (optional, uses `ignore` crate)

2. **`src-tauri/src/commands/workspace.rs`**
   - `detect_workspaces(base_path: String) -> Vec<WorkspaceInfo>` — scans a directory for git repos with `.ai/` folders
   - `get_workspace_info(path: String) -> WorkspaceInfo` — returns workspace metadata (git branch, AIDF status, last modified)
   - `open_in_terminal(path: String)` — opens system terminal at path
   - `open_in_editor(path: String, editor: Option<String>)` — opens in VS Code / default editor

3. **`packages/desktop/src/components/FileBrowser/FileBrowser.tsx`**
   - Split pane: file tree on left, file preview on right
   - Breadcrumb navigation bar
   - File type icons (folder, code files, config files, etc.)
   - Click to preview file content
   - Double-click folder to navigate into it
   - Context menu: "Open in Terminal", "Open in Editor", "Copy Path"

4. **`packages/desktop/src/components/FileBrowser/FileTree.tsx`**
   - Recursive tree component with expand/collapse
   - Lazy loading (only fetches directory contents on expand)
   - Icons by file type
   - `.ai/` folders highlighted with DitLoop branding

5. **Desktop route:** `/files` and `/files/:path` in `App.tsx`

6. **Native file dialog** for "Open Workspace":
   - Uses `@tauri-apps/plugin-dialog` to pick a directory
   - Adds selected directory as a workspace

**Definition of Done:**
- File browser view accessible from sidebar
- Can navigate filesystem starting from home directory
- File tree expands/collapses with lazy loading
- Text files preview with syntax detection
- "Open in Terminal" and "Open in Editor" work on macOS, Windows, Linux
- Native directory picker dialog opens and adds workspace
- `.ai/` folders are visually distinguished

---

### Task 068: Local Server Auto-Connect / Embedded Mode

**Scope:** Implement automatic detection and connection to a locally running DitLoop server, plus an "embedded" mode where the desktop app connects without manual configuration.

**Depends on:** 064

**Deliverables:**

1. **`src-tauri/src/commands/server.rs`**
   - `detect_local_server() -> Option<ServerInfo>` — checks common ports (4321, 4322, etc.) for a running DitLoop server
   - `health_check(url: String) -> Result<ServerHealth, String>` — pings server health endpoint

2. **`packages/desktop/src/hooks/useAutoConnect.ts`**
   - On app launch, probe for local DitLoop server
   - If found, auto-populate connection URL and prompt for token (or use stored token)
   - Show "Local server detected at localhost:4321" banner
   - Fallback to manual connection setup if not found

3. **`packages/desktop/src/views/ConnectionSetup/DesktopConnectionSetup.tsx`**
   - Extended version of the web-ui `ConnectionSetup`:
     - "Auto-detect" button that scans for local server
     - Server status indicator (green dot when connected)
     - Recent connections list (persisted)
     - "Local mode" toggle — use Tauri commands directly without server

4. **Local mode integration:**
   - When in local mode, workspace list comes from `detect_workspaces` Rust command
   - Execution and approval views show "Requires server connection" placeholder
   - Chat view shows "Requires server connection" placeholder
   - Filesystem browser works fully in local mode

**Definition of Done:**
- App auto-detects local server on startup
- Connection is established automatically if server is running and token is stored
- Manual connection setup has auto-detect button
- Local mode allows browsing workspaces and files without a server
- Recent connections are persisted between app restarts
- Clear indication of which mode is active (local vs remote)

---

### Task 069: Rust Commands for Git/AI CLI Execution

**Scope:** Implement Tauri Rust commands for direct git operations and AI CLI tool launching, enabling the desktop app to execute locally without going through the server.

**Depends on:** 067

**Deliverables:**

1. **`src-tauri/src/commands/git.rs`**
   - `git_status(workspace_path: String) -> GitStatus` — parsed porcelain v2 output
   - `git_log(workspace_path: String, count: u32) -> Vec<GitCommit>` — recent commits
   - `git_diff(workspace_path: String, staged: bool) -> String` — unified diff
   - `git_branch_list(workspace_path: String) -> Vec<GitBranch>` — local + remote branches
   - `git_commit(workspace_path: String, message: String) -> Result<String, String>` — commit staged changes
   - `git_checkout(workspace_path: String, branch: String) -> Result<(), String>`
   - All commands use `tokio::process::Command` for async execution
   - Proper error handling with user-friendly messages

2. **`src-tauri/src/commands/ai_cli.rs`**
   - `detect_ai_tools() -> Vec<AiToolInfo>` — detects installed AI CLIs (claude, aider, copilot, etc.)
   - `launch_ai_cli(tool: String, workspace_path: String, args: Vec<String>) -> Result<u32, String>` — spawns AI CLI in a new terminal window, returns PID
   - `inject_context(workspace_path: String, tool: String) -> Result<String, String>` — builds context string from `.ai/` folder (mirrors `@ditloop/core` context-builder)

3. **`packages/desktop/src/hooks/useLocalGit.ts`**
   - Wraps Rust git commands with React Query-style hooks
   - `useGitStatus(path)`, `useGitLog(path)`, `useGitDiff(path)`, `useGitBranches(path)`
   - Auto-refresh on window focus

4. **`packages/desktop/src/hooks/useLocalAiCli.ts`**
   - `useAiTools()` — lists detected AI tools
   - `launchAiCli(tool, workspace, args)` — launches tool and returns status

5. **Desktop views integration:**
   - WorkspaceDetail view shows git status from local commands when in local mode
   - "Launch AI" button in workspace detail triggers `launch_ai_cli`

**Definition of Done:**
- All git commands work for any local git repository
- AI CLI detection finds installed tools (claude, aider, etc.)
- AI CLI launch opens a terminal window with the tool running
- Context injection builds the same context as `@ditloop/core`
- Git status refreshes on window focus
- Errors are displayed in the UI with actionable messages

---

### Task 070: Command Palette (Cmd+K / Ctrl+K)

**Scope:** Implement a command palette (similar to VS Code's Ctrl+Shift+P) for keyboard-driven navigation and actions.

**Depends on:** 064, 067, 069

**Deliverables:**

1. **`packages/desktop/src/components/CommandPalette/CommandPalette.tsx`**
   - Modal overlay triggered by Cmd+K (macOS) / Ctrl+K (Windows/Linux)
   - Fuzzy search input at the top
   - Categorized results:
     - **Navigate:** "Go to Workspaces", "Go to Approvals", "Go to Settings", etc.
     - **Workspace:** "Open workspace: {name}" (lists all workspaces)
     - **Git:** "Git status", "Git commit", "Git checkout branch"
     - **AI:** "Launch Claude Code", "Launch Aider"
     - **Window:** "New Window", "Toggle Sidebar", "Toggle Full Screen"
     - **System:** "Open Preferences", "Check for Updates", "Quit"
   - Keyboard navigation: arrow keys, Enter to select, Escape to close
   - Recently used commands appear first
   - Animated entrance/exit (scale + fade)

2. **`packages/desktop/src/hooks/useShortcuts.ts`**
   - Global keyboard shortcut manager using Tauri's global shortcut plugin
   - Registered shortcuts:
     - `Cmd/Ctrl+K` — command palette
     - `Cmd/Ctrl+1..5` — navigate to sidebar sections
     - `Cmd/Ctrl+N` — new execution
     - `Cmd/Ctrl+,` — settings
     - `Cmd/Ctrl+W` — close current window
     - `Cmd/Ctrl+Shift+N` — new window
   - Shortcuts are context-aware (different actions in different views)

3. **`packages/desktop/src/store/commands.ts`**
   - Command registry: typed list of all available commands
   - Recent commands (persisted, max 10)
   - Command execution dispatcher

4. **Fuzzy search:**
   - Use a lightweight fuzzy matcher (e.g., `fzf-for-js` or custom implementation)
   - Match against command title, keywords, and category

**Definition of Done:**
- Cmd+K opens the command palette on macOS, Ctrl+K on Windows/Linux
- Fuzzy search filters commands in real-time
- All navigation, git, AI, and window commands are available
- Keyboard navigation works (up/down/enter/escape)
- Recently used commands appear at the top
- All registered shortcuts work globally
- Escape or clicking outside closes the palette

---

### Task 071: Deep Linking + Multi-Window

**Scope:** Enable `ditloop://` deep links that open specific views, and support multiple windows (one workspace per window).

**Depends on:** 064, 067

**Deliverables:**

1. **Deep linking:**
   - **`src-tauri/src/deep_link.rs`**
     - Register `ditloop://` protocol handler
     - URL patterns:
       - `ditloop://workspace/{name}` — open workspace detail
       - `ditloop://approval/{id}` — open approval detail
       - `ditloop://execution/{id}` — open execution detail
       - `ditloop://connect?url={serverUrl}&token={token}` — configure connection
   - **`packages/desktop/src/hooks/useDeepLink.ts`**
     - Listen for deep link events from Tauri
     - Parse URL and navigate to the correct route
     - If app is already running, focus existing window or create new one

2. **Multi-window:**
   - **`src-tauri/src/lib.rs`** updates:
     - Support creating new windows with `WebviewWindowBuilder`
     - Each window gets a unique label (`workspace-{name}`)
     - Window state persistence (position, size) per workspace
   - **`packages/desktop/src/hooks/useMultiWindow.ts`**
     - `openWorkspaceWindow(workspacePath)` — opens a new window focused on a specific workspace
     - `listWindows()` — lists all open windows
     - `focusWindow(label)` — brings a window to front
   - **`src-tauri/tauri.conf.json`** updates:
     - Allow multiple windows in security config

3. **Window management UI:**
   - Sidebar shows "Open in New Window" button next to each workspace
   - Window menu in title bar: list of open windows
   - Cmd+Shift+N creates a new blank window

**Definition of Done:**
- `ditloop://workspace/my-project` opens the app (or focuses it) and navigates to the workspace
- `ditloop://connect?url=...&token=...` configures connection automatically
- Multiple windows can be opened, each focused on a different workspace
- Window positions and sizes are persisted
- Deep links work on macOS, Windows, and Linux
- Protocol handler is registered during app installation

---

### Task 072: Auto-Updates + Distribution

**Scope:** Configure Tauri's built-in updater for automatic updates and set up distribution artifacts (DMG, MSI, AppImage).

**Depends on:** 063 (minimum), ideally after 064-071

**Deliverables:**

1. **Auto-updater configuration:**
   - **`src-tauri/tauri.conf.json`** updater config:
     ```json
     {
       "plugins": {
         "updater": {
           "endpoints": [
             "https://releases.ditloop.dev/desktop/{{target}}/{{arch}}/{{current_version}}"
           ],
           "pubkey": "<ED25519_PUBLIC_KEY>"
         }
       }
     }
     ```
   - **`src-tauri/src/lib.rs`** — register updater plugin
   - **`packages/desktop/src/components/UpdateBanner.tsx`** — in-app banner when update is available:
     - "Update available: v0.7.1 — Restart to update"
     - "Download progress: 45%"
     - "Restart Now" button
   - **`packages/desktop/src/hooks/useUpdater.ts`** — wraps Tauri updater API

2. **Distribution configuration:**
   - **macOS:**
     - DMG with background image and app icon
     - Code signing config placeholders in `tauri.conf.json`
     - Universal binary (aarch64 + x86_64) via Tauri targets
   - **Windows:**
     - MSI installer via WiX (Tauri default)
     - NSIS installer as alternative
     - Code signing config placeholders
   - **Linux:**
     - AppImage (portable, no install)
     - `.deb` package for Debian/Ubuntu
     - `.rpm` package for Fedora/RHEL

3. **Build scripts:**
   - `packages/desktop/package.json` scripts:
     - `"tauri:build"` — production build for current platform
     - `"tauri:build:universal"` — macOS universal binary
     - `"tauri:dev"` — development mode
   - `src-tauri/tauri.conf.json` — bundle identifiers:
     - macOS: `com.ditloop.desktop`
     - Windows: `com.ditloop.desktop`

4. **GitHub Actions workflow** (placeholder):
   - `.github/workflows/desktop-release.yml`:
     - Trigger on tag `desktop-v*`
     - Matrix: macOS (aarch64, x86_64), Windows (x86_64), Linux (x86_64)
     - Build Tauri app
     - Upload artifacts to GitHub Releases
     - Generate update manifest JSON for the updater endpoint

5. **App metadata:**
   - `src-tauri/icons/` — app icons for all platforms (generated from a single SVG source)
   - `src-tauri/tauri.conf.json` — version, description, copyright
   - License embedding

**Definition of Done:**
- `pnpm --filter @ditloop/desktop tauri build` produces platform-specific installers
- DMG opens with drag-to-install on macOS
- MSI installs correctly on Windows
- AppImage runs on Linux without installation
- Auto-updater checks for updates on app launch
- Update banner appears when a new version is available
- CI workflow (placeholder) is ready for activation
- App icons render correctly on all platforms

## Task Dependencies

```
063 (Scaffold + Extraction)
 ├─► 064 (Desktop Shell)
 │    ├─► 065 (System Tray)
 │    ├─► 066 (Notifications)
 │    ├─► 067 (Filesystem Browser)
 │    │    ├─► 069 (Git/AI Rust Commands)
 │    │    │    └─► 070 (Command Palette) ◄── also depends on 064
 │    │    └─► 071 (Deep Linking + Multi-Window) ◄── also depends on 064
 │    └─► 068 (Auto-Connect / Local Mode)
 └─► 072 (Auto-Updates + Distribution) — can start early, finalized last
```

**Parallelizable after 064:** 065, 066, 067, 068 (all four can be developed concurrently)

**Sequential chain:** 063 → 064 → 067 → 069 → 070

**072 is flexible:** The build/distribution task can start scaffold work (icons, CI config) right after 063, but the updater integration should be finalized after all features are in place.

## Testing Strategy

### Unit Tests (Vitest)

- **`@ditloop/web-ui`** — test all extracted components, hooks, and stores work in isolation after extraction. These are effectively regression tests to ensure the extraction did not break anything.
- **`@ditloop/desktop`** — test desktop-specific components:
  - `CommandPalette` — fuzzy search, keyboard navigation, command execution
  - `Sidebar` — active route detection, collapse/expand
  - `TitleBar` — connection status display
  - `FileBrowser` / `FileTree` — tree rendering, lazy loading
  - Desktop-specific hooks — mock `@tauri-apps/api` with `vi.mock()`
  - Desktop stores — command registry, desktop state

### Integration Tests

- **Tauri commands** — test Rust commands with actual git repos:
  - Create temp git repos in test fixtures
  - Run `git_status`, `git_log`, `git_diff` against them
  - Test `detect_workspaces` with known directory structure
  - Test `filesystem::list_directory` with real directories
- **Rust unit tests** — standard `#[cfg(test)]` modules in each Rust file

### E2E Tests (Playwright + Tauri Driver)

- Use `@tauri-apps/driver` or WebDriver-based testing for E2E:
  - App launch and window creation
  - Navigation through all views
  - System tray interaction (limited — may require platform-specific tooling)
  - Deep link handling
  - Connection setup flow
  - File browser navigation

### Manual Testing Checklist

For each platform (macOS, Windows, Linux):

- [ ] App installs and launches
- [ ] System tray icon appears and menu works
- [ ] OS notifications appear and are clickable
- [ ] File browser navigates the real filesystem
- [ ] Git status displays for a real repository
- [ ] AI CLI launch opens a terminal window
- [ ] Command palette opens with Cmd/Ctrl+K
- [ ] Deep links open the correct view
- [ ] Multi-window opens separate workspace windows
- [ ] Auto-updater detects available updates
- [ ] Window position/size persists across restarts
- [ ] Custom title bar drag/minimize/maximize/close work

### Rust Tests

```bash
# Run Rust unit tests
cd packages/desktop/src-tauri && cargo test

# Run with specific test
cargo test commands::git::tests::test_parse_git_status
```

### Frontend Tests

```bash
# Run web-ui tests (regression after extraction)
pnpm --filter @ditloop/web-ui test

# Run mobile tests (regression after extraction)
pnpm --filter @ditloop/mobile test

# Run desktop tests
pnpm --filter @ditloop/desktop test
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| System webview version differences | Medium | High | Test on oldest supported OS versions; set minimum webview requirements in docs |
| macOS code signing requirements | High | Medium | Document Apple Developer enrollment; support unsigned builds for development |
| Windows WebView2 not pre-installed | Low | Medium | Tauri 2 includes WebView2 bootstrapper in MSI |
| Shared UI extraction breaks mobile | Medium | High | Run full mobile test suite after extraction; keep extraction as a separate PR |
| Rust compilation time slows iteration | Medium | Medium | Use `cargo watch` for hot reload; keep Rust code minimal |
| Linux system tray inconsistencies | High | Low | Use `libappindicator` via Tauri; document known issues per desktop environment |
| Deep link registration conflicts | Low | Medium | Use unique protocol (`ditloop://`); handle gracefully if already registered |

## Success Criteria

- [ ] Desktop app launches on macOS, Windows, and Linux
- [ ] Shares >80% of React components with mobile via `@ditloop/web-ui`
- [ ] System tray shows live execution status
- [ ] OS notifications work for approvals and executions
- [ ] Filesystem browser navigates real directories
- [ ] Git operations work locally via Rust commands
- [ ] Command palette provides keyboard-driven workflow
- [ ] Deep links open the correct view
- [ ] Multiple workspace windows can be open simultaneously
- [ ] Auto-updater detects and installs updates
- [ ] App bundle size < 15MB (leveraging system webview)
- [ ] All tests pass on all three platforms

---

**Last Updated:** February 16, 2026
**Status:** PLANNED
**Tasks:** 063-072
**Parallel with:** v0.6 (TUI Overhaul)
