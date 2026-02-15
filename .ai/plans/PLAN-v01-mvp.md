# PLAN: v0.1 MVP — Overview

## Overview

Build the foundation of DitLoop: a working terminal IDE with workspace management, git identity automation, AIDF integration, and a TUI dashboard. This plan is split into 4 phases, each with its own detailed plan.

## Goals

- Deliver a functional `ditloop` CLI that launches a TUI with workspace sidebar
- Support single and group workspaces with auto-discovery
- Automate git identity switching per workspace/project
- Detect and load AIDF context from `.ai/` folders
- Provide a component playground for UI development

## Non-Goals

- Chat mode / AI provider integration (v0.2)
- Execution engine / task runner (v0.2)
- Approval workflow (v0.2)
- Mobile PWA / server (v0.4)
- Desktop app (v0.5)

## Phases

- [x] **Phase 1: Foundation** — `completed/PLAN-phase1-foundation.md` — Core infrastructure (EventBus, Config, Workspaces, Profiles, Identity Guard)
- [ ] **Phase 2: AIDF Integration** — `PLAN-phase2-aidf.md` — Detect and load AIDF context
- [ ] **Phase 3: UI & TUI** — `PLAN-phase3-ui-tui.md` — Terminal components, sidebar, home view, CLI
- [ ] **Phase 4: Polish** — `PLAN-phase4-polish.md` — Playground, integration tests, cleanup

## Success Criteria

- [ ] `ditloop` launches and shows a sidebar with workspaces
- [ ] Workspaces load from `~/.ditloop/config.yml` (single + group)
- [ ] AIDF tasks appear in sidebar when `.ai/` is present
- [ ] Git profile auto-switches on workspace enter
- [ ] `ditloop playground` shows all components
- [ ] All tests pass
