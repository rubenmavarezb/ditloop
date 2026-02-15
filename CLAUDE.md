# CLAUDE.md — DitLoop

## Project Overview

DitLoop is a terminal IDE centered on Developer In The Loop for developers who work across multiple projects. It provides workspace management, git identity automation, AI-driven task execution, and a TUI dashboard — all from a single terminal window.

## Architecture

Monorepo with 4 packages:
- `@ditloop/core` — Business logic, zero UI deps (workspace, profiles, providers, AIDF, git, events)
- `@ditloop/ui` — Ink/React component library (design system for terminal)
- `@ditloop/tui` — Terminal app that composes core + ui
- `@ditloop/playground` — Component catalog (Storybook for TUI)

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm with workspaces
- **Build**: Turborepo + tsup (ESM only)
- **Test**: Vitest + ink-testing-library
- **UI**: Ink 5 + React 18
- **State**: Zustand
- **Validation**: Zod

## File Organization — Explicit Hierarchical Structure

Every module, component, and feature lives in its own **named folder** organized by **category**. Paths must be self-descriptive — an AI or developer should understand what a file does just by reading its path.

### Core pattern

```
packages/<package>/src/<domain>/<module>/
```

Each domain groups related modules. Each module is a folder containing its implementation, types, and tests.

### @ditloop/core structure

```
packages/core/src/
├── config/                     # Configuration domain
│   ├── schema.ts               # Zod schemas + types
│   ├── schema.test.ts
│   ├── loader.ts               # YAML config loader
│   ├── loader.test.ts
│   └── index.ts                # Public API barrel
├── events/                     # Event system domain
│   ├── events.ts               # Event type definitions
│   ├── event-bus.ts            # EventBus class
│   ├── event-bus.test.ts
│   └── index.ts
├── workspace/                  # Workspace domain
│   ├── workspace-manager.ts    # WorkspaceManager class
│   ├── workspace-manager.test.ts
│   ├── group-resolver.ts       # Group auto-discovery
│   ├── group-resolver.test.ts
│   └── index.ts
├── profile/                    # Identity domain
│   ├── profile-manager.ts      # ProfileManager class
│   ├── profile-manager.test.ts
│   ├── ssh-agent.ts            # SSH key management
│   ├── ssh-agent.test.ts
│   ├── identity-guard.ts       # Identity verification
│   ├── identity-guard.test.ts
│   └── index.ts
├── aidf/                       # AIDF integration domain (Phase 2)
│   ├── detector/               # Sub-module: .ai/ folder detection
│   │   ├── detector.ts
│   │   ├── detector.test.ts
│   │   └── index.ts
│   ├── context-loader/         # Sub-module: context loading + merging
│   │   ├── context-loader.ts
│   │   ├── context-loader.test.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts                    # Package barrel
```

### @ditloop/ui structure

```
packages/ui/src/
├── components/
│   ├── Common/                 # Shared/reusable primitives
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   ├── Badge.test.tsx
│   │   │   └── index.ts
│   │   ├── StatusDot/
│   │   │   ├── StatusDot.tsx
│   │   │   ├── StatusDot.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── Layout/                 # Layout primitives
│   │   ├── Panel/
│   │   │   ├── Panel.tsx
│   │   │   └── index.ts
│   │   ├── Divider/
│   │   │   ├── Divider.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── Workspace/              # Workspace-related components
│   │   ├── WorkspaceCard/
│   │   │   ├── WorkspaceCard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts                # All components barrel
├── hooks/                      # Shared hooks
│   ├── useKeyboard.ts
│   └── index.ts
├── theme/                      # Theme/color tokens
│   ├── colors.ts
│   └── index.ts
└── index.ts
```

### @ditloop/tui structure

```
packages/tui/src/
├── views/                      # Full-screen views (one per route)
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── Home.test.tsx
│   │   └── index.ts
│   ├── WorkspaceDetail/
│   │   ├── WorkspaceDetail.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/                      # App-level hooks (wire core → ui)
│   ├── useWorkspaces.ts
│   └── index.ts
├── app.tsx                     # Root app component
└── index.ts
```

### @ditloop/playground structure

```
packages/playground/src/
├── stories/
│   ├── Common/                 # Stories mirror ui/ categories
│   │   ├── Badge.story.tsx
│   │   └── StatusDot.story.tsx
│   ├── Layout/
│   │   └── Panel.story.tsx
│   └── index.ts
└── index.ts
```

