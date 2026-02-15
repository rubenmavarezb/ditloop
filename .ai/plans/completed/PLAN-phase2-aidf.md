# PLAN: Phase 2 — AIDF Integration

## Overview

Enable DitLoop to detect and load AIDF (`.ai/`) context from projects. This powers the sidebar's task list, role awareness, and context-aware features. Supports both group-level and project-level AIDF with layered merging.

## Goals

- Detect presence and capabilities of `.ai/` folders in any project
- Parse AIDF tasks, roles, skills, and plans from markdown files
- Merge group-level AIDF context with project-level (project wins on conflicts)
- Emit events when AIDF context is loaded

## Non-Goals

- AIDF task execution or AI provider interaction (v0.2)
- Creating or modifying AIDF files (v0.3)
- AIDF template scaffolding (v0.3)
- Chat mode with AIDF context injection (v0.2)

## Tasks

### Step 1: AIDF Detector (007)

Fast detection of what AIDF features are available in a directory.

- [ ] `007-aidf-detector.md` — AidfDetector class, check for `.ai/` subfolders (tasks, roles, skills, plans, templates), return AidfCapabilities object, works for group + project level

**Depends on**: None (standalone module)

### Step 2: Context Loader & Merger (008)

Load all AIDF content and merge layers.

- [ ] `008-context-loader.md` — ContextLoader reads `.ai/` files, TaskParser for task `.md` (frontmatter + sections), RoleLoader, SkillLoader, PlanParser, ContextMerger for group + project layers (project wins), uses gray-matter

**Depends on**: 007 (AIDF detector)

## Dependencies

- gray-matter (markdown + YAML frontmatter parsing)
- Phase 1 completed (config, workspaces needed for knowing which dirs to scan)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AIDF format evolves and breaks parser | Med | Med | Keep parsers flexible, validate gracefully, log warnings on unknown fields |
| Large `.ai/` folders with many tasks slow loading | Low | Low | Lazy load task content, only parse frontmatter for sidebar list |
| Merge conflicts between group and project context | Low | Med | Clear precedence rule: project always wins, log overrides |

## Success Criteria

- [ ] Detector correctly identifies full, partial, and missing AIDF setups
- [ ] Tasks parsed with: title, status, scope, requirements, DoD
- [ ] Roles and skills loaded from their respective directories
- [ ] Plans parsed with phase/task references
- [ ] Merger combines group + project context correctly
- [ ] Events emitted: `aidf:detected`, `aidf:context-loaded`
- [ ] All tests pass: `pnpm --filter @ditloop/core test`

## Notes

- Parsers are independent reimplementations — no dependency on the `aidf` CLI package
- This keeps DitLoop standalone (no `npm install -g aidf` needed)
- AIDF format is simple (markdown + YAML frontmatter), so parsers are straightforward
- Context is loaded lazily when a workspace is entered, not at startup
- Step 1 can start immediately even before Phase 1 is fully done (it's filesystem-only)
