# Contributing to DitLoop

Thank you for your interest in contributing to DitLoop! This guide covers everything you need to get started.

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 9.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Git** 2.x

## Development Setup

```bash
# Clone the repository
git clone https://github.com/rubenmavarezb/ditloop.git
cd ditloop

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start watch mode (all packages)
pnpm dev
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages via Turborepo |
| `pnpm test` | Run all tests |
| `pnpm dev` | Watch mode for all packages |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm clean` | Remove all `dist/` directories |
| `pnpm playground` | Launch the component playground |

### Working on a Specific Package

```bash
# Build only core
pnpm --filter @ditloop/core build

# Run core tests in watch mode
pnpm --filter @ditloop/core test:watch

# Type check UI package
pnpm --filter @ditloop/ui typecheck
```

## Project Structure

```
ditloop/
├── packages/
│   ├── core/          Business logic (zero UI deps)
│   ├── ui/            Ink/React component library
│   ├── tui/           Terminal app (CLI entry point)
│   ├── server/        HTTP/WebSocket API
│   ├── mobile/        React PWA companion app
│   └── playground/    Component catalog
├── .ai/               AIDF context files
├── docs/              VitePress documentation site
└── turbo.json         Turborepo configuration
```

### Package Dependencies

```
core ← ui ← tui
core ← server
ui ← playground
```

`@ditloop/core` has zero UI dependencies and can be used headless.

## Code Conventions

### TypeScript

- **Strict mode** enabled in all packages
- **ESM only** — no CommonJS
- Always use `.js` extension in import paths (ESM requirement)
- Use relative imports within a package, `@ditloop/*` for cross-package

### File Organization

Every module lives in its own named folder organized by domain (core) or category (ui/tui):

- **Core domains**: `kebab-case` (e.g., `workspace/`, `profile/`)
- **UI categories**: `PascalCase` (e.g., `Common/`, `Layout/`)
- Every folder with code has an `index.ts` barrel file
- One class/component per file
- Tests co-located: `Foo.test.ts` next to `Foo.ts`

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | `PascalCase.tsx` | `Badge.tsx` |
| Hooks | `camelCase` with `use` prefix | `useKeyboard.ts` |
| Business logic | `kebab-case.ts` | `workspace-manager.ts` |
| Tests | `*.test.ts` / `*.test.tsx` | `Badge.test.tsx` |
| Stories | `*.story.tsx` | `Badge.story.tsx` |
| Barrels | `index.ts` | `index.ts` |

### Exports

- **Named exports only** — never use `export default`
- **Separate type exports** — use `export type { Foo }` in barrels
- Barrel files (`index.ts`) only re-export — no logic

### Types & Constants

Types, constants, and utilities live inline with their implementation. Only extract to separate files (`.types.ts`, `.constants.ts`, `.utils.ts`) when 3 or more files in the same domain import them.

### JSDoc

Every public API must have JSDoc documentation in English:

```typescript
/**
 * Manages git identity profiles: list, get, switch, and verify.
 */
export class ProfileManager {
  /**
   * Switch to a named profile and set git config.
   *
   * @param name - Profile name to switch to
   * @param repoPath - Optional path for local git config
   * @throws Error if profile not found
   */
  async switchTo(name: string, repoPath?: string): Promise<void> { ... }
}
```

### Error Handling

- Throw explicit errors for programmer mistakes
- Return `undefined` for expected missing data
- Wrap external commands (execa) in try/catch with graceful degradation
- Never swallow errors silently

## Testing

### Running Tests

```bash
pnpm test                           # All packages
pnpm --filter @ditloop/core test    # Core only
pnpm --filter @ditloop/ui test      # UI only
```

### Test Organization

- Tests are **co-located** with source: `Foo.test.ts` next to `Foo.ts`
- Never create separate `__tests__/` directories
- Core uses **Vitest** for unit and integration tests
- UI uses **Vitest + ink-testing-library** for component tests
- Name test files to match their source: `workspace-manager.test.ts`

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { ProfileManager } from './profile-manager.js';

describe('ProfileManager', () => {
  it('should switch to a named profile', async () => {
    // ...
  });
});
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to Use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring (no behavior change) |
| `test:` | Adding or updating tests |
| `docs:` | Documentation only |
| `chore:` | Build, tooling, dependencies |

### Examples

```
feat: add workspace auto-discovery for git groups
fix: prevent identity guard from crashing on missing SSH key
refactor: extract template engine from AIDF writer
test: add integration tests for config loader
docs: update CLI reference with scaffold command
chore: upgrade ink to v5.1
```

### Rules

- One logical change per commit
- Write clear, descriptive messages
- Reference issue numbers when applicable: `fix: resolve crash on empty config (#42)`

## Branch Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature main
   ```
2. Make your changes with conventional commits
3. Push and open a Pull Request against `main`

### Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code restructuring
- `docs/description` — documentation

## Pull Requests

### What to Include

- **Description**: What changed and why
- **Test plan**: How to verify the changes work
- **Screenshots**: If the change affects the TUI (before/after)

### Checklist

Before submitting a PR, verify:

- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] New public APIs have JSDoc
- [ ] New UI components have a playground story
- [ ] Commits follow conventional commit format

## Code Review

- All PRs require at least one review
- Focus on correctness, clarity, and adherence to conventions
- Be constructive and specific in feedback
- Approve when changes are ready, request changes when they're not

## Questions?

Open an issue on GitHub or check the existing issues for similar questions.
