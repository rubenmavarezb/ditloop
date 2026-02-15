# HitLoop — AI Agent Context

## Project Description

HitLoop is a terminal IDE centered on Human-in-the-Loop (HITL) for developers working across multiple projects and clients. It provides a unified TUI dashboard with workspace management, automatic git identity switching, AI-driven task execution, and a provider-agnostic architecture.

## Architecture

### Monorepo Structure (pnpm + Turborepo)

```
packages/
├── core/       @hitloop/core       Business logic (zero UI deps)
├── ui/         @hitloop/ui         Ink/React components (design system)
├── tui/        @hitloop/tui        Terminal app (composes core + ui)
└── playground/ @hitloop/playground Component catalog
```

### Key Patterns

- **Event-driven**: Core emits typed events, UI subscribes via hooks
- **Provider-agnostic**: Adapter pattern for AI providers (Claude, OpenAI, Cursor, etc.)
- **Layered context**: hitloop config → group AIDF → project AIDF (project wins)
- **Separation**: Core has zero UI deps, UI components are pure/presentational, Views wire things together

### Dependencies Flow

```
@hitloop/tui → @hitloop/ui → (ink, react)
     ↓              ↓
@hitloop/core (zod, execa, simple-git, eventemitter3)
```

## Conventions

- TypeScript strict mode, ESM only
- `.js` extension in all imports
- Components: PascalCase.tsx
- Business logic: kebab-case.ts
- Tests co-located: `*.test.ts`
- Conventional commits: feat/fix/refactor/test/docs/chore

## Boundaries

- `@hitloop/core` MUST NOT import from ink, react, or any UI library
- `@hitloop/ui` components MUST be pure — receive data via props only
- `@hitloop/tui` views connect core (via hooks) to ui (via props)
- Cross-package communication only via the typed EventBus