### File suffixes convention

Each file has ONE purpose. Use these suffixes to make intent explicit:

| Suffix | When to use | Example |
|--------|-------------|---------|
| `.ts` | Main implementation (class, function, logic) | `profile-manager.ts` |
| `.test.ts` | Unit/integration tests (co-located) | `profile-manager.test.ts` |
| `.types.ts` | **Only** when types are shared across 3+ files in a domain | `workspace.types.ts` |
| `.constants.ts` | **Only** when constants are shared across 3+ files in a domain | `events.constants.ts` |
| `.utils.ts` | **Only** when utilities are shared across 3+ files in a domain | `path.utils.ts` |
| `.tsx` | React/Ink component implementation | `Badge.tsx` |
| `.test.tsx` | Component tests | `Badge.test.tsx` |
| `.story.tsx` | Playground stories | `Badge.story.tsx` |
| `.css` | Not used — Ink uses inline styles via objects | — |

**Default rule**: Types, constants, and utilities live **inline** in the file that defines them. Only extract to a `.types.ts` / `.constants.ts` / `.utils.ts` when **3 or more files** in the same domain need to import them. Never create these files preemptively.

**Examples**:
- `VerifyResult` interface → stays in `identity-guard.ts` (only used there + tests)
- `DitLoopEventMap` type → stays in `events.ts` (it IS the main export of that file)
- `DEFAULT_CONFIG_PATH` → stays in `loader.ts` (only used by loader + tests)
- If `workspace/` had 4 files all importing `WorkspaceStatus` → extract to `workspace/workspace.types.ts`

### JSDoc documentation (MANDATORY)

Every public API must have JSDoc. This is non-negotiable — it enables AI tools and IDEs to understand the codebase instantly.

**What MUST have JSDoc:**
- Every exported class (summary of purpose)
- Every public method (description + `@param` + `@returns` + `@throws` if applicable)
- Every exported interface/type (one-line description)
- Every exported function (description + `@param` + `@returns`)
- Every exported constant (one-line description if not self-evident)

**What does NOT need JSDoc:**
- Private methods (unless complex)
- Test files
- Barrel `index.ts` files
- Zod schemas (they are self-documenting via `.describe()`)

**JSDoc style:**

```typescript
/**
 * Manages git identity profiles: list, get, switch, and resolve from workspace config.
 */
export class ProfileManager {
  /**
   * Switch to a named profile. Sets git config user.name and user.email,
   * optionally loads SSH key, and emits profile:switched event.
   *
   * @param name - Profile name to switch to
   * @param repoPath - If provided, sets --local git config; otherwise --global
   * @throws Error if profile is not found in config
   */
  async switchTo(name: string, repoPath?: string): Promise<void> { ... }
}

/** Resolved workspace entry with its sub-projects (if group). */
export interface ResolvedWorkspace { ... }

/** Default path to the DitLoop config directory (~/.ditloop). */
export const DEFAULT_CONFIG_DIR = join(homedir(), '.ditloop');
```

**Rules:**
- Language: English only, never Spanish
- First line: imperative summary ("Manages...", "Verifies...", "Loads...")
- `@param` on its own line with ` - ` separator
- `@returns` only when return type isn't obvious from the signature
- `@throws` always when a method can throw

### Export patterns

- **Named exports only** — never use `export default`
- **Separate type exports** — use `export type { Foo }` for types in barrel files
- **Barrel files re-export only** — no logic, no re-processing

```typescript
// ✅ CORRECT barrel (index.ts)
export { ProfileManager } from './profile-manager.js';
export { SSHAgent } from './ssh-agent.js';
export type { VerifyResult } from './identity-guard.js';

// ❌ WRONG — default export
export default class ProfileManager { ... }

// ❌ WRONG — logic in barrel
import { ProfileManager } from './profile-manager.js';
export const pm = new ProfileManager(); // NO!
```

### Type organization

- **Types live with their implementation** — `VerifyResult` in `identity-guard.ts`, not in a separate file
- **Zod schemas infer types** — `export type Profile = z.infer<typeof ProfileSchema>`
- **Pure type files are OK** when the file IS the types (e.g., `events.ts` defines event type maps)
- **Extract to `.types.ts` ONLY** when 3+ files in the same domain import the same types

