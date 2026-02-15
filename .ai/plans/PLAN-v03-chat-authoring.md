# PLAN: v0.3 AI Launcher & AIDF Authoring

## Overview

Instead of building a custom chat engine, DitLoop becomes an **orchestrator** that launches existing AI CLI tools (Claude Code, Aider, etc.) with automatically injected workspace and AIDF context. The developer uses the AI tool they already know, but DitLoop ensures it has the right context. Additionally, AIDF authoring enables creating and editing structured development artifacts from within DitLoop.

## Philosophy

**Don't rebuild the chat — own the context.** Tools like Claude Code, Aider, and Copilot CLI already have excellent streaming, tool use, session management, and UI. DitLoop's value is knowing *which* workspace you're in, *which* AIDF task you're working on, and *which* git identity to use. We inject that context and let the AI tool do what it does best.

## Goals

- Detect available AI CLI tools on the system
- Launch AI CLIs with auto-injected AIDF + workspace context
- Build context from workspace config, AIDF roles/tasks/skills, git status
- TUI view for selecting AI tool + task before launch
- AIDF file creation/editing from TUI
- Template-based scaffolding with variable interpolation
- CLI wizard for quick artifact creation

## Non-Goals

- Custom streaming chat UI (delegated to AI CLI)
- Session/conversation management (delegated to AI CLI)
- Token counting or context window management (delegated to AI CLI)
- Custom tool-use implementation (delegated to AI CLI)
- Voice/audio input
- Remote/server access (v0.4)

## Tasks

### AI Launcher (029-031)

Context building and AI CLI launching in `packages/core/src/launcher/` and `packages/tui/src/views/Launcher/`.

- [ ] `029-context-builder.md` — ContextBuilder: assemble system prompt from workspace/AIDF context, generate temp CLAUDE.md/system-prompt files
- [ ] `030-ai-launcher.md` — AiLauncher: detect installed AI CLIs, spawn with context injection, manage child process lifecycle
- [ ] `031-launcher-view.md` — LauncherView: TUI for selecting AI tool + AIDF task, launch confirmation, return-to-TUI on exit

**029 first, then 030 and 031 parallelizable**

### AIDF Authoring (032-035)

Create AIDF artifacts from TUI and CLI in `packages/core/src/aidf/writer/` and `packages/core/src/aidf/template/`.

- [ ] `032-aidf-writer.md` — AidfWriter: create/update/delete tasks, roles, skills, plans with validation
- [ ] `033-template-engine.md` — TemplateEngine: load templates, {{variable}} interpolation, built-in + custom
- [ ] `034-task-editor-view.md` — TaskEditorView: form editor with preview mode, template integration
- [ ] `035-scaffold-command.md` — `ditloop scaffold` CLI: interactive wizard for task/role/skill/plan creation

**032 and 033 parallelizable** (independent modules)
**034 depends on 032 + 033**
**035 depends on 032 + 033**

## Dependencies

- v0.2 complete (providers, executor, safety)
- Existing AIDF templates in `.ai/templates/`
- AI CLIs installed by user (claude, aider, etc.) — DitLoop detects, not installs

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI CLI not installed | Medium | High | Clear error message, list supported tools, link to install docs |
| CLI flags/APIs change between versions | Medium | Medium | Version detection, minimal flag usage, fallback to basic spawn |
| Context too large for CLI injection | Low | Medium | Smart truncation with priority, split into files vs inline |
| Template syntax conflicts with markdown | Low | Medium | Use {{var}} delimiters, escape mechanism |
| AI-generated AIDF is malformed | Medium | Medium | Strict Zod validation, user review before save |
| Child process cleanup on TUI exit | Medium | Medium | Signal forwarding, graceful shutdown with timeout |

## Success Criteria

- [ ] `ditloop chat` detects and lists available AI CLIs
- [ ] Launches Claude Code with AIDF context injected
- [ ] Context includes workspace role, current task, git status, project structure
- [ ] Launcher view allows selecting AI tool and AIDF task
- [ ] Return to DitLoop TUI after AI CLI exits
- [ ] Can create tasks via TUI editor with all fields
- [ ] Templates render correctly with variable interpolation
- [ ] `ditloop scaffold task` creates valid AIDF file
- [ ] All tests pass
