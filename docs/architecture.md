# HitLoop — Technical Architecture v0.1

## Principios

1. **Core sin UI** — Toda lógica de negocio en `@hitloop/core`, sin dependencia de Ink/React
2. **UI reutilizable** — Componentes en `@hitloop/ui`, usables en TUI y futuros frontends
3. **Playground** — Catálogo de componentes para desarrollo y testing visual
4. **Provider agnostic** — Adaptadores para cualquier AI provider
5. **Local first** — Todo corre en tu máquina, nada en la nube por defecto
6. **AIDF native** — Integración de primera clase con AIDF (context, tasks, roles, skills)

---

## Monorepo Structure

```
hitloop/
├── package.json                    # Workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json              # Shared TS config
├── turbo.json                      # Turborepo for build orchestration
│
├── packages/
│   │
│   ├── core/                       # @hitloop/core — CEREBRO (zero UI deps)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       │
│   │       ├── workspace/          # Workspace & group management
│   │       │   ├── workspace-manager.ts
│   │       │   ├── workspace-manager.test.ts
│   │       │   ├── group-resolver.ts       # Resolve group → projects
│   │       │   ├── group-resolver.test.ts
│   │       │   ├── auto-discover.ts        # Scan dirs for .git repos
│   │       │   └── auto-discover.test.ts
│   │       │
│   │       ├── profile/            # Git identity management
│   │       │   ├── profile-manager.ts
│   │       │   ├── profile-manager.test.ts
│   │       │   ├── identity-guard.ts       # Pre-commit/push verification
│   │       │   ├── identity-guard.test.ts
│   │       │   ├── ssh-agent.ts            # SSH key management
│   │       │   └── ssh-agent.test.ts
│   │       │
│   │       ├── provider/           # AI provider adapters
│   │       │   ├── types.ts                # Provider interface
│   │       │   ├── provider-registry.ts    # Register & resolve providers
│   │       │   ├── adapters/
│   │       │   │   ├── claude-cli.ts       # Claude Code CLI adapter
│   │       │   │   ├── claude-cli.test.ts
│   │       │   │   ├── anthropic-api.ts    # Anthropic API direct
│   │       │   │   ├── anthropic-api.test.ts
│   │       │   │   ├── openai-api.ts       # OpenAI API
│   │       │   │   ├── openai-api.test.ts
│   │       │   │   ├── cursor-cli.ts       # Cursor CLI
│   │       │   │   └── cursor-cli.test.ts
│   │       │   └── tool-handler.ts         # Tool execution for API providers
│   │       │
│   │       ├── executor/           # Task execution engine
│   │       │   ├── executor.ts             # Main execution loop
│   │       │   ├── executor.test.ts
│   │       │   ├── parallel-executor.ts    # Multi-task parallel execution
│   │       │   ├── parallel-executor.test.ts
│   │       │   ├── iteration.ts            # Single iteration logic
│   │       │   └── events.ts              # Execution event emitter
│   │       │
│   │       ├── safety/             # Scope & permission enforcement
│   │       │   ├── scope-validator.ts
│   │       │   ├── scope-validator.test.ts
│   │       │   ├── approval-queue.ts       # Manages pending approvals
│   │       │   ├── approval-queue.test.ts
│   │       │   └── redaction.ts            # Sensitive content filtering
│   │       │
│   │       ├── aidf/               # AIDF integration (first-class)
│   │       │   ├── aidf-detector.ts        # Detect if project uses AIDF (.ai/ exists)
│   │       │   ├── aidf-detector.test.ts
│   │       │   ├── context-loader.ts       # Load .ai/AGENTS.md, roles, skills
│   │       │   ├── context-loader.test.ts
│   │       │   ├── context-merger.ts       # Merge group .ai/ + project .ai/
│   │       │   ├── context-merger.test.ts
│   │       │   ├── task-parser.ts          # Parse .ai/tasks/*.md files
│   │       │   ├── task-parser.test.ts
│   │       │   ├── task-writer.ts          # Create/update task .md files
│   │       │   ├── task-writer.test.ts
│   │       │   ├── plan-parser.ts          # Parse .ai/plans/*.md files
│   │       │   ├── role-loader.ts          # Load .ai/roles/*.md
│   │       │   ├── skill-loader.ts         # Load .ai/skills/*/SKILL.md
│   │       │   ├── template-engine.ts      # Apply task templates
│   │       │   └── types.ts               # AIDF-specific types
│   │       │
│   │       ├── git/                # Git operations
│   │       │   ├── git-client.ts           # Wrapper around git commands
│   │       │   ├── git-client.test.ts
│   │       │   ├── diff-parser.ts          # Parse git diff output
│   │       │   ├── diff-parser.test.ts
│   │       │   ├── status-parser.ts        # Parse git status
│   │       │   └── branch-utils.ts         # Default branch detection, etc
│   │       │
│   │       ├── chat/               # Chat session management
│   │       │   ├── chat-session.ts
│   │       │   ├── chat-session.test.ts
│   │       │   ├── chat-history.ts         # Persist/load chat history
│   │       │   └── slash-commands.ts       # /task, /diff, /files, etc
│   │       │
│   │       ├── config/             # Configuration management
│   │       │   ├── config-loader.ts        # Load ~/.hitloop/config.yml
│   │       │   ├── config-loader.test.ts
│   │       │   ├── config-schema.ts        # Zod schema for validation
│   │       │   └── defaults.ts             # Default config values
│   │       │
│   │       ├── events/             # Global event system
│   │       │   ├── event-bus.ts            # Typed EventEmitter
│   │       │   └── events.ts              # All event type definitions
│   │       │
│   │       └── types/              # Shared type definitions
│   │           ├── workspace.ts
│   │           ├── profile.ts
│   │           ├── task.ts
│   │           ├── provider.ts
│   │           ├── approval.ts
│   │           └── index.ts
│   │
│   ├── ui/                         # @hitloop/ui — DESIGN SYSTEM (Ink components)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       │
│   │       ├── primitives/         # Base building blocks
│   │       │   ├── Panel.tsx               # Bordered panel with title
│   │       │   ├── SplitView.tsx           # Horizontal/vertical split layout
│   │       │   ├── Modal.tsx               # Overlay modal
│   │       │   ├── StatusBadge.tsx         # 🟢🟡⚪🔴 indicators
│   │       │   ├── Shortcut.tsx            # Keyboard shortcut display
│   │       │   ├── ShortcutsBar.tsx        # Bottom bar with shortcuts
│   │       │   ├── Header.tsx              # Top bar with breadcrumb
│   │       │   ├── Breadcrumb.tsx          # ◉ hitloop ❯ Pivotree ❯ #042
│   │       │   ├── Divider.tsx             # Horizontal separator
│   │       │   └── Truncate.tsx            # Text truncation with ellipsis
│   │       │
│   │       ├── data-display/       # Showing information
│   │       │   ├── DiffView.tsx            # Git diff with colors
│   │       │   ├── FileTree.tsx            # Directory tree (collapsable)
│   │       │   ├── FilePreview.tsx         # File content with line numbers
│   │       │   ├── TaskCard.tsx            # Task summary card
│   │       │   ├── TaskDetail.tsx          # Full task detail panel
│   │       │   ├── ProgressBar.tsx         # Execution progress bar
│   │       │   ├── LogStream.tsx           # Live output streaming
│   │       │   ├── MetricsRow.tsx          # Tokens, cost, time display
│   │       │   ├── ChangeList.tsx          # List of changed files (git status)
│   │       │   └── RelativeTime.tsx        # "2m ago", "1d", "now"
│   │       │
│   │       ├── input/              # User interaction
│   │       │   ├── ChatInput.tsx           # Message input with history
│   │       │   ├── CommandBar.tsx          # Bottom input bar with / commands
│   │       │   ├── ConfirmDialog.tsx       # Yes/No confirmation
│   │       │   ├── PinInput.tsx            # PIN entry (for pairing)
│   │       │   ├── SelectList.tsx          # Navigable list with selection
│   │       │   └── FuzzyFinder.tsx         # Fuzzy search input + results
│   │       │
│   │       ├── composite/          # Higher-level composed components
│   │       │   ├── Sidebar.tsx             # The persistent left sidebar
│   │       │   ├── WorkspaceItem.tsx       # Workspace entry in sidebar
│   │       │   ├── TaskItem.tsx            # Task entry in sidebar
│   │       │   ├── ApprovalPrompt.tsx      # Full approval modal
│   │       │   ├── IdentityMismatch.tsx    # Git identity warning modal
│   │       │   ├── CommitDialog.tsx        # Inline commit prompt
│   │       │   └── WelcomeScreen.tsx       # Quick action cards
│   │       │
│   │       ├── hooks/              # Shared React hooks
│   │       │   ├── useKeyboard.ts          # Global keyboard handler
│   │       │   ├── useFocusZone.ts         # Focus management between zones
│   │       │   ├── useScrollable.ts        # Scroll state for lists
│   │       │   ├── useRealtime.ts          # Subscribe to event bus
│   │       │   └── useTheme.ts             # Theme context consumer
│   │       │
│   │       └── theme/              # Theming system
│   │           ├── theme.ts                # Theme type definition
│   │           ├── ThemeProvider.tsx        # React context provider
│   │           ├── default-theme.ts        # Default color scheme
│   │           └── themes/
│   │               ├── dark.ts             # Dark theme (default)
│   │               ├── light.ts
│   │               └── solarized.ts
│   │
│   ├── tui/                        # @hitloop/tui — TERMINAL APP
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       ├── index.ts                    # CLI entry point
│   │       ├── app.tsx                     # Root App component
│   │       │
│   │       ├── views/              # Full-screen views (pages)
│   │       │   ├── HomeView.tsx            # Sidebar + welcome/main area
│   │       │   ├── TaskDetailView.tsx      # Sidebar + task detail
│   │       │   ├── ExecutionView.tsx       # Sidebar + execution output
│   │       │   ├── ChatView.tsx            # Sidebar + chat
│   │       │   ├── SourceControlView.tsx   # Sidebar + changed files + diff
│   │       │   ├── FileExplorerView.tsx    # Sidebar + file tree + preview
│   │       │   ├── SettingsView.tsx        # Settings panels
│   │       │   └── MissionControlView.tsx  # Multi-workspace overview
│   │       │
│   │       ├── navigation/         # View routing & state
│   │       │   ├── Router.tsx              # View router
│   │       │   ├── routes.ts              # Route definitions
│   │       │   └── NavigationContext.tsx    # Navigation state provider
│   │       │
│   │       ├── state/              # App state management
│   │       │   ├── AppContext.tsx           # Global app context
│   │       │   ├── useWorkspaces.ts        # Workspace state
│   │       │   ├── useActiveTask.ts        # Currently selected task
│   │       │   ├── useExecution.ts         # Execution state bridge
│   │       │   └── useProfiles.ts          # Git profile state
│   │       │
│   │       └── commands/           # CLI commands (non-TUI)
│   │           ├── start.ts                # hitloop (default, launches TUI)
│   │           ├── workspace.ts            # hitloop workspace add/list/remove
│   │           ├── profile.ts              # hitloop profile add/list/switch
│   │           ├── run.ts                  # hitloop run (headless execution)
│   │           └── init.ts                 # hitloop init (setup wizard)
│   │
│   └── playground/                 # @hitloop/playground — COMPONENT CATALOG
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                    # Entry: hitloop playground
│           ├── catalog.tsx                 # Main catalog view
│           │
│           └── stories/            # Component stories (like Storybook)
│               ├── primitives/
│               │   ├── Panel.story.tsx
│               │   ├── Modal.story.tsx
│               │   ├── StatusBadge.story.tsx
│               │   └── SplitView.story.tsx
│               ├── data-display/
│               │   ├── DiffView.story.tsx
│               │   ├── FileTree.story.tsx
│               │   ├── ProgressBar.story.tsx
│               │   ├── LogStream.story.tsx
│               │   └── ChangeList.story.tsx
│               ├── input/
│               │   ├── ChatInput.story.tsx
│               │   ├── FuzzyFinder.story.tsx
│               │   └── SelectList.story.tsx
│               └── composite/
│                   ├── Sidebar.story.tsx
│                   ├── ApprovalPrompt.story.tsx
│                   └── CommitDialog.story.tsx
│
├── apps/                           # Future frontends (v0.4+)
│   ├── server/                     # @hitloop/server (v0.4)
│   ├── web/                        # @hitloop/web — PWA (v0.4)
│   └── desktop/                    # @hitloop/desktop — Tauri (v0.5)
│
└── config/                         # Shared tooling config
    ├── eslint/
    │   └── base.js
    ├── tsconfig/
    │   ├── base.json
    │   ├── react.json              # For Ink/React packages
    │   └── node.json               # For pure Node packages
    └── vitest/
        └── base.ts
```

