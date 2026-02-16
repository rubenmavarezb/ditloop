# Architecture

DitLoop is a TypeScript monorepo built with pnpm workspaces and Turborepo. Each package has a clear responsibility and strict dependency boundaries.

## Package Diagram

```
┌─────────────────────────────────────────────────┐
│                  @ditloop/tui                    │
│           Terminal app (CLI + views)             │
├────────────────────┬────────────────────────────┤
│   @ditloop/ui      │      @ditloop/server       │
│  Component library │    HTTP/WebSocket API       │
├────────────────────┴────────────────────────────┤
│                 @ditloop/core                    │
│   Business logic (zero UI dependencies)          │
│   config · events · workspace · profile · git    │
│   provider · executor · launcher · aidf · safety │
└─────────────────────────────────────────────────┘
        ┌──────────────┐    ┌──────────────────┐
        │  playground   │    │     mobile       │
        │ Component     │    │   React PWA      │
        │ catalog       │    │   companion app  │
        └──────────────┘    └──────────────────┘
```

## Packages

### @ditloop/core

Business logic with zero UI dependencies. Can be used headless.

**Domains:**

| Domain | Key Classes | Purpose |
|--------|-------------|---------|
| `config` | `loadConfig`, `ConfigSchema` | YAML config loading and Zod validation |
| `events` | `EventBus`, `DitLoopEventMap` | Typed event system for cross-module communication |
| `workspace` | `WorkspaceManager`, `GroupResolver` | Workspace discovery, grouping, status |
| `profile` | `ProfileManager`, `SSHAgent`, `IdentityGuard` | Git identity switching and verification |
| `git` | `GitManager` | Git operations (clone, status, commits) |
| `provider` | `ProviderRegistry`, adapters | AI provider abstraction (Claude, OpenAI) |
| `executor` | `ExecutionEngine` | Task execution with safety controls |
| `launcher` | `AiLauncher`, `CLIRegistry` | AI CLI detection and context-aware launching |
| `aidf` | `AidfDetector`, `ContextLoader`, `TemplateEngine`, `AidfWriter` | AIDF folder management and scaffolding |
| `safety` | `ApprovalEngine`, `ActionExecutor` | Approval workflows and action safety |

### @ditloop/ui

Ink/React component library — the design system for the terminal.

- **Primitives**: `Panel`, `Divider`, `StatusBadge`, `Header`, `ShortcutsBar`, `SplitView`
- **Input**: `SelectList`
- **Composite**: `Sidebar`, `WorkspaceItem`, `TaskItem`
- **Theme**: `ThemeProvider` with dark mode support and color tokens
- **Hooks**: `useTheme`, `useScrollable`

### @ditloop/tui

Terminal application — the CLI entry point and full TUI dashboard.

- **Commands**: `init`, `workspace list`, `profile list|current`, `scaffold`, `server`
- **Views**: Home, WorkspaceDetail, TaskDetail, TaskEditor, Launcher, DiffReview, ExecutionDashboard
- **State**: Zustand store connecting core managers to UI components

### @ditloop/server

HTTP/WebSocket server for remote access.

- **HTTP API**: REST endpoints for workspaces, profiles, executions, approvals
- **WebSocket**: Real-time event streaming via `WebSocketBridge`
- **Auth**: Token-based authentication middleware
- **Sync**: Offline-first state synchronization with conflict resolution
- **Notifications**: Web push via VAPID

### @ditloop/mobile

React PWA companion app for mobile and tablet.

- Vite + React + Tailwind CSS
- Views for workspaces, executions, approvals, and chat
- Offline support via Workbox service worker
- Push notification subscription

### @ditloop/playground

Component catalog (Storybook-like) for previewing TUI components in isolation.

## Event-Driven Architecture

All modules in `@ditloop/core` communicate through the `EventBus` with typed events:

```typescript
// Event types are defined in events/events.ts
interface DitLoopEventMap {
  'profile:switched': { name: string; email: string };
  'workspace:selected': { workspace: ResolvedWorkspace };
  'execution:started': { taskId: string };
  'execution:completed': { taskId: string; result: ExecutionResult };
  // ...
}

// Modules emit and subscribe
eventBus.emit('profile:switched', { name: 'personal', email: 'me@example.com' });
eventBus.on('profile:switched', (data) => { /* react */ });
```

No module directly imports another for communication — they all go through the event bus. This enables loose coupling and makes the system extensible.

## Provider Adapter Pattern

AI providers (Claude, OpenAI, etc.) are abstracted behind adapters:

```
ProviderRegistry
  ├── ClaudeAdapter
  ├── OpenAIAdapter
  └── (future adapters)
```

Each adapter implements a common interface, and the `ProviderRegistry` selects the appropriate one based on configuration. This makes it trivial to add new AI providers.

## File Organization

DitLoop follows an explicit hierarchical structure:

- **Core**: `packages/core/src/<domain>/<file>.ts` — kebab-case domains
- **UI**: `packages/ui/src/<category>/<Component>/<Component>.tsx` — PascalCase categories
- **TUI**: `packages/tui/src/views/<View>/<View>.tsx` — PascalCase views
- **Tests**: Co-located as `Foo.test.ts` next to `Foo.ts`
- **Barrels**: Every folder has an `index.ts` that re-exports (no logic)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM only) |
| Language | TypeScript (strict mode) |
| Terminal UI | Ink 5 + React 18 |
| State | Zustand 5 |
| Validation | Zod 3 |
| Server | Hono 4 + ws |
| Mobile | React 18 + Vite 6 + Tailwind 3 |
| Build | Turborepo + tsup |
| Test | Vitest + ink-testing-library |
