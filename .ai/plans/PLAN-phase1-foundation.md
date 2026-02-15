# PLAN: Phase 1 — Foundation (Core)

## Overview

Build the core infrastructure that everything else depends on: typed event system, config loading, workspace management, git profile management, and identity verification. All modules live in `@ditloop/core` with zero UI dependencies.

## Goals

- Establish the event-driven communication backbone
- Validate and load user config from `~/.ditloop/config.yml`
- Support single-project and group (multi-project) workspaces with auto-discovery
- CRUD git identity profiles with SSH key management
- Automatically verify and switch git identity per workspace

## Non-Goals

- UI components or terminal rendering (Phase 3)
- AIDF detection or context loading (Phase 2)
- CLI commands (Phase 3)
- Provider/execution engine (v0.2)

## Tasks

### Step 1: Event Bus (001, 006) — DONE

Infrastructure and communication backbone.

- [x] `001-setup-monorepo.md` — pnpm workspaces, Turborepo, tsup, 4 packages wired
- [x] `006-event-bus.md` — Typed EventBus wrapping eventemitter3, 27 event types, singleton

### Step 2: Config System (002) — DONE

Foundation for loading workspaces and profiles.

- [x] `002-config-schema.md` — Zod schemas for profiles, workspaces (single/group), server, defaults. YAML loader with graceful fallback.

### Step 3: Workspace Manager (003)

Load and manage workspaces from config. Can be parallelized with Step 4.

- [ ] `003-workspace-manager.md` — WorkspaceManager class, single + group support, auto-discover `.git` dirs, emit workspace events

**Depends on**: 002 (config schema), 006 (event bus)
**Parallelizable with**: 004

### Step 4: Profile Manager (004)

Git identity CRUD and switching. Can be parallelized with Step 3.

- [ ] `004-profile-manager.md` — ProfileManager class, load from config, switchTo() sets git config + SSH key, emit identity events

**Depends on**: 002 (config schema), 006 (event bus)
**Parallelizable with**: 003

### Step 5: Identity Guard (005)

Pre-commit/pre-push identity verification. Must wait for Step 4.

- [ ] `005-identity-guard.md` — IdentityGuard class, verify identity matches workspace profile, auto-fix with ProfileManager.switchTo(), emit mismatch events

**Depends on**: 004 (profile manager)

## Dependencies

- Node.js 20+ (runtime)
- pnpm (package manager)
- eventemitter3 (event bus)
- zod (schema validation)
- yaml (config parsing)
- simple-git (git operations)
- execa (shell commands for SSH agent)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SSH agent management varies across OS | Med | Med | Abstract behind SSHAgent helper, test on macOS first |
| Group auto-discover slow on large dirs | Low | Low | Limit depth to 1, respect exclude list |
| Git config --local conflicts with --global | Low | Med | Always use --local when inside a repo, document behavior |

## Success Criteria

- [ ] Config loads from YAML with Zod validation (done)
- [ ] EventBus delivers typed events (done)
- [ ] Workspaces resolve from config (single + group with auto-discover)
- [ ] Profiles load, switch git config + SSH key
- [ ] Identity guard detects mismatch and auto-fixes
- [ ] All core tests pass: `pnpm --filter @ditloop/core test`

## Notes

- Steps 3 and 4 are independent — can be worked on in parallel (separate worktrees/agents)
- Step 5 depends on Step 4 completing first
- All modules communicate via EventBus — no direct imports between workspace and profile modules
- Core must remain headless — zero React/Ink dependencies
