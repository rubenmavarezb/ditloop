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

## Code Conventions

### Imports
- Use relative imports within a package
- Use `@ditloop/core`, `@ditloop/ui` for cross-package imports
- Always use `.js` extension in import paths (ESM requirement)

### File naming
- Components: PascalCase.tsx (e.g., `Sidebar.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useKeyboard.ts`)
- Everything else: kebab-case.ts (e.g., `workspace-manager.ts`)
- Tests: co-located as `*.test.ts` or `*.test.tsx`

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
