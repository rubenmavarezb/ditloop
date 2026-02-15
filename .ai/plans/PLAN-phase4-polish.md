# PLAN: Phase 4 — Polish

## Overview

Final phase of v0.1: set up the component playground as a working tool, run end-to-end integration tests, and ensure everything works together. This phase validates that all previous work integrates correctly.

## Goals

- Deliver a working component playground (`ditloop playground`)
- Verify the complete flow: config → workspaces → AIDF → TUI
- Ensure no regressions across all modules
- Clean up any rough edges from parallel development in Phases 1-3

## Non-Goals

- New features beyond what's already built
- Performance optimization (v0.2)
- CI/CD pipeline (post v0.1)
- npm publishing (post v0.1)

## Tasks

### Step 1: Playground Setup (013)

Component catalog for browsing and previewing UI components.

- [ ] `013-playground-setup.md` — Entry point (`ditloop playground`), catalog view (sidebar with categories + preview), story format (`.story.tsx` with meta + variants), keyboard nav (↑↓ components, v toggle variants, i interactive mode), props documentation display

**Depends on**: Phase 3 Step 1 (UI primitives with stories), Phase 3 Step 2 (Sidebar)

### Step 2: Integration Test (014)

End-to-end verification of the complete v0.1 flow.

- [ ] `014-integration-test.md` — Create temp directory with realistic workspace structure (1 single + 1 group with 2 sub-projects, one with `.ai/`), verify: config loads → workspaces resolve → AIDF detected → profiles assigned → TUI renders sidebar correctly → identity guard works

**Depends on**: All previous phases completed

## Dependencies

- All Phase 1, 2, and 3 modules completed and tested
- ink-testing-library (for TUI integration tests)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Integration issues from parallel Phase 1 development | Med | Med | Run full test suite after merging all Phase 1 branches, fix conflicts early |
| Playground story format not flexible enough | Low | Low | Keep format simple, iterate based on real usage |
| E2E tests flaky due to filesystem timing | Low | Med | Use deterministic temp dirs, avoid race conditions, clean up properly |

## Success Criteria

- [ ] `ditloop playground` launches and shows all UI components
- [ ] Stories render with correct variants for each component
- [ ] Navigation works (browse components, toggle variants)
- [ ] Integration test passes: full config → workspace → AIDF → TUI flow
- [ ] Identity guard integration test: detects mismatch, auto-fixes
- [ ] Context merger integration test: group + project AIDF merges correctly
- [ ] `pnpm test` passes across all packages (0 failures)
- [ ] `pnpm build` succeeds across all packages (4/4)
- [ ] `ditloop --help` shows all available commands

## Notes

- This phase is sequential — playground depends on UI components, integration test depends on everything
- Integration tests are the final quality gate before considering v0.1 done
- After this phase, the project is ready for dogfooding (using DitLoop to develop DitLoop)
- Any bugs found during integration testing should be fixed in this phase, not deferred
