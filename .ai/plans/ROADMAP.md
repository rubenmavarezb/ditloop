# DitLoop — Product Roadmap

## Vision
A terminal-native IDE that puts the developer in the loop of AI-assisted development. From workspace management to AI task execution to mobile approval — all from one tool.

DitLoop empowers developers who work across multiple projects and clients to manage workspaces, execute AI-driven tasks with human oversight, and maintain control over their development workflow.

## Core Philosophy
**Developer In The Loop (DITL)** — AI assists, human approves. Every change is reviewed, every decision is intentional.

## Versions

### v0.1 — MVP Foundation ✅ COMPLETED
**Timeline:** Jan-Feb 2026 | **Status:** SHIPPED

Built the foundational architecture and core features for workspace management, AIDF detection, and terminal UI.

**Key Features:**
- Configuration management (workspaces, profiles, providers)
- AIDF file detection and parsing
- Terminal UI with workspace dashboard
- Polish and documentation

**Tasks:** 001-014 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v01-mvp.md`](./completed/PLAN-v01-mvp.md)

---

### v0.2 — Execution Engine ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Transformed DitLoop from a dashboard into an execution tool. Git operations, AI task execution, and human approval workflow.

**Key Features:**
- Git operations (status, commit, push, branch)
- Workspace detail view with developer context
- Provider-agnostic AI integration (Claude, OpenAI, local)
- AI-driven task execution with streaming output
- Human approval workflow for all changes

**Tasks:** 015-028 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v02-execution.md`](./completed/PLAN-v02-execution.md)

---

### v0.3 — AI Launcher & AIDF Authoring ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Instead of building a custom chat engine, DitLoop orchestrates existing AI CLI tools (Claude Code, Aider, etc.) with auto-injected workspace and AIDF context. Additionally, AIDF authoring enables creating structured development artifacts from within DitLoop.

**Key Features:**
- Detect and launch AI CLI tools with context injection
- Build rich context from AIDF roles, tasks, git status, project structure
- TUI launcher for selecting AI tool + AIDF task
- AIDF file creation/editing from TUI
- Template-based scaffolding with variable interpolation
- `ditloop scaffold` CLI wizard

**Tasks:** 029-035 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v03-chat-authoring.md`](./completed/PLAN-v03-chat-authoring.md)

---

### v0.3.1 — Documentation, Dogfooding & GitHub Pages ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Prepared DitLoop for real-world usage and public visibility. OSS documentation, local CLI setup, updated AIDF context, and GitHub Pages site.

**Key Features:**
- README.md, LICENSE, CONTRIBUTING.md
- CLI installable locally via `pnpm link`
- Updated .ai/ context files
- GitHub Pages with landing page + docs (VitePress)

**Tasks:** D01-D06 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v03.1-docs-publishing.md`](./completed/PLAN-v03.1-docs-publishing.md)

---

### v0.4 — Server & API ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Turned DitLoop into a service with HTTP/WebSocket API. Remote access to workspaces, AI CLI launching, approval workflow, and real-time event streaming. Infrastructure for mobile (v0.5).

**Key Features:**
- Hono HTTP server with REST API (workspaces, profiles, AIDF, launcher)
- WebSocket bridge for real-time EventBus events
- Remote AI CLI launch and execution with SSE streaming
- Remote approval workflow (first-response-wins)
- Token-based authentication
- Execution monitoring with rate limiting and FIFO queue
- TUI execution dashboard

**Tasks:** 038-044 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v04-server.md`](./completed/PLAN-v04-server.md)

---

### v0.5 — Mobile Integration ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Progressive Web App for mobile devices. Review and approve AI changes from your phone, receive push notifications.

**Key Features:**
- Progressive Web App (PWA) with Vite + React + Tailwind
- Mobile-optimized diff viewer
- Push notifications with VAPID + Web Push API
- Delta-based state sync with offline queue
- Swipe gestures for approve/reject
- Connection setup with token auth

**Tasks:** 045-052 — Mobile PWA (045-049), Notifications & Sync (050-052)

**Completion Date:** February 2026

**Details:** [`PLAN-v05-mobile.md`](./completed/PLAN-v05-mobile.md)

---

### v0.6 — TUI Overhaul (LazyGit-inspired) 🔜 NEXT
**Timeline:** Q2 2026 (Mar-Apr) | **Status:** PLANNED

Transform DitLoop's TUI from a simple dashboard into a dense, panel-based terminal IDE inspired by LazyGit and Yazi. Multi-panel layouts, vim-style navigation, and deep git/AIDF integration in a single screen.

**Inspiration:**
- **LazyGit:** Multi-panel layout (status + files + branches + commits + stash), keyboard-driven navigation, worktree support, command log
- **Yazi:** Terminal file manager with vim keys, file tree with icons, file previews

**Key Features:**
- Multi-panel workspace view (git status | AIDF tasks | branches | recent commits)
- Vim-style navigation (h/j/k/l) across all views
- File tree browser for `.ai/` context with preview pane
- Command log panel showing git ops, AI launches, events
- Git worktree detection and display
- Panel resizing and layout customization
- Fuzzy finder for workspaces, tasks, branches, files
- Inline diff preview in file panels

**Potential Tasks:** 053-062

**Details:** TBD — [`PLAN-v06-tui-overhaul.md`](./PLAN-v06-tui-overhaul.md)

---

### v0.7 — Desktop App (Tauri) 🔜 PARALLEL with v0.6
**Timeline:** Q2 2026 (Mar-Apr) | **Status:** PLANNED

Native desktop application using Tauri. Reuses the React + Tailwind UI from the mobile PWA, packaged as a lightweight native app with system-level integrations.

**Why Tauri:**
- Uses system webview (~5MB vs Electron's ~150MB)
- Rust backend can invoke git/AI CLIs directly
- Native OS notifications, system tray, filesystem access
- Same React + Tailwind stack as mobile — maximum code reuse

**Key Features:**
- Reuse `@ditloop/mobile` React components in native window
- System tray with execution status and quick actions
- Native OS notifications (replace Web Push)
- Direct filesystem access for workspace browsing
- Auto-connect to local DitLoop server
- Multi-window support (workspace per window)
- Deep linking (`ditloop://workspace/my-project`)
- Auto-updates via Tauri updater

