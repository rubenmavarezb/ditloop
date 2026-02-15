# PLAN: v0.3 Chat & AIDF Authoring

## Overview

Add conversational AI and AIDF creation capabilities. Chat with AI about your project with automatic context injection. Create and edit AIDF artifacts (tasks, roles, skills, plans) from within DitLoop.

## Goals

- Full-featured chat interface with streaming responses
- Automatic AIDF + workspace context injection
- Session persistence and resumption
- AIDF file creation/editing from TUI
- Template-based scaffolding with variable interpolation
- CLI wizard for quick artifact creation

## Non-Goals

- Voice/audio input (text-only)
- Multi-modal interactions (images)
- Real-time collaboration
- Custom system prompt editing
- Remote/server access (v0.4)
- Mobile (v0.5)

## Tasks

### Chat Interface (029-031)

Conversational AI in `packages/core/src/chat/` and `packages/tui/src/views/Chat/`. Context-aware assistance with streaming.

- [ ] `029-chat-engine.md` — ChatEngine: message history, streaming via ProviderAdapter, tool calls, events
- [ ] `030-chat-view.md` — ChatView: message list, input area, code highlighting, streaming indicator
- [ ] `031-context-injector.md` — ContextInjector: build system prompt from workspace/AIDF context, smart truncation

**Depends on**: v0.2 Phase 7 (providers), Phase 8 (executor for tool calls)
**030 and 031 parallelizable** (both depend on 029)

### Session Management (032-033)

Persist and resume conversations in `packages/core/src/session/` and `packages/tui/src/views/Session/`.

- [ ] `032-session-store.md` — SessionStore: CRUD, JSON persistence in ~/.ditloop/sessions/, auto-save, events
- [ ] `033-session-picker-view.md` — SessionPickerView: list, preview, resume, delete, filters

**Depends on**: 029-031 (chat interface)

### AIDF Authoring (034-037)

Create AIDF artifacts from TUI and CLI in `packages/core/src/aidf/writer/` and `packages/core/src/aidf/template/`.

- [ ] `034-aidf-writer.md` — AidfWriter: create/update/delete tasks, roles, skills, plans with validation
- [ ] `035-task-editor-view.md` — TaskEditorView: form editor with preview mode, template integration
- [ ] `036-template-engine.md` — TemplateEngine: load templates, {{variable}} interpolation, built-in + custom
- [ ] `037-scaffold-command.md` — `ditloop scaffold` CLI: interactive wizard for task/role/skill/plan creation

**034 and 036 parallelizable** (independent modules)
**035 depends on 034 + 036**
**037 depends on 034 + 036**

## Dependencies

- v0.2 complete (providers, executor, safety)
- `uuid` (session IDs)
- Syntax highlighting library for chat code blocks
- Existing AIDF templates in `.ai/templates/`

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Token limit exceeded with large context | High | Medium | Smart truncation with priority, show context size |
| Session storage grows unbounded | Medium | Medium | Auto-archive old sessions, size limits |
| Template syntax conflicts with markdown | Low | Medium | Use {{var}} delimiters, escape mechanism |
| AI-generated AIDF is malformed | Medium | Medium | Strict Zod validation, user review before save |

## Success Criteria

- [ ] Chat with streaming responses works in TUI
- [ ] AIDF context automatically injected into conversations
- [ ] Sessions persist and resume with full history
- [ ] Can create tasks via TUI editor with all fields
- [ ] Templates render correctly with variable interpolation
- [ ] `ditloop scaffold task` creates valid AIDF file
- [ ] All tests pass