---

## Tech Stack

### Build & Tooling

| Tool         | Purpose                    | Why                                         |
|--------------|----------------------------|---------------------------------------------|
| pnpm         | Package manager            | Fast, disk-efficient, great workspaces      |
| Turborepo    | Monorepo orchestration     | Parallel builds, caching, task dependencies |
| tsup         | TypeScript bundler         | Fast (esbuild), zero-config, ESM + CJS      |
| Vitest       | Testing                    | Fast, native TS, compatible with Jest API    |
| ESLint       | Linting                    | Code quality                                |
| Changesets   | Versioning & publishing    | Independent package versions in monorepo    |
| **AIDF**     | **AI-driven development**  | **hitloop eats its own dog food**            |

### AIDF for hitloop's own development

hitloop uses AIDF to build itself. The `.ai/` folder at the repo root contains:

```
hitloop/
├── .ai/
│   ├── AGENTS.md                   # Project architecture & conventions
│   ├── config.yml                  # AIDF execution settings
│   ├── roles/
│   │   ├── developer.md            # Ink/React/TypeScript specialist
│   │   ├── architect.md            # Monorepo & system design
│   │   └── tester.md               # Vitest + ink-testing-library
│   ├── skills/
│   │   ├── ink-components/SKILL.md # How to build Ink components
│   │   └── event-driven/SKILL.md   # Event bus patterns
│   ├── tasks/
│   │   ├── 001-setup-monorepo.md
│   │   ├── 002-config-schema.md
│   │   ├── 003-workspace-manager.md
│   │   ├── 004-profile-manager.md
│   │   ├── 005-identity-guard.md
│   │   ├── 006-event-bus.md
│   │   ├── 007-aidf-detector.md
│   │   ├── 008-context-loader.md
│   │   ├── 009-ui-primitives.md
│   │   ├── 010-sidebar-component.md
│   │   ├── 011-home-view.md
│   │   ├── 012-cli-entrypoint.md
│   │   ├── 013-playground-setup.md
│   │   └── 014-integration-test.md
│   ├── plans/
│   │   └── PLAN-v01-mvp.md         # This v0.1 plan
│   └── templates/
│       └── (inherits from AIDF defaults)
├── CLAUDE.md                       # Claude Code instructions for this repo
└── packages/
    └── ...
```