### Constants organization

- **Constants live with their logic** — `DEFAULT_CONFIG_PATH` in `loader.ts`
- **Extract to `.constants.ts` ONLY** when 3+ files in the same domain import the same constants
- **Always export with `const`** — never `let` for constants
- **Name format**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for derived values

### Error handling

- **Throw explicit errors** for programmer mistakes: `throw new Error('Profile "x" not found')`
- **Return undefined** for expected missing data: `get(name)` returns `Profile | undefined`
- **Graceful degradation** for external commands: wrap `execa` calls in try/catch, return `undefined` on failure
- **Never swallow errors silently** — always return a value or re-throw

### Rules (MANDATORY — follow strictly)

1. **One class/component per file** — never put two public classes in one file
2. **Folder = module boundary** — every folder with code MUST have an `index.ts` barrel
3. **Tests co-located** — `Foo.test.ts` lives next to `Foo.ts`, never in a separate `__tests__/` dir
4. **Name matches export** — file `profile-manager.ts` exports `ProfileManager`, file `Badge.tsx` exports `Badge`
5. **No flat dumps** — never add files directly to `src/`. Everything goes into a domain/category folder
6. **Category folders are PascalCase** in ui/tui (e.g., `Common/`, `Layout/`, `Workspace/`) and **kebab-case** in core (e.g., `config/`, `workspace/`, `profile/`)
7. **Sub-modules** — when a domain grows beyond 5 files, split into sub-module folders (like `aidf/detector/`, `aidf/context-loader/`)
8. **Stories mirror components** — playground stories follow the same category structure as `@ditloop/ui`
9. **New domain = new folder** — adding a feature? Create `packages/core/src/<domain>/` with its own `index.ts`
10. **Barrel re-exports only** — `index.ts` files only re-export, no logic
11. **JSDoc on all public APIs** — every exported class, method, interface, function, and non-obvious constant
12. **Named exports only** — never use `export default`
13. **Types colocated** — extract to `.types.ts` only when 3+ files share them
14. **Constants colocated** — extract to `.constants.ts` only when 3+ files share them
15. **No preemptive extraction** — don't create `.types.ts`, `.constants.ts`, `.utils.ts` until the threshold is met

## Code Conventions

### Imports
- Use relative imports within a package
- Use `@ditloop/core`, `@ditloop/ui` for cross-package imports
- Always use `.js` extension in import paths (ESM requirement)

### File naming
- Components: `PascalCase.tsx` (e.g., `Badge.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useKeyboard.ts`)
- Core logic: `kebab-case.ts` (e.g., `workspace-manager.ts`)
- Tests: co-located as `*.test.ts` or `*.test.tsx`
- Shared types: `<domain>.types.ts` (e.g., `workspace.types.ts`) — only when 3+ files share them
- Shared constants: `<domain>.constants.ts` — only when 3+ files share them
- Shared utilities: `<domain>.utils.ts` — only when 3+ files share them
- Stories: `ComponentName.story.tsx`
- Barrels: always `index.ts`

### Comments & language
- Code comments and JSDoc: English
- User-facing strings in the TUI: English

### Components
- All UI components live in `@ditloop/ui`, NOT in `@ditloop/tui`
- Views (full-screen layouts) live in `@ditloop/tui/src/views/`
- Every UI component should have a `.story.tsx` in the playground
- Components receive data via props, connect to core via hooks in the view layer

### Core
- Zero dependency on React/Ink — core must work headless
- All cross-module communication via EventBus (typed events)
- All config validated with Zod schemas
- All file parsing uses gray-matter for markdown + frontmatter

### Testing
- Core: unit tests with Vitest, integration tests with temp git repos
- UI: component tests with ink-testing-library
- Playground: stories serve as visual tests

## AIDF

This project uses AIDF for its own development. See `.ai/` folder for:
- `AGENTS.md` — project context for AI assistants
- `tasks/` — structured development tasks with scope and DoD
- `roles/` — AI personas for different types of work
- `plans/` — multi-task initiatives

## Scope Discipline

Only modify files within the scope defined by the current AIDF task. Do not touch other packages unless the task explicitly allows it.

## Git

- Default branch: `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One logical change per commit
