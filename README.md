# DitLoop

**Terminal IDE centered on Developer In The Loop for multi-project developers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)

DitLoop is a terminal IDE for developers who work across multiple projects and clients. It provides workspace management, automatic git identity switching, AI-driven task execution with approval workflows, and a full TUI dashboard — all from a single terminal window.

## Key Features

- **Workspace Management** — Multi-project support with auto-discovery and group resolution
- **Git Identity Guard** — Never commit with the wrong git identity again; automatic profile switching per workspace
- **AI CLI Launcher** — Launch Claude, OpenAI, or other AI CLIs with full AIDF context injection
- **AIDF Integration** — Structured task definitions, roles, skills, and templates for AI-assisted development
- **TUI Dashboard** — Full terminal interface with workspace overview, task management, and execution monitoring
- **Server & Mobile** — HTTP/WebSocket API with a PWA companion app for remote approvals and monitoring

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install from Source

```bash
git clone https://github.com/rubenmavarezb/ditloop.git
cd ditloop
pnpm install
pnpm build
pnpm link --global --filter @ditloop/tui
```

### Create Configuration

```bash
mkdir -p ~/.ditloop
cat > ~/.ditloop/config.yaml << 'EOF'
workspaces:
  - name: my-project
    path: ~/projects/my-project

profiles:
  - name: personal
    email: you@example.com
    gitUser: Your Name
EOF
```

### Run

```bash
ditloop              # Launch TUI dashboard
ditloop --help       # Show available commands
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `ditloop` | Launch the TUI dashboard |
| `ditloop init` | Interactive setup wizard |
| `ditloop workspace list` | List configured workspaces |
| `ditloop profile list` | List configured profiles |
| `ditloop profile current` | Show current git identity |
| `ditloop scaffold <type>` | Scaffold AIDF file (task, role, skill, plan) |
| `ditloop server start\|stop\|status` | Manage the HTTP/WebSocket server |
| `ditloop --version` | Print version |
| `ditloop --help` | Show help |

## Architecture

DitLoop is a monorepo with 6 packages, each with a clear responsibility:

```
┌─────────────────────────────────────────────────┐
│                  @ditloop/tui                    │
│           Terminal app (CLI + views)             │
├────────────────────┬────────────────────────────┤
│   @ditloop/ui      │      @ditloop/server       │
│  Component library │    HTTP/WebSocket API       │
├────────────────────┴────────────────────────────┤
│                 @ditloop/core                    │
│   Business logic (zero UI dependencies)          │
│   config · events · workspace · profile · git    │
│   provider · executor · launcher · aidf · safety │
└─────────────────────────────────────────────────┘
        ┌──────────────┐    ┌──────────────────┐
        │  playground   │    │     mobile       │
        │ Component     │    │   React PWA      │
        │ catalog       │    │   companion app  │
        └──────────────┘    └──────────────────┘
```

| Package | Description |
|---------|-------------|
| `@ditloop/core` | Business logic — workspace, profile, git, provider, executor, launcher, AIDF, events |
| `@ditloop/ui` | Ink/React component library — design system for the terminal |
| `@ditloop/tui` | Terminal application — CLI entry point, views, state management |
| `@ditloop/server` | HTTP/WebSocket server — REST API, real-time events, push notifications |
| `@ditloop/mobile` | React PWA — mobile companion for approvals and monitoring |
| `@ditloop/playground` | Component catalog — Storybook-like preview for TUI components |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM only) |
| Language | TypeScript (strict mode) |
| Terminal UI | Ink 5 + React 18 |
| State | Zustand 5 |
| Validation | Zod 3 |
| Server | Hono 4 + ws |
| Mobile | React 18 + Vite 6 + Tailwind 3 |
| Build | Turborepo + tsup |
| Test | Vitest + ink-testing-library |

## Screenshots

<!-- TODO: Add screenshots of TUI dashboard, workspace view, launcher -->

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm dev              # Watch mode
pnpm playground       # Run component playground
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, conventions, and guidelines.

## Project Structure

```
ditloop/
├── packages/
│   ├── core/          @ditloop/core
│   ├── ui/            @ditloop/ui
│   ├── tui/           @ditloop/tui
│   ├── server/        @ditloop/server
│   ├── mobile/        @ditloop/mobile
│   └── playground/    @ditloop/playground
├── .ai/               AIDF context (tasks, roles, skills, plans)
├── docs/              Documentation site (VitePress)
├── CLAUDE.md          AI assistant instructions
├── CONTRIBUTING.md    Development guidelines
└── LICENSE            MIT License
```

## Links

- [Contributing Guide](CONTRIBUTING.md)
- [License](LICENSE)

## License

[MIT](LICENSE) — Ruben Mavarez