This serves a dual purpose:
1. **Structured development** — each task has clear scope, DoD, and boundaries
2. **Dogfooding** — hitloop's first real AIDF integration test is building itself

### Core (packages/core)

| Library      | Purpose                    | Why                                         |
|--------------|----------------------------|---------------------------------------------|
| zod          | Config validation          | Runtime type safety, great TS inference     |
| yaml         | Parse config.yml           | Standard YAML parser                        |
| execa        | Run shell commands         | Better child_process, TypeScript-first      |
| eventemitter3| Event system               | Typed, fast, small                          |
| simple-git   | Git operations             | Clean API over git CLI                      |
| chokidar     | File watching              | Cross-platform fs watch                     |
| gray-matter  | Parse markdown frontmatter | Parse .ai/ task/plan files (YAML + MD)      |

### UI (packages/ui)

| Library      | Purpose                    | Why                                         |
|--------------|----------------------------|---------------------------------------------|
| ink          | React for terminal         | 34k stars, mature, TS-first                 |
| ink 5+       | Latest Ink version         | ESM, better perf, React 18                  |
| @inkjs/ui    | Base UI components         | Select, Spinner, TextInput out of the box   |
| ink-testing  | Component testing          | render() + assertions for Ink               |
| react        | UI framework               | Ink is built on React                       |
| zustand      | State management           | Minimal, works with React, no boilerplate   |
| fuse.js      | Fuzzy search               | Lightweight fuzzy finder for files/commands  |
| diff2html    | Diff rendering             | Parse & colorize git diffs                  |