**Shared with Mobile:**
- API client (`api/client.ts`, `api/websocket.ts`)
- Store layer (Zustand stores)
- View components (Approvals, Executions, Workspaces)
- Tailwind design system

**Desktop-only:**
- Tauri Rust commands for local git/AI CLI execution
- System tray integration
- Native file dialogs
- OS notification center
- Keyboard shortcuts (Cmd/Ctrl palette)

**Potential Tasks:** 063-072

**Details:** TBD — [`PLAN-v07-desktop.md`](./PLAN-v07-desktop.md)

---

## Architecture Evolution

| Version | Packages | New Capabilities |
|---------|----------|-----------------|
| v0.1 | `core`, `ui`, `tui`, `playground` | Config, workspaces, profiles, AIDF detection, TUI dashboard |
| v0.2 | +`git` module in core | Git operations, AI providers, task execution, approval workflow |
| v0.3 | +`launcher` module in core | AI CLI orchestration, context injection, AIDF authoring, templates |
| v0.4 | +`server` package | HTTP/WS API, remote execution, client SDK, IDE plugins |
| v0.5 | +`mobile` package | PWA, push notifications, mobile approval, offline sync |
| v0.6 | enhanced `tui` + `ui` | Multi-panel layouts, vim navigation, file tree, command log |
| v0.7 | +`desktop` package (Tauri) | Native app, system tray, OS notifications, direct CLI access |

## Task Index

| Task | Name | Version | Status |
|------|------|---------|--------|
| 001 | Setup Monorepo | v0.1 | ✅ |
| 002 | Config Schema | v0.1 | ✅ |
| 003 | Workspace Manager | v0.1 | ✅ |
| 004 | Profile Manager | v0.1 | ✅ |
| 005 | Identity Guard | v0.1 | ✅ |
| 006 | Event Bus | v0.1 | ✅ |
| 007 | AIDF Detector | v0.1 | ✅ |
| 008 | Context Loader | v0.1 | ✅ |
| 009 | UI Primitives | v0.1 | ✅ |
| 010 | Sidebar Component | v0.1 | ✅ |
| 011 | Home View | v0.1 | ✅ |
| 012 | CLI Entrypoint | v0.1 | ✅ |
| 013 | Playground Setup | v0.1 | ✅ |
| 014 | Integration Test | v0.1 | ✅ |
| 015 | Git Status Reader | v0.2 | ✅ |
| 016 | Git Commit Manager | v0.2 | ✅ |
| 017 | Git Branch Manager | v0.2 | ✅ |
| 018 | Workspace Detail View | v0.2 | ✅ |
| 019 | Workspace Navigation | v0.2 | ✅ |
| 020 | Provider Interface | v0.2 | ✅ |
| 021 | Claude Adapter | v0.2 | ✅ |
| 022 | OpenAI Adapter | v0.2 | ✅ |
| 023 | Execution Engine | v0.2 | ✅ |
| 024 | Action Parser | v0.2 | ✅ |
| 025 | Execution Session | v0.2 | ✅ |
| 026 | Approval Engine | v0.2 | ✅ |
| 027 | Diff Review View | v0.2 | ✅ |
| 028 | Action Executor | v0.2 | ✅ |
| 029 | Context Builder | v0.3 | ✅ |
| 030 | AI Launcher | v0.3 | ✅ |
| 031 | Launcher View | v0.3 | ✅ |
| 032 | AIDF Writer | v0.3 | ✅ |
| 033 | Template Engine | v0.3 | ✅ |
| 034 | Task Editor View | v0.3 | ✅ |
| 035 | Scaffold Command | v0.3 | ✅ |
| D01 | README & License | v0.3.1 | ✅ |
| D02 | Contributing Guide | v0.3.1 | ✅ |
| D03 | Dogfooding Setup | v0.3.1 | ✅ |
| D04 | Update AIDF Context | v0.3.1 | ✅ |
| D05 | Docs Site Setup | v0.3.1 | ✅ |
| D06 | Landing & Docs | v0.3.1 | ✅ |
| 038 | Server Package | v0.4 | ✅ |
| 039 | WebSocket Bridge | v0.4 | ✅ |
| 040 | Remote Approval | v0.4 | ✅ |
| 041 | Server CLI | v0.4 | ✅ |
| 042 | Execution API | v0.4 | ✅ |
| 043 | Execution Monitor | v0.4 | ✅ |
| 044 | Execution Dashboard View | v0.4 | ✅ |
| 045 | Mobile Package | v0.5 | ✅ |
| 046 | Mobile Workspace View | v0.5 | ✅ |
| 047 | Mobile Chat View | v0.5 | ✅ |
| 048 | Mobile Approval View | v0.5 | ✅ |
| 049 | Mobile Execution View | v0.5 | ✅ |
| 050 | Push Notification Service | v0.5 | ✅ |
| 051 | State Sync Engine | v0.5 | ✅ |
| 052 | Notification Preferences | v0.5 | ✅ |

