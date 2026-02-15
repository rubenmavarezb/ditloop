# PLAN: v0.1 MVP

## Objective
Build the foundation of HitLoop: monorepo, config system, workspace management, git profiles, AIDF detection, basic TUI with sidebar, and component playground.

## Tasks (in order)

### Phase 1: Foundation (Core)
1. [001] Setup Monorepo — pnpm, turbo, tsconfig, packages
2. [006] Typed Event Bus — central communication system
3. [002] Config Schema & Loader — Zod-validated config
4. [003] Workspace Manager — single, group, auto-discover
5. [004] Profile Manager — git identity CRUD
6. [005] Identity Guard — pre-commit verification

### Phase 2: AIDF Integration (Core)
7. [007] AIDF Detector — detect .ai/ folders
8. [008] Context Loader & Merger — load and merge AIDF context

### Phase 3: UI & TUI
9. [009] UI Primitives — Panel, SplitView, Header, etc.
10. [010] Sidebar Component — persistent workspace tree
11. [011] Home View & App Layout — main app shell
12. [012] CLI Entrypoint & Commands — hitloop command

### Phase 4: Polish
13. [013] Playground Setup — component catalog
14. [014] Integration Test — end-to-end verification

## Success Criteria
- `hitloop` launches and shows a sidebar with workspaces
- Workspaces load from config (single + group)
- AIDF tasks appear in the sidebar when .ai/ is present
- Git profile auto-switches on workspace enter
- `hitloop playground` shows all components
- All tests pass
