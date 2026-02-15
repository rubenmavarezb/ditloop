# PLAN: v0.2 Execution Engine

## Overview

Transform DitLoop from a dashboard into an execution tool. Users select a workspace, pick a task, AI executes it, user reviews diffs, approves or rejects. The "Developer In The Loop" experience.

## Goals

- Git operations from within DitLoop (status, commit, push, branch)
- Workspace detail view with developer context dashboard
- Provider-agnostic AI integration (Claude, OpenAI, local models)
- AI-driven task execution with streaming output
- Human approval workflow for all AI-proposed changes

## Non-Goals

- Chat/conversational mode (v0.3)
- AIDF file creation/editing (v0.3)
- Remote/server access (v0.4)
- Mobile (v0.5)

## Tasks

### Git Operations (015-017)

Git module wrapping simple-git in `packages/core/src/git/`. Identity validation before write operations. All operations emit events via EventBus.

- [ ] `015-git-status-reader.md` — GitStatusReader: branch, ahead/behind, staged/unstaged/untracked, isDirty, poll mode
- [ ] `016-git-commit-manager.md` — GitCommitManager: stage, commit (conventional format), amend, identity validation
- [ ] `017-git-branch-manager.md` — GitBranchManager: create/switch/delete, detectDefaultBranch, push/pull

**Depends on**: Phase 1 (IdentityGuard, EventBus)
**016 and 017 parallelizable** (both depend on 015)

### Workspace Detail (018-019)

Developer context dashboard in `packages/tui/src/views/WorkspaceDetail/`. NOT a file browser — shows git status, identity health, AIDF tasks, quick actions.

- [ ] `018-workspace-detail-view.md` — 4-panel layout: git status, identity, AIDF tasks, quick actions. Real-time event updates.
- [ ] `019-workspace-navigation.md` — Wire sidebar → WorkspaceDetail, breadcrumb, state management, keyboard routing

**Depends on**: 015-017 (git module), Phase 2 (AIDF context), Phase 3 (UI components)

### Provider Adapters (020-022)

Provider-agnostic AI integration in `packages/core/src/provider/`. Adapter pattern for streaming, tool use, AIDF context injection.

- [ ] `020-provider-interface.md` — ProviderAdapter interface, ProviderRegistry, extend config schema
- [ ] `021-claude-adapter.md` — ClaudeAdapter with @anthropic-ai/sdk, streaming, tool use
- [ ] `022-openai-adapter.md` — OpenAIAdapter with openai SDK, validates abstraction works

**Depends on**: Phase 1 (Config system)
**021 and 022 parallelizable** (both depend on 020)

### Task Executor (023-025)

Execution engine in `packages/core/src/executor/`. Takes AIDF task + provider + workspace, orchestrates AI execution, parses actions, manages sessions.

- [ ] `023-execution-engine.md` — ExecutionEngine: build prompt from AIDF, stream AI response, emit events
- [ ] `024-action-parser.md` — ActionParser: extract file edits, shell commands, git ops from AI output
- [ ] `025-execution-session.md` — ExecutionSession: multi-turn, history, action tracking, persistence

**Depends on**: 020-022 (providers), Phase 2 (AIDF context), 015 (git status)
**024 and 025 parallelizable** (both depend on 023)

### Safety & DITL Approval (026-028)

Developer In The Loop in `packages/core/src/safety/` and `packages/tui/src/views/DiffReview/`. Every AI action requires human approval.

- [ ] `026-approval-engine.md` — ApprovalEngine: queue actions, approve/reject/edit, events
- [ ] `027-diff-review-view.md` — DiffReviewView: unified diff, risk badges, y/n/e/a keyboard
- [ ] `028-action-executor.md` — ActionExecutor: execute approved actions, sandbox, rollback

**Depends on**: 023-025 (executor), 015-017 (git for git actions)
**027 and 028 parallelizable** (both depend on 026)

## Dependencies

- `simple-git` ^3.x (git operations)
- `@anthropic-ai/sdk` (Claude adapter)
- `openai` ^4.x (OpenAI adapter)
- `execa` (shell commands in ActionExecutor)
- `diff` or `fast-diff` (diff generation)
- v0.1 complete

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI produces malformed tool calls | High | Medium | Robust parsing with fallback, validate schemas |
| Identity validation blocks legitimate ops | Medium | High | Override flag, clear error messages |
| Shell command escapes sandbox | Low | Critical | Strict validation, whitelist safe commands |
| Provider SDK breaking changes | Medium | High | Pin versions, add upgrade tests |
| Race conditions with concurrent git ops | Medium | High | Queue operations, mutex |

## Success Criteria

- [ ] Git status, commit, push, branch all work from TUI
- [ ] Workspace detail shows live git status + identity + tasks
- [ ] AI executes AIDF tasks with streaming output
- [ ] All proposed changes shown as diffs for review
- [ ] Approve/reject/edit workflow works end-to-end
- [ ] Rollback restores files after undo
- [ ] At least Claude and OpenAI providers supported
- [ ] All tests pass
