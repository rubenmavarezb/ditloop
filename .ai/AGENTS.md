# DitLoop — AI Agent Context

## Project Description

DitLoop is a terminal IDE centered on Developer In The Loop (DITL) for developers working across multiple projects and clients. It provides a unified TUI dashboard with workspace management, automatic git identity switching, AI-driven task execution, and a provider-agnostic architecture. It includes an HTTP/WebSocket server for remote access and a mobile PWA companion app.

## Architecture

### Monorepo Structure (pnpm + Turborepo)

```
packages/
├── core/       @ditloop/core       Business logic (zero UI deps)
├── ui/         @ditloop/ui         Ink/React components (design system)
├── tui/        @ditloop/tui        Terminal app (CLI + TUI dashboard)
├── server/     @ditloop/server     HTTP/WebSocket API for remote access
├── mobile/     @ditloop/mobile     React PWA companion app
└── playground/ @ditloop/playground Component catalog
```

### Key Patterns

- **Event-driven**: Core emits typed events via `EventBus`, UI subscribes via hooks
- **Provider-agnostic**: Adapter pattern for AI providers (Claude, OpenAI, etc.)
- **Layered context**: ditloop config → group AIDF → project AIDF (project wins)
- **Separation**: Core has zero UI deps, UI components are pure/presentational, Views wire things together
- **Approval flow**: `ActionExecutor` → `ApprovalEngine` → User approval → Execution with trace

### Dependencies Flow

```
@ditloop/tui → @ditloop/ui → (ink, react)
     ↓              ↓
@ditloop/core (zod, execa, simple-git, eventemitter3, yaml, gray-matter, chokidar)
     ↑
@ditloop/server → (hono, ws, web-push)

@ditloop/mobile → (react, react-router-dom, zustand, vite, tailwind, workbox)
@ditloop/playground → @ditloop/ui
```

## Core Domains

| Domain | Key Exports | Purpose |
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

## Server Modules

| Module | Purpose |
|--------|---------|
| `createServer` | Factory to start HTTP/WebSocket server |
| `tokenAuthMiddleware` | Bearer token authentication |
| HTTP routes | REST API for workspaces, profiles, executions, approvals, notifications |
| `WebSocketBridge` | Real-time event streaming |
| `ExecutionMonitor` | Task execution tracking with rate limiting |
| `StateSyncEngine` | Offline-first state sync with conflict resolution |
| `PushNotificationService` | Web push notifications via VAPID |

## TUI Views

| View | Purpose |
|------|---------|
| `Home` | Workspace overview with sidebar navigation |
| `WorkspaceDetail` | Git status, tasks, and actions per workspace |
| `TaskDetail` | Task inspection and metadata |
| `TaskEditor` | Create and edit AIDF tasks |
| `Launcher` | AI CLI launcher with context injection |
| `DiffReview` | Code diff review interface |
| `ExecutionDashboard` | Real-time execution monitoring |

## CLI Commands

```
ditloop                          # Launch TUI dashboard
ditloop init                     # Interactive setup wizard
ditloop workspace list           # List configured workspaces
ditloop profile list             # List configured profiles
ditloop profile current          # Show current git identity
ditloop scaffold [type]          # Scaffold AIDF file (task|role|skill|plan)
ditloop server start|stop|status # Manage HTTP/WebSocket server
ditloop --version / --help
```

## File Organization — Explicit Hierarchical Structure

Every module and component lives in its own **named folder**, organized by **domain** (core) or **category** (ui/tui). Paths must be self-descriptive.

### Structure per package

- **core**: `src/<domain>/<file>.ts` — domains: config, events, workspace, profile, aidf, git, provider, executor, launcher, safety, types. When a domain grows beyond 5 files, split into sub-module folders (e.g., `aidf/detector/`, `aidf/context-loader/`, `aidf/template/`, `aidf/writer/`).
- **ui**: `src/<category>/<ComponentName>/ComponentName.tsx` — categories: primitives, input, composite, data-display. Each component in its own folder with index.ts barrel. Hooks in `src/hooks/`, theme in `src/theme/`.
- **tui**: `src/views/<ViewName>/ViewName.tsx` — one folder per full-screen view. Commands in `src/commands/`, state in `src/state/`, hooks in `src/hooks/`, navigation in `src/navigation/`.
- **server**: `src/<module>/<file>.ts` — modules: api, auth, ws, execution, notifications, sync.
- **mobile**: `src/views/<ViewName>/`, `src/components/<Category>/`, `src/store/`.
- **playground**: `src/stories/<Category>/ComponentName.story.tsx` — mirrors ui categories.

### File suffixes

| Suffix | Purpose | Example |
|--------|---------|---------|
| `.ts` | Main implementation | `profile-manager.ts` |
| `.test.ts` | Co-located tests | `profile-manager.test.ts` |
| `.types.ts` | Shared types (only when 3+ files import them) | `workspace.types.ts` |
| `.constants.ts` | Shared constants (only when 3+ files import them) | `events.constants.ts` |
| `.utils.ts` | Shared utilities (only when 3+ files import them) | `path.utils.ts` |
| `.tsx` | React/Ink component | `Badge.tsx` |
| `.test.tsx` | Component tests | `Badge.test.tsx` |
| `.story.tsx` | Playground stories | `Badge.story.tsx` |

**Default**: types, constants, and utilities live inline with their implementation. Only extract when 3+ files in the same domain share them.

### Mandatory rules

1. One class/component per file
2. Every folder with code MUST have an `index.ts` barrel (re-exports only)
3. Tests co-located next to source (`Foo.test.ts` beside `Foo.ts`)
4. No flat file dumps in `src/` — everything in a domain/category folder
5. New feature = new domain folder with its own `index.ts`
6. Category folders: PascalCase in ui/tui, kebab-case in core
7. Stories mirror the same category structure as ui components
8. **JSDoc on all public APIs** — every exported class, method, interface, function
9. **Named exports only** — never `export default`
10. **Types colocated** — extract to `.types.ts` only when 3+ files share them
11. **Constants colocated** — extract to `.constants.ts` only when 3+ files share them
12. **No preemptive extraction** — don't create suffix files until the threshold is met

### JSDoc standard

Every exported class, method, interface, and function MUST have JSDoc in English:
```typescript
/**
 * Verifies that the active git identity matches the expected profile.
 */
export class IdentityGuard {
  /**
   * Verify identity and auto-fix if mismatch.
   * @param profileName - Profile name from workspace config
   * @param workspace - Workspace identifier
   * @param repoPath - Optional repo path for local git config
   * @returns Verify result (after fix if applied)
   */
  async autoFix(...): Promise<VerifyResult> { ... }
}
```

## Conventions

- TypeScript strict mode, ESM only
- `.js` extension in all imports
- Components: PascalCase.tsx
- Business logic: kebab-case.ts
- Tests co-located: `*.test.ts`
- Conventional commits: feat/fix/refactor/test/docs/chore
- Named exports only — never `export default`
- `export type { }` for type-only re-exports in barrels

## Boundaries

- `@ditloop/core` MUST NOT import from ink, react, or any UI library
- `@ditloop/ui` components MUST be pure — receive data via props only
- `@ditloop/tui` views connect core (via hooks) to ui (via props)
- `@ditloop/server` depends on core only — no UI imports
- `@ditloop/mobile` is a standalone PWA — communicates with server via HTTP/WebSocket
- Cross-package communication only via the typed EventBus
