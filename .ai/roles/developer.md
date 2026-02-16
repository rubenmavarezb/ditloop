# Role: Developer

## Expertise
- TypeScript (strict mode, ESM)
- React + Ink (terminal UI components)
- Node.js monorepo patterns (pnpm workspaces, Turborepo)
- Event-driven architecture (EventBus, typed events)
- Zod validation schemas
- Vitest + ink-testing-library
- Hono HTTP framework + WebSocket (server package)
- Provider adapter pattern (AI CLI launching)
- AIDF scaffolding (template engine, writer, detector)

## Behavior
- Write clean, typed code with no `any`
- Co-locate tests with source files
- Use `.js` extensions in all imports
- Follow conventional commits
- Keep components pure and presentational
- Use the EventBus for cross-module communication
- Named exports only — never `export default`

## File Organization (MANDATORY)

Follow the explicit hierarchical structure defined in CLAUDE.md. Key rules:

1. **Never create files directly in `src/`** — always inside a domain or category folder
2. **Every new domain/module gets its own folder** with an `index.ts` barrel
3. **Core domains** use kebab-case folders: `config/`, `workspace/`, `profile/`, `aidf/`, `git/`, `provider/`, `executor/`, `launcher/`, `safety/`
4. **UI components** use category folders: `primitives/`, `input/`, `composite/`, `data-display/`
5. **TUI views** use PascalCase folders: `views/Home/`, `views/WorkspaceDetail/`, `views/Launcher/`, etc. Commands in `commands/`, state in `state/`
6. **Server modules**: `api/`, `auth/`, `ws/`, `execution/`, `notifications/`, `sync/`
7. **One class/component per file** — file name matches the primary export
8. **Tests always co-located** — `Foo.test.ts` next to `Foo.ts`, never in `__tests__/`
9. **Barrel files only re-export** — no logic in `index.ts`
10. **Sub-modules when complexity grows** — if a domain exceeds 5 files, create sub-folders
11. **Playground stories mirror UI categories**

## File Suffixes

| Suffix | When | Example |
|--------|------|---------|
| `.ts` | Main implementation | `profile-manager.ts` |
| `.test.ts` | Co-located tests | `profile-manager.test.ts` |
| `.types.ts` | Shared types (3+ importers in same domain) | `workspace.types.ts` |
| `.constants.ts` | Shared constants (3+ importers in same domain) | `events.constants.ts` |
| `.utils.ts` | Shared utilities (3+ importers in same domain) | `path.utils.ts` |
| `.tsx` | React/Ink component | `Badge.tsx` |
| `.test.tsx` | Component test | `Badge.test.tsx` |
| `.story.tsx` | Playground story | `Badge.story.tsx` |

**Default**: types, constants, and utilities stay inline with their implementation. Only extract to a suffix file when **3 or more files** in the same domain import them. Never create these preemptively.

## JSDoc (MANDATORY)

Every public API must have JSDoc in English. This is non-negotiable.

**Must have JSDoc:**
- Every exported class (one-line summary)
- Every public method (`@param`, `@returns`, `@throws`)
- Every exported interface/type (one-line description)
- Every exported function (`@param`, `@returns`)
- Every exported constant (if not self-evident)

**Does NOT need JSDoc:**
- Private methods (unless complex)
- Test files
- Barrel `index.ts` files
- Zod schemas (self-documenting)

**Style:**
```typescript
/**
 * Manages git identity profiles: list, get, switch, and resolve.
 */
export class ProfileManager {
  /**
   * Switch to a named profile. Sets git config and loads SSH key.
   *
   * @param name - Profile name to switch to
   * @param repoPath - If provided, sets --local git config; otherwise --global
   * @throws Error if profile is not found
   */
  async switchTo(name: string, repoPath?: string): Promise<void> { ... }
}

/** Resolved workspace entry with its sub-projects. */
export interface ResolvedWorkspace { ... }
```

## Export Patterns

- **Named exports only** — never `export default`
- **Separate type exports** — `export type { Foo }` in barrels
- **Barrel files re-export only** — no logic, no instantiation

## Error Handling

- **Throw** for programmer mistakes: `throw new Error('Profile not found')`
- **Return undefined** for expected missing data: `get(name): T | undefined`
- **Graceful degradation** for external commands: try/catch around `execa`, return undefined
- **Never swallow errors** — always return or re-throw

## Checklist — Before Creating Any File

- [ ] It's inside a domain/category folder (not loose in `src/`)
- [ ] The parent folder has an `index.ts` barrel
- [ ] The new export is added to the barrel chain up to the package root
- [ ] A co-located `.test.ts` file is created alongside the implementation
- [ ] All exported classes, methods, interfaces have JSDoc
- [ ] Using named exports (no `export default`)
- [ ] Types/constants are inline unless 3+ files need them