### Playground (packages/playground)

| Library      | Purpose                    | Why                                         |
|--------------|----------------------------|---------------------------------------------|
| ink          | Render stories             | Same renderer as the app                    |
| Custom       | Story runner               | Simple: each .story.tsx exports components  |

No Storybook traditional (no es web). En su lugar, un TUI interactivo:

```bash
hitloop playground
```

```
╔══════════════════════════════════════════════════════════════════════╗
║  ◉ hitloop playground                                               ║
╠═══════════════════════════╦══════════════════════════════════════════╣
║  COMPONENTS               ║  PREVIEW                                ║
║                           ║                                          ║
║  Primitives               ║  Panel                                   ║
║  ❯ Panel                  ║  ────────────────────────────────        ║
║    Modal                  ║                                          ║
║    SplitView              ║  Variant: default                        ║
║    StatusBadge            ║  ┌─ My Panel ─────────────────┐          ║
║    Breadcrumb             ║  │                             │          ║
║                           ║  │  Hello, this is a panel    │          ║
║  Data Display             ║  │  with a title and content. │          ║
║    DiffView               ║  │                             │          ║
║    FileTree               ║  └─────────────────────────────┘          ║
║    ProgressBar            ║                                          ║
║    LogStream              ║  Variant: with status                    ║
║    ChangeList             ║  ┌─ My Panel ────────── 🟢 ──┐          ║
║                           ║  │                             │          ║
║  Input                    ║  │  Panel with status badge   │          ║
║    ChatInput              ║  │                             │          ║
║    FuzzyFinder            ║  └─────────────────────────────┘          ║
║    SelectList             ║                                          ║
║                           ║  Props:                                  ║
║  Composite                ║   title: string                          ║
║    Sidebar                ║   status?: 'active'|'warning'|'error'   ║
║    ApprovalPrompt         ║   children: ReactNode                    ║
║                           ║                                          ║
╠═══════════════════════════╩══════════════════════════════════════════╣
║  ↑↓ navigate   enter preview   v toggle variants   i interactive     ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Data Flow Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │                   TUI (Ink)                   │
                    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐   │
                    │  │Views │ │Views │ │Views │ │Playground │   │
                    │  └──┬───┘ └──┬───┘ └──┬───┘ └─────┬────┘   │
                    │     │        │        │            │         │
                    │  ┌──┴────────┴────────┴────────────┘         │
                    │  │         UI Components (@hitloop/ui)       │
                    │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
                    │  │  │Prim. │ │Data  │ │Input │ │Comp. │   │
                    │  │  └──────┘ └──────┘ └──────┘ └──────┘   │
                    │  └──────────────┬────────────────────────   │
                    └─────────────────┼───────────────────────────┘
                                      │
                              useRealtime() hooks
                              subscribe to events
                                      │
                    ┌─────────────────┼───────────────────────────┐
                    │                 │    Core (@hitloop/core)    │
                    │                 ▼                            │
                    │          ┌──────────────┐                   │
                    │          │  Event Bus   │ ← typed events    │
                    │          └──────┬───────┘                   │
                    │                 │                            │
                    │    ┌────────────┼────────────┐              │
                    │    ▼            ▼            ▼              │
                    │ ┌──────┐  ┌──────────┐  ┌────────┐         │
                    │ │Worksp│  │ Executor │  │Profiles│         │
                    │ │ace   │  │          │  │        │         │
                    │ │Mgr   │  │ ┌──────┐ │  │Identity│         │
                    │ └──────┘  │ │Safety│ │  │Guard   │         │
                    │           │ └──────┘ │  └────────┘         │
                    │           │ ┌──────┐ │                      │
                    │           │ │Provid│ │ ← provider adapters  │
                    │           │ │ers   │ │                      │
                    │           │ └──────┘ │                      │
                    │           └──────────┘                      │
                    │                                             │
                    │     ┌──────┐  ┌──────┐  ┌──────┐           │
                    │     │ Git  │  │Config│  │ Chat │           │
                    │     │Client│  │Loader│  │Sessn │           │
                    │     └──────┘  └──────┘  └──────┘           │
                    └─────────────────────────────────────────────┘
```

