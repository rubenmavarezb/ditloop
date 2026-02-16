# PLAN: v0.8 — DitLoop IDE: Multi-Project AI Workspace

## Vision

Transform DitLoop Desktop from a workspace dashboard into a full-featured IDE centered on multi-project AI-driven development. A single window where developers manage multiple repositories (each with different git identities and AI providers), execute AI tasks with AIDF context, and maintain full control through the Developer In The Loop philosophy.

**Design Reference:** SuperDesign mockups — 5 layout variants (Default, Code Focus, AI Focus, Git Focus, Zen)

**Competitive Positioning:** Like Codex App / Cursor / Windsurf, but:
- Multi-project with tabs (not single-project)
- AI-agnostic (any provider, not locked to one)
- Identity-aware (different git identities per workspace)
- AIDF-powered (structured AI development framework)
- Mobile companion for remote approvals (already built in v0.5)

---

## Architecture

### Current State (v0.7)

- Desktop app (Tauri 2.x) with workspace browsing, git status, AI CLI launching
- Local-first: React frontend → Tauri IPC → Rust commands → filesystem/git
- Multi-window support, command palette, tray, deep links, notifications
- Missing: tabs, embedded terminal, AI chat UI, layout system, themes

### Target State (v0.8)

Same architecture (local-first Tauri), enhanced with:
- Tab-based workspace context switching
- xterm.js terminal with PTY backend (Rust)
- AI Chat component with provider abstraction
- AI Task execution panel with AIDF integration
- Flexible panel layout engine with 5 presets
- Theme system with CSS custom properties
- Enhanced git panel (staging, diff, stash)

### Package Changes

- `@ditloop/web-ui` — Fix build, add shared components (ChatPanel, TerminalPanel, DiffViewer, LayoutEngine)
- `@ditloop/desktop` — Consume new web-ui components, add Rust PTY backend, enhanced views
- `@ditloop/core` — No changes expected (already has all needed logic)

---

## Task Breakdown

### Phase 1: Foundation (Tasks 070–072)

Fix the broken build and establish the layout foundation.

| Task | Name | Priority |
|------|------|----------|
| 070 | Fix web-ui TypeScript build | critical |
| 071 | Desktop layout engine with resizable panels | high |
| 072 | Tab-based workspace switching | high |

### Phase 2: Core Panels (Tasks 073–076)

Build the essential panels that make it an IDE.

| Task | Name | Priority |
|------|------|----------|
| 073 | Embedded terminal (xterm.js + Tauri PTY) | critical |
| 074 | File explorer panel with git status | high |
| 075 | Enhanced Source Control panel | high |
| 076 | Side-by-side diff viewer | medium |

### Phase 3: AI Integration (Tasks 077–079)

The core differentiator — AI-driven development with AIDF.

| Task | Name | Priority |
|------|------|----------|
| 077 | AI Chat panel with multi-provider support | critical |
| 078 | AI Task execution panel with approval workflow | critical |
| 079 | AIDF context manager | high |

### Phase 4: Layout Modes & Themes (Tasks 080–081)

The polish that makes it feel like a real product.

| Task | Name | Priority |
|------|------|----------|
| 080 | Layout presets (Default, Code Focus, AI Focus, Git Focus, Zen) | medium |
| 081 | Theme system with 4 built-in themes | medium |

### Phase 5: Polish & Integration (Tasks 082–084)

Wire everything together into a cohesive experience.

| Task | Name | Priority |
|------|------|----------|
| 082 | Git identity mismatch warnings | high |
| 083 | Enhanced status bar with full context | medium |
| 084 | Keyboard shortcuts system | medium |

---

## Dependencies

```
Phase 1 (Foundation)
  070 (Fix web-ui build)
   └─► 071 (Layout engine) ──► 072 (Tabs)

Phase 2 (Core Panels) — all depend on 071 + 072
  073 (Terminal)       ← independent
  074 (File Explorer)  ← independent
  075 (Source Control)  ← independent
  076 (Diff Viewer)    ← independent (but 075 benefits from it)

Phase 3 (AI Integration) — depends on Phase 2
  077 (AI Chat)         ← depends on layout engine (071)
  078 (Task Execution)  ← depends on 076 (Diff Viewer) + 077
  079 (AIDF Context)    ← depends on 077

Phase 4 (Layout & Themes) — depends on all panels existing
  080 (Layout Presets)  ← depends on 071 + all panels
  081 (Theme System)    ← independent (can start early)

Phase 5 (Polish) — depends on everything
  082 (Identity Warnings) ← depends on 072 + 075
  083 (Status Bar)        ← depends on 072 + 079
  084 (Keyboard Shortcuts) ← depends on all panels
```

**Critical path:** 070 → 071 → 072 → 073 → 077 → 078 → 080 → 084

**Parallelizable:** After 071+072, tasks 073/074/075/076 can run concurrently. Task 081 can start early.

---

## Risks

1. **xterm.js + Tauri PTY** — Most complex integration. Requires Rust PTY management + IPC streaming. Mitigation: use `portable-pty` crate, prototype early.
2. **Layout engine performance** — Resizable panels with many components. Mitigation: virtualize large lists, lazy-load panels.
3. **Multi-provider AI chat** — Each provider has different APIs/capabilities. Mitigation: `@ditloop/core` already has ProviderAdapter abstraction.
4. **State management complexity** — Per-workspace state with tabs. Mitigation: Zustand with workspace-scoped stores.

---

## Success Criteria

- [ ] All 5 layout modes functional and switchable
- [ ] Embedded terminal working with PTY
- [ ] AI Chat with at least 2 providers (Claude + one other)
- [ ] AI Task execution with approval workflow visible in UI
- [ ] Tab-based workspace switching (3+ workspaces simultaneously)
- [ ] Git staging, commit, diff from within the app
- [ ] AIDF context visible and editable per workspace
- [ ] Identity mismatch detection and warning
- [ ] 4 themes selectable
- [ ] All existing 654+ tests still passing
- [ ] Desktop builds on macOS, Windows, Linux

---

## Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1: Foundation | 070–072 | 1 week |
| Phase 2: Core Panels | 073–076 | 2–3 weeks |
| Phase 3: AI Integration | 077–079 | 2 weeks |
| Phase 4: Layout & Themes | 080–081 | 1 week |
| Phase 5: Polish | 082–084 | 1 week |
| **Total** | **070–084** | **~7–8 weeks** |

---

**Plan created:** February 16, 2026
**Version:** v0.8
**Status:** PLANNED
**Depends on:** v0.7 (Desktop App) ✅
**Branch:** `feat/v08-ide`
**Tasks:** 070–084 (15 tasks across 5 phases)