**Legend:**
- ✅ Completed
- ⏳ In Progress / Next Up
- 📋 Planned / Not Started

**Note:** Tasks 036-037 intentionally skipped (v0.3 reduced from 9 to 7 tasks after architectural pivot from custom chat to AI CLI orchestration).

## Technology Stack

### Core
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Monorepo:** Turborepo

### UI/TUI
- **Terminal UI:** Ink (React for CLI)
- **UI Components:** React
- **Styling:** Tailwind CSS (for web components)

### AI Integration
- **Strategy:** Orchestrate existing AI CLIs (Claude Code, Aider, etc.)
- **Context injection:** Generate CLAUDE.md / system-prompt files from AIDF
- **Fallback:** Direct provider API via ProviderAdapter (v0.2)

### Server (v0.4+)
- **Framework:** Express or Fastify
- **WebSocket:** ws
- **Auth:** JWT + API keys
- **API Docs:** OpenAPI/Swagger

### Mobile (v0.5+)
- **Framework:** React PWA
- **Build:** Vite
- **Push:** Web Push API
- **Offline:** Service Workers

### DevOps
- **Testing:** Vitest, Playwright
- **CI/CD:** GitHub Actions
- **Linting:** ESLint, Prettier
- **Type Checking:** TypeScript strict mode

## Key Metrics & Goals

### v0.2 Targets
- Task execution time: < 2s to first AI response
- Diff generation for 100 files: < 5s
- Git operations success rate: > 95%
- Provider support: 2+ (Claude, OpenAI)

### v0.3 Targets
- AI CLI detection time: < 500ms
- Context build time: < 200ms
- CLI launch to first prompt: < 1s
- AIDF template library: 6+ built-in templates
- Scaffold command: < 30s to create artifact

### v0.4 Targets
- API request latency (p95): < 100ms
- WebSocket message latency: < 50ms
- Server uptime: > 99.9%
- Concurrent executions: 10+ per workspace

### v0.5 Targets
- PWA installation rate: > 30%
- Push notification delivery: > 95%
- Mobile approval time: < 30s per task
- Offline mode usage: > 20%

## Future Vision (Beyond v0.5)

### Potential Features
- **Multi-user collaboration:** Real-time shared workspaces
- **Cloud-hosted service:** SaaS offering with team accounts
- **Advanced IDE integrations:** JetBrains, Emacs, Vim plugins
- **AI model fine-tuning:** Custom models trained on your codebase
- **Voice interface:** Voice commands for task execution
- **Analytics dashboard:** Productivity metrics and insights
- **Marketplace:** Community AIDF templates and providers
- **Self-hosted deployment:** Docker Compose, Kubernetes charts

### Research Areas
- Local AI models (Ollama, LM Studio)
- Code understanding via AST analysis
- Automated testing generation
- Security scanning integration
- Performance profiling automation

## Contributing

DitLoop is designed to be extensible. Key extension points:
- **AI CLI adapters:** Add new AI tool integrations
- **AIDF templates:** Create task templates
- **UI themes:** Customize TUI appearance
- **IDE plugins:** Integrate with your editor
- **Custom workflows:** Build on the API

See `CONTRIBUTING.md` for guidelines.

## License

MIT License — See `LICENSE` for details.

---

**Last Updated:** February 16, 2026
**Current Version:** v0.5 (Mobile Integration) ✅
**Completed:** v0.1 → v0.5 + v0.3.1 (all shipped)
**Next:** v0.6 (TUI Overhaul) 📋 | v0.7 (Desktop — Tauri) 📋 ← parallel