### Event-Driven Communication

Core emite eventos, UI se suscribe. No hay acoplamiento directo.

```typescript
// packages/core/src/events/events.ts

export type HitLoopEvents = {
  // Execution
  'execution:started':      { taskId: string; workspaceId: string };
  'execution:iteration':    { taskId: string; iteration: number; total: number };
  'execution:output':       { taskId: string; line: string; type: 'info' | 'action' | 'result' };
  'execution:completed':    { taskId: string; summary: ExecutionSummary };
  'execution:failed':       { taskId: string; error: string };
  'execution:paused':       { taskId: string; reason: string };

  // Approvals
  'approval:requested':     { id: string; taskId: string; action: ApprovalAction };
  'approval:resolved':      { id: string; decision: 'approved' | 'rejected' | 'deferred' };

  // Identity
  'identity:mismatch':      { workspaceId: string; expected: string; actual: string };
  'identity:switched':      { workspaceId: string; from: string; to: string };

  // Workspace
  'workspace:entered':      { workspaceId: string; projectId?: string };
  'workspace:discovered':   { workspaceId: string; projects: string[] };

  // Git
  'git:status-changed':     { workspaceId: string; changes: GitChange[] };
  'git:committed':          { workspaceId: string; hash: string; message: string };
  'git:pushed':             { workspaceId: string; branch: string };

  // Chat
  'chat:message':           { sessionId: string; role: 'user' | 'assistant'; content: string };
  'chat:task-created':      { sessionId: string; taskId: string };

  // Provider
  'provider:tokens':        { taskId: string; input: number; output: number; cost: number };
};
```

```typescript
// In UI components — subscribe to events reactively

function ExecutionView({ taskId }: { taskId: string }) {
  const output = useRealtime('execution:output', { filter: { taskId } });
  const progress = useRealtime('execution:iteration', { filter: { taskId } });
  const approval = useRealtime('approval:requested', { filter: { taskId } });

  return (
    <SplitView sidebar={<Sidebar />}>
      <ProgressBar current={progress.iteration} total={progress.total} />
      <LogStream lines={output} />
      {approval && <ApprovalPrompt approval={approval} />}
    </SplitView>
  );
}
```

---

## Story Format (Playground)

