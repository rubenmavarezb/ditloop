# PLAN: Phase 3 — UI & TUI

## Overview

Build the terminal user interface: reusable Ink/React components in `@ditloop/ui`, the main TUI application shell in `@ditloop/tui`, and the CLI entrypoint with subcommands. This is where the user first sees DitLoop.

## Goals

- Create a design system of reusable terminal UI primitives
- Build the persistent sidebar showing workspaces, projects, and tasks
- Implement the main app layout with view routing
- Wire the CLI entrypoint (`ditloop` command) with subcommands

## Non-Goals

- Chat view or execution view (v0.2)
- Source control view or file explorer (v0.2)
- Diff view (v0.2)
- Mission control / multi-workspace view (v0.2)
- Mobile-responsive or web rendering

## Tasks

### Step 1: UI Primitives (009)

Base building blocks for all views.

- [ ] `009-ui-primitives.md` — Panel, SplitView, Header, Breadcrumb (`◉ ditloop ❯ Pivotree ❯ #042`), StatusBadge, ShortcutsBar, Divider, ThemeProvider + default color scheme. Each component gets a `.story.tsx`.

**Depends on**: None (pure UI, no core dependency)

### Step 2: Sidebar Component (010)

The persistent left panel — backbone of navigation.

- [ ] `010-sidebar-component.md` — Sidebar with scrollable workspace tree, WorkspaceItem (collapsable, status indicator), TaskItem (status, title, relative time), keyboard navigation (↑↓→←), collapse with ctrl+b, SelectList for focus management

**Depends on**: 009 (UI primitives — Panel, StatusBadge)

### Step 3: Home View & App Layout (011)

Main application shell that composes everything.

- [ ] `011-home-view.md` — App.tsx root (ThemeProvider, core init), layout (sidebar left + main area right + shortcuts bottom), HomeView (welcome + quick actions), TaskDetailView, Router for main area, NavigationContext, AppContext bridging core to UI, global keyboard shortcuts (1-9 workspace, q quit)

**Depends on**: 009 (primitives), 010 (sidebar), Phase 1 (WorkspaceManager, ProfileManager), Phase 2 (AIDF context)

### Step 4: CLI Entrypoint (012)

The `ditloop` command users run.

- [ ] `012-cli-entrypoint.md` — Default: launch TUI, `ditloop init`: create `~/.ditloop/config.yml` wizard, `ditloop workspace add/list`, `ditloop profile add/list/current`, `--version`, `--help`

**Depends on**: 011 (home view for default command), Phase 1 (config, workspace, profile managers)

## Dependencies

- ink ^5.1.0 (React for terminal)
- react ^18.3.0
- @inkjs/ui (utility components)
- zustand (state management)
- fuse.js (fuzzy search for file explorer, future)
- ink-testing-library (component tests)
- Phase 1 + Phase 2 core modules

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ink 5 rendering quirks with complex layouts | Med | Med | Test each primitive in isolation first, use playground for visual debugging |
| Terminal size variations break layout | Med | Med | Use responsive SplitView ratios, min-width checks, graceful fallback |
| State sync between core events and React | Low | Med | Zustand subscriptions to EventBus, single source of truth in core |
| CLI argument parsing complexity | Low | Low | Use simple flag parsing or lightweight library (e.g., citty) |

## Success Criteria

- [ ] All 7 UI primitives render correctly in terminal
- [ ] Sidebar shows workspace tree with correct nesting and status
- [ ] Keyboard navigation works throughout (↑↓→← in sidebar, global shortcuts)
- [ ] Home view shows welcome screen, navigating to workspace shows tasks
- [ ] Profile auto-switches when entering a workspace
- [ ] `ditloop` launches the TUI
- [ ] `ditloop init` creates a config file interactively
- [ ] `ditloop workspace list` and `ditloop profile list` work
- [ ] `ditloop --version` and `ditloop --help` work
- [ ] All component and integration tests pass

## Notes

- Step 1 (primitives) can start independently — no core dependency
- Step 2 needs Step 1's Panel and StatusBadge
- Step 3 is the integration point — connects core + UI
- Step 4 is mostly wiring — depends on Step 3 for the TUI, and Phase 1 for non-TUI commands
- Every UI component must have a playground story before being considered done
- Views live in `@ditloop/tui`, components in `@ditloop/ui` — never mix
