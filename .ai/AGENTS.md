# DitLoop — AI Agent Context

## Project Description

DitLoop is a terminal IDE centered on Developer In The Loop (DITL) for developers working across multiple projects and clients. It provides a unified TUI dashboard with workspace management, automatic git identity switching, AI-driven task execution, and a provider-agnostic architecture.

## Architecture

### Monorepo Structure (pnpm + Turborepo)

```
packages/
├── core/       @ditloop/core       Business logic (zero UI deps)
├── ui/         @ditloop/ui         Ink/React components (design system)
├── tui/        @ditloop/tui        Terminal app (composes core + ui)
└── playground/ @ditloop/playground Component catalog
```

### Key Patterns

- **Event-driven**: Core emits typed events, UI subscribes via hooks
- **Provider-agnostic**: Adapter pattern for AI providers (Claude, OpenAI, Cursor, etc.)
- **Layered context**: ditloop config → group AIDF → project AIDF (project wins)
- **Separation**: Core has zero UI deps, UI components are pure/presentational, Views wire things together

### Dependencies Flow

```
@ditloop/tui → @ditloop/ui → (ink, react)
     ↓              ↓
@ditloop/core (zod, execa, simple-git, eventemitter3)
```

## Conventions

- TypeScript strict mode, ESM only
- `.js` extension in all imports
- Components: PascalCase.tsx
- Business logic: kebab-case.ts
- Tests co-located: `*.test.ts`
- Conventional commits: feat/fix/refactor/test/docs/chore

## Boundaries

- `@ditloop/core` MUST NOT import from ink, react, or any UI library
- `@ditloop/ui` components MUST be pure — receive data via props only
- `@ditloop/tui` views connect core (via hooks) to ui (via props)
- Cross-package communication only via the typed EventBus