```typescript
// packages/playground/src/stories/data-display/ProgressBar.story.tsx

import { ProgressBar } from '@hitloop/ui';
import type { Story } from '@hitloop/playground';

export const meta = {
  title: 'ProgressBar',
  category: 'data-display',
  description: 'Shows execution progress with iteration count',
};

export const Default: Story = () => (
  <ProgressBar current={3} total={10} elapsed="1m 42s" />
);

export const Complete: Story = () => (
  <ProgressBar current={10} total={10} elapsed="5m 03s" />
);

export const WithCost: Story = () => (
  <ProgressBar
    current={5}
    total={10}
    elapsed="2m 30s"
    tokens={{ input: 12400, output: 3200 }}
    cost={0.08}
  />
);

// Interactive variant — updates in real-time
export const Live: Story = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(c => Math.min(c + 1, 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <ProgressBar current={current} total={10} elapsed="live" />;
};
```

---

## Config Schema (Zod)

```typescript
// packages/core/src/config/config-schema.ts

import { z } from 'zod';

const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  ssh_key: z.string(),
  ssh_host: z.string(),
  platform: z.enum(['github', 'azure-devops', 'bitbucket', 'gitlab']),
});

const ProjectOverrideSchema = z.object({
  profile: z.string().optional(),
  provider: z.string().optional(),
}).catchall(z.unknown());

const WorkspaceSchema = z.discriminatedUnion('type', [
  // Single project workspace
  z.object({
    type: z.literal('single'),
    path: z.string(),
    profile: z.string(),
    provider: z.string().default('claude-cli'),
    notifications: z.string().optional(),
  }),
  // Group workspace (multiple projects)
  z.object({
    type: z.literal('group'),
    path: z.string(),
    profile: z.string(),
    provider: z.string().default('claude-cli'),
    auto_discover: z.boolean().default(true),
    shared_context: z.boolean().default(true),
    projects: z.record(ProjectOverrideSchema).default({}),
    notifications: z.string().optional(),
  }),
]);

export const ConfigSchema = z.object({
  profiles: z.record(ProfileSchema),
  workspaces: z.record(WorkspaceSchema),

  defaults: z.object({
    provider: z.string().default('claude-cli'),
    scope_mode: z.enum(['strict', 'ask', 'permissive']).default('ask'),
    max_iterations: z.number().default(10),
    auto_commit: z.boolean().default(true),
    theme: z.string().default('dark'),
  }).default({}),

  server: z.object({
    network: z.enum(['local', 'tailscale', 'headscale', 'wireguard', 'cloudflare-tunnel'])
      .default('local'),
    port: z.number().default(3847),
    auth: z.object({
      token_rotation: z.string().default('24h'),
      max_devices: z.number().default(3),
    }).default({}),
    mobile_redact: z.object({
      patterns: z.array(z.string()).default(['**/.env*', '**/secrets/**']),
      content_patterns: z.array(z.string()).default(['password|secret|api_key']),
    }).default({}),
  }).default({}),
});

export type HitLoopConfig = z.infer<typeof ConfigSchema>;
```

---

## Provider Interface

```typescript
// packages/core/src/provider/types.ts

export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  toolCalls?: ToolCall[];
  tokens?: { input: number; output: number };
  cost?: number;
  done?: boolean;
}

export interface ProviderAdapter {
  readonly name: string;
  readonly supportsStreaming: boolean;
  readonly supportsTools: boolean;

  /**
   * Send a message and get a response.
   * For CLI adapters (claude-cli, cursor-cli), this spawns a subprocess.
   * For API adapters, this makes an API call.
   */
  execute(options: {
    messages: ProviderMessage[];
    systemPrompt: string;
    tools?: ToolDefinition[];
    workingDirectory: string;
    onOutput?: (line: string) => void;      // Streaming callback
    signal?: AbortSignal;                    // For cancellation
  }): Promise<ProviderResponse>;

  /**
   * Check if the provider is available and configured.
   */
  healthCheck(): Promise<{ ok: boolean; error?: string }>;
}
```

---

## AIDF Integration — How hitloop + AIDF work together

### Detection & Modes

hitloop works with ANY project, but unlocks more features when AIDF is present:

```
Project WITHOUT .ai/          Project WITH .ai/ (AIDF)
─────────────────────          ──────────────────────────
✓ Workspace management         ✓ Everything from basic mode
✓ Git profiles                 ✓ Structured tasks (scope, DoD)
✓ File explorer                ✓ Roles & skills for the AI
✓ Source control               ✓ Scoped execution (strict/ask/permissive)
✓ Chat (generic)               ✓ Chat with project context
✓ Run commands                 ✓ Task templates (bug fix, feature, etc)
✗ No structured tasks          ✓ Plans (multi-task initiatives)
✗ No scope safety              ✓ Scope validation & safety
✗ No DoD tracking              ✓ Definition of Done tracking
                               ✓ Auto-PR on completion
```

### Context Loading Flow

When entering a workspace/project, hitloop loads context in layers:

