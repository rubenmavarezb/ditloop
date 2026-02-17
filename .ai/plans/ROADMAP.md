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

### v0.6 — TUI Overhaul (LazyGit-inspired) ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Transformed DitLoop's TUI into a dense, panel-based terminal IDE inspired by LazyGit and Yazi. Multi-panel layouts, vim-style navigation, and deep git/AIDF integration in a single screen.

**Key Features:**
- Multi-panel workspace view (git status | AIDF tasks | branches | recent commits)
- Vim-style navigation (h/j/k/l) across all views
- File tree browser for `.ai/` context with preview pane
- Command log panel showing git ops, AI launches, events
- Panel resizing and layout customization
- Fuzzy finder for workspaces, tasks, branches, files

**Tasks:** 053-062 (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v06-tui-overhaul.md`](./completed/PLAN-v06-tui-overhaul.md)

---

### v0.7 — Desktop App (Tauri) ✅ COMPLETED
**Timeline:** Feb 2026 | **Status:** SHIPPED

Native desktop application using Tauri 2.x. Local-first architecture — React frontend communicates via Tauri IPC to Rust backend commands that execute git/AI operations directly on the filesystem.

**Key Features:**
- Local-first architecture (React → Tauri IPC → Rust → filesystem/git)
- System tray with workspace status and quick actions
- Native OS notifications
- File browser with `.ai/` awareness
- Rust-backed git operations (status, log, diff, branches, commit, checkout)
- Command palette (Cmd+K) with ~40+ dynamic commands
- Multi-window support per workspace
- Deep linking (`ditloop://` protocol)
- AI CLI launching from desktop
- Profile/identity management

**Tasks:** 063R-069R (in `tasks/completed/`)

**Completion Date:** February 2026

**Details:** [`PLAN-v07-desktop.md`](./completed/PLAN-v07-desktop.md)

---

### v0.8 — DitLoop IDE: Multi-Project AI Workspace 🔜 NEXT
**Timeline:** Q1-Q2 2026 | **Status:** PLANNED

Transform DitLoop Desktop from a workspace dashboard into a full-featured IDE. Tab-based multi-project workspace, embedded terminal, AI chat with multi-provider support, autonomous task execution with approval workflow, customizable layouts, and themes — all powered by AIDF.

**Design Reference:** SuperDesign mockups (5 layout variants: Default, Code Focus, AI Focus, Git Focus, Zen)

**Key Features:**
- Tab-based workspace switching (each tab = full project context)
- Embedded terminal via xterm.js + Tauri PTY
- AI Chat panel with provider selector (Claude, GPT, Gemini, Ollama)
- AI Task execution with step progress, logs, and inline approval
- Enhanced Source Control (staging, commits, stash, side-by-side diff)
- File explorer with git status indicators and AIDF awareness
- 5 layout presets (Default, Code Focus, AI Focus, Git Focus, Zen)
- Theme system (Neon, Brutalist, Classic, Light)
- Identity mismatch warnings
- Full keyboard shortcut system

**Tasks:** 070-084 (Desktop IDE)

**Details:** [`PLAN-v08-ide.md`](./PLAN-v08-ide.md)

---

### v0.8-TUI — DitLoop TUI: tmux-powered Terminal IDE ✅ COMPLETED
**Timeline:** Q1-Q2 2026 | **Status:** SHIPPED

Transform DitLoop TUI from a panel dashboard into a tmux-powered terminal IDE. DitLoop manages tmux panes programmatically — Ink/React panels surround a real native terminal where the developer runs any command (claude, aider, git, vim, etc.). DitLoop is NOT a terminal emulator — it's a smart tmux layout manager with contextual panels.

**Key Insight:** There is no "chat panel." The center pane IS the real terminal. The user runs `claude`, `aider`, or any AI CLI directly. DitLoop provides context (AIDF, git identity, workspace path) and orchestration around the terminal.

**Key Features:**
- tmux session management with programmatic pane control
- Panel-mode Ink rendering (sidebar, git, status bar in separate tmux panes)
- Workspace context switching (cd + git identity + panel refresh)
- Enhanced sidebar with AIDF context, provider badges, quick actions
- Source Control panel with commit input, staging, stash
- 5 tmux layout presets (Default, Code Focus, Git Focus, Multi-Terminal, Zen)
- AI CLI launcher with AIDF context injection
- Fullscreen toggle fallback for users without tmux

**Tasks:** 090-100 (TUI tmux)

**Completion Date:** February 2026

**Details:** [`PLAN-v08-tui.md`](./completed/PLAN-v08-tui.md)

---

### v0.8-Mobile — DitLoop Mobile & Tablet Companion 🔜 NEXT
**Timeline:** Q1-Q2 2026 | **Status:** PLANNED

Upgrade DitLoop's mobile PWA from a basic approval tool into a full companion app. Monitor workspaces, view AI sessions in real-time, approve/reject changes with swipe gestures, and launch tasks from your phone or tablet. Inspired by Claude Code mobile but designed for multi-project, multi-AI, multi-identity workflows.

**Design Reference:** SuperDesign mockups — 5 mobile screens + 2 tablet layouts

**Key Features:**
- Workspace Hub with active session cards and provider badges
- AI Session view with live streaming output and code block rendering
- Approval Queue with filter chips and status badges
- Diff Review with swipe gestures (left=reject, right=approve) and haptic feedback
- Tablet Split View (workspace list + detail) and 3-panel (sessions + output + diff)
- Push notifications for pending approvals
- Offline mode with sync queue

**Tasks:** 110-121 (Mobile & Tablet)

**Details:** [`PLAN-v08-mobile.md`](./PLAN-v08-mobile.md)

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
| v0.8 | enhanced `desktop` + `web-ui` | Tab workspaces, embedded terminal, AI chat, layout system, themes |
| v0.8-TUI | enhanced `tui` + `ui` | tmux integration, panel-mode rendering, layout presets, AI CLI launcher |
| v0.8-Mobile | enhanced `mobile` + `web-ui` | Companion app, live sessions, swipe approvals, tablet layouts |

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
| 053 | Multi-panel Layout | v0.6 | ✅ |
| 054 | Vim Keyboard Navigation | v0.6 | ✅ |
| 055 | Git Status Panel | v0.6 | ✅ |
| 056 | Tasks Panel | v0.6 | ✅ |
| 057 | Branches Panel | v0.6 | ✅ |
| 058 | Commits Panel | v0.6 | ✅ |
| 059 | File Tree Panel | v0.6 | ✅ |
| 060 | Command Log Panel | v0.6 | ✅ |
| 061 | Fuzzy Finder | v0.6 | ✅ |
| 062 | Panel Integration | v0.6 | ✅ |
| 063R | Desktop Architecture (Revised) | v0.7 | ✅ |
| 064R | Desktop Git Integration | v0.7 | ✅ |
| 065R | Command Palette | v0.7 | ✅ |
| 066R | System Tray | v0.7 | ✅ |
| 067R | Notifications & Deep Link | v0.7 | ✅ |
| 068R | Multi-Window & AI Tools | v0.7 | ✅ |
| 069R | Desktop CI/CD | v0.7 | ✅ |
| 070 | Fix web-ui Build | v0.8 | 📋 |
| 071 | Desktop Layout Engine | v0.8 | 📋 |
| 072 | Tab-based Workspace Switching | v0.8 | 📋 |
| 073 | Embedded Terminal (xterm.js) | v0.8 | 📋 |
| 074 | File Explorer Panel | v0.8 | 📋 |
| 075 | Enhanced Source Control | v0.8 | 📋 |
| 076 | Diff Viewer | v0.8 | 📋 |
| 077 | AI Chat Panel | v0.8 | 📋 |
| 078 | AI Task Execution Panel | v0.8 | 📋 |
| 079 | AIDF Context Manager | v0.8 | 📋 |
| 080 | Layout Presets | v0.8 | 📋 |
| 081 | Theme System | v0.8 | 📋 |
| 082 | Identity Mismatch Warnings | v0.8 | 📋 |
| 083 | Enhanced Status Bar | v0.8 | 📋 |
| 084 | Keyboard Shortcuts System | v0.8 | 📋 |
| 090 | tmux Session Manager | v0.8-TUI | ✅ |
| 091 | Panel-mode Ink Rendering | v0.8-TUI | ✅ |
| 092 | Workspace Context Switching (tmux) | v0.8-TUI | ✅ |
| 093 | Enhanced Sidebar with AIDF Context | v0.8-TUI | ✅ |
| 094 | Source Control Panel with Commit | v0.8-TUI | ✅ |
| 095 | TUI Status Bar | v0.8-TUI | ✅ |
| 096 | TUI Identity Mismatch Warnings | v0.8-TUI | ✅ |
| 097 | tmux Layout Presets | v0.8-TUI | ✅ |
| 098 | Multi-Terminal Layout | v0.8-TUI | ✅ |
| 099 | AI CLI Launcher with Context | v0.8-TUI | ✅ |
| 100 | Fullscreen Toggle Fallback | v0.8-TUI | ✅ |
| 110 | Workspace Hub (Home) | v0.8-Mobile | 📋 |
| 111 | Workspace Detail View | v0.8-Mobile | 📋 |
| 112 | Bottom Navigation + Routing | v0.8-Mobile | 📋 |
| 113 | AI Session View (Live Output) | v0.8-Mobile | 📋 |
| 114 | Session Instruction Input | v0.8-Mobile | 📋 |
| 115 | Approval Queue Screen | v0.8-Mobile | 📋 |
| 116 | Diff Review (Mobile) | v0.8-Mobile | 📋 |
| 117 | Swipe Gestures + Approve/Reject | v0.8-Mobile | 📋 |
| 118 | Tablet Split View | v0.8-Mobile | 📋 |
| 119 | Tablet Session & Approval (3-panel) | v0.8-Mobile | 📋 |
| 120 | Push Notifications (Enhanced) | v0.8-Mobile | 📋 |
| 121 | Offline Mode + Sync Queue | v0.8-Mobile | 📋 |

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

## Future Vision (Beyond v0.8)

### Ecosystem
- **Desktop IDE** (v0.8) — Primary development interface
- **TUI companion** (v0.6) — Lightweight terminal alternative
- **Mobile companion** (v0.5) — Remote approvals and monitoring via PWA
- **Server** (v0.4) — Bridges desktop ↔ mobile with real-time sync

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
**Current Version:** v0.7 (Desktop App) ✅
**Completed:** v0.1 → v0.7 + v0.3.1 (all shipped) — 69 tasks, 8 plans
**Next:** v0.8 — Desktop IDE (15 tasks) + TUI (11 tasks) + Mobile (12 tasks) = **38 tasks** 📋
**Note:** Tasks 085-089 and 101-109 reserved for future use.