```
Layer 1: hitloop config         ~/.hitloop/config.yml
         (workspace, profile,    → workspace settings
          provider settings)     → which profile, which provider

Layer 2: Group AIDF context     ~/freelance/solu/.ai/
         (if group workspace)    → AGENTS.md (shared conventions)
                                 → roles/ (shared roles)
                                 → skills/ (shared skills)

Layer 3: Project AIDF context   ~/freelance/solu/smartlifear/.ai/
         (project-specific)      → AGENTS.md (project-specific overrides)
                                 → tasks/ (project tasks)
                                 → roles/ (project-specific roles)

Layer 4: CLAUDE.md cascade      Group CLAUDE.md + Project CLAUDE.md
         (merged, project wins)  → instruction overrides
```

```typescript
// packages/core/src/aidf/context-merger.ts

export interface MergedContext {
  agents: string;              // Merged AGENTS.md
  roles: Role[];               // Group roles + project roles (project wins on conflict)
  skills: Skill[];             // Group skills + project skills
  tasks: Task[];               // Only from project (tasks are project-specific)
  plans: Plan[];               // Only from project
  templates: TaskTemplate[];   // Group templates + project templates
  claudeMd: string;            // Merged CLAUDE.md
}

export function mergeContext(
  groupContext: AidfContext | null,
  projectContext: AidfContext | null
): MergedContext {
  // Project-level always overrides group-level
  // Roles: project roles override group roles with same name
  // Skills: union of both (no conflicts, skills are namespaced)
  // Tasks: project only (tasks don't live at group level)
  // Templates: project templates override group templates with same name
}
```

### Task Lifecycle in hitloop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CREATE          READY           RUNNING         DONE           │
│  ──────          ─────           ───────         ────           │
│                                                                 │
│  Via chat:       Visible in      hitloop runs    Approval:      │
│  "create task"   sidebar &       executor loop   - View diff    │
│  → writes .md    task list       with provider   - Approve PR   │
│                                                  - Reject       │
│  Via TUI:        AIDF context    Scope enforced  Task .md moved │
│  "n" new task    loaded for      per task config  to completed/ │
│  → template      the provider                                   │
│                                  Identity guard                 │
│  Via CLI:        DoD visible     checks before                  │
│  hitloop task    in UI           every commit                   │
│  create                                                         │
│                                                                 │
│  .ai/tasks/      Sidebar shows   Execution view  Notification   │
│  042-fix.md      task detail     with live output sent           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### AIDF in the Sidebar

Projects with AIDF get richer sidebar entries:

```
Without AIDF:                    With AIDF:
─────────────                    ──────────

▶ my-project                     ▼ smartlifear           .ai ✓
  (no tasks)                       Pending
                                   #003 Fix cart bug
                                   #004 Add search
                                   Running
                                   ● #005 Migrate DB    now
                                   Completed today
                                   ✓ #002 Fix webhook

The ".ai ✓" badge indicates AIDF is present and loaded.
```

### Chat Mode with AIDF Context

When AIDF is present, the chat has superpowers:

```
Without AIDF:                    With AIDF:
─────────────                    ──────────

AI knows:                        AI knows:
- File contents (on demand)      - Everything from basic
                                 - AGENTS.md (architecture, conventions)
                                 - Roles (developer, architect, etc.)
                                 - Skills (specific capabilities)
                                 - Active tasks and their scope
                                 - Project history (completed tasks)

Chat can:                        Chat can:
- Answer questions               - Everything from basic
- Read files                     - Create scoped tasks from conversation
                                 - Suggest tasks based on AGENTS.md
                                 - Use role-specific personas
                                 - Reference completed tasks for context
```

### aidf CLI Passthrough

For projects with AIDF, hitloop can proxy `aidf` commands:

```bash
# These work from within hitloop's command bar:
/aidf init                  # Initialize AIDF in current project
/aidf task create           # Create task via AIDF template wizard
/aidf status                # Show AIDF status
/aidf run                   # Run via AIDF directly (bypasses hitloop executor)
```

Or hitloop detects AIDF and uses it natively — no passthrough needed.

### Config: AIDF settings per workspace

```yaml
# ~/.hitloop/config.yml

workspaces:
  solu:
    type: group
    path: ~/Documents/freelance/solu
    profile: solu
    provider: claude-cli
    auto_discover: true
    shared_context: true         # Load group .ai/ for all sub-projects

    aidf:                        # AIDF-specific settings
      enabled: true              # Auto-detect and use AIDF
      scope_mode: strict         # Default scope mode for all tasks
      auto_commit: true          # Commit after each iteration
      auto_pr: true              # Create PR on task completion
      max_iterations: 10         # Default max iterations
      validation:                # Commands to run for validation
        - npm run typecheck
        - npm run test
      templates_dir: .ai/templates  # Where task templates live

    projects:
      smartlifear:
        aidf:
          max_iterations: 15     # Override: this project needs more iterations
          validation:
            - pnpm typecheck
            - pnpm test
            - pnpm test:e2e
```

### Dependency: aidf as npm package

```json
// packages/core/package.json
{
  "dependencies": {
    "aidf": "^1.x"              // Use AIDF's parsers and types directly
  }
}
```

Or, if we want to keep it decoupled, we reimplement the parsers (they're just
markdown + YAML parsing). This avoids a hard dependency and lets hitloop work
even if AIDF isn't installed globally.

**Recommendation: Reimplement parsers in @hitloop/core.** The .ai/ format is
simple (markdown + YAML frontmatter). This way:
- hitloop works standalone without `npm install -g aidf`
- No version coupling issues
- hitloop can extend the format if needed
- AIDF and hitloop evolve independently

```typescript
// packages/core/src/aidf/task-parser.ts
// Parses .ai/tasks/*.md files — same format as AIDF but independent impl

export interface ParsedTask {
  id: string;                    // From filename: "042-fix-auth.md" → "042"
  title: string;                 // From # TASK: heading
  goal: string;                  // From ## Goal section
  scope: {
    allowed: string[];           // Glob patterns
    forbidden: string[];         // Glob patterns
  };
  requirements: string[];        // From ## Requirements section
  definitionOfDone: DoDItem[];   // From ## Definition of Done section
  status: TaskStatus;            // From ## Status or directory (pending/completed/blocked)
}
```

---

## v0.1 Scope — What we build first

### Included in v0.1
- [ ] `@hitloop/core`: config loader + Zod schema, workspaces (single + group), profiles, git client, event bus
- [ ] `@hitloop/core`: AIDF detector, context loader, task parser, context merger (group + project)
- [ ] `@hitloop/ui`: primitives (Panel, SplitView, Header, ShortcutsBar), Sidebar, TaskItem, WorkspaceItem, StatusBadge, SelectList
- [ ] `@hitloop/tui`: HomeView with persistent sidebar, workspace navigation, task list (from AIDF), profile auto-switch
- [ ] `@hitloop/playground`: basic component catalog with stories for all v0.1 components
- [ ] CLI: `hitloop` (TUI), `hitloop init` (setup wizard), `hitloop workspace add/list`, `hitloop profile add/list`
- [ ] Git identity: auto-switch on workspace enter, pre-commit guard
- [ ] AIDF: detect .ai/ folders, load and display tasks in sidebar, show task detail in main area, badge indicator

### Deferred to v0.2
- [ ] Task execution (executor loop, provider adapters, scope validation)
- [ ] Chat mode (chat sessions, slash commands, task creation from chat)
- [ ] AIDF: task writer, template engine, plan parser, role/skill loading for provider context

### Deferred to v0.3
- [ ] Source control view (git status, staging, inline diff, commit dialog)
- [ ] File explorer (directory tree, preview, fuzzy search)

### Deferred to v0.4
- [ ] Server + PWA + mobile (local network, auth, Web Push)
- [ ] Security (redaction, mobile permissions, network detection)

### Deferred to v0.5
- [ ] Desktop app (Tauri, reusing @hitloop/core + new UI)

---

## Package Dependencies

```
@hitloop/tui
  ├── @hitloop/ui
  │   └── ink, react, @inkjs/ui
  └── @hitloop/core
      └── zod, yaml, execa, simple-git, eventemitter3, chokidar

@hitloop/playground
  ├── @hitloop/ui
  └── ink, react

(future)
@hitloop/server
  ├── @hitloop/core
  └── fastify, ws

@hitloop/web (PWA)
  └── react, tailwind (talks to @hitloop/server via API)

@hitloop/desktop (Tauri)
  ├── @hitloop/core (embedded)
  └── react, tailwind, tauri
```

---

## Testing Strategy

| Package    | Unit tests        | Integration tests      | Visual tests         |
|------------|-------------------|------------------------|----------------------|
| core       | Vitest            | Vitest + temp repos    | N/A                  |
| ui         | ink-testing-lib   | N/A                    | Playground stories   |
| tui        | ink-testing-lib   | E2E with headless term | Manual via playground|
| playground | N/A               | N/A                    | It IS the test tool  |

```typescript
// Example UI component test
import { render } from 'ink-testing-library';
import { ProgressBar } from '@hitloop/ui';

test('renders progress bar with correct percentage', () => {
  const { lastFrame } = render(
    <ProgressBar current={3} total={10} elapsed="1m" />
  );
  expect(lastFrame()).toContain('████');
  expect(lastFrame()).toContain('3/10');
  expect(lastFrame()).toContain('1m');
});
```
