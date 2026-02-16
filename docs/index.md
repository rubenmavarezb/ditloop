---
layout: home

hero:
  name: DitLoop
  text: Terminal IDE — Developer In The Loop
  tagline: Workspace management, git identity automation, and AI-driven task execution — all from your terminal.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/rubenmavarezb/ditloop

features:
  - icon: "📁"
    title: Workspace Management
    details: Multi-project support with auto-discovery, group resolution, and a unified dashboard for all your repositories.
  - icon: "🔐"
    title: Git Identity Guard
    details: Never commit with the wrong git identity again. Automatic profile switching per workspace with SSH key management.
  - icon: "🤖"
    title: AI CLI Launcher
    details: Launch Claude, OpenAI, or other AI CLIs with full AIDF context injection — tasks, roles, and project knowledge included.
  - icon: "📋"
    title: AIDF Integration
    details: Structured task definitions, roles, skills, and templates for AI-assisted development following the AI Development Framework.
  - icon: "🖥️"
    title: TUI Dashboard
    details: Full terminal interface with workspace overview, task management, diff review, and real-time execution monitoring.
  - icon: "📱"
    title: Server & Mobile
    details: HTTP/WebSocket API with a PWA companion app for remote approvals, monitoring, and push notifications.
---

## Why DitLoop?

Modern developers juggle multiple projects across different clients, organizations, and git identities. Switching between them means:

- Remembering which SSH key and git email to use
- Manually loading project context for AI tools
- Losing track of tasks across repositories
- No unified view of work status

**DitLoop solves this** by providing a single terminal command that manages all your workspaces, handles identity switching automatically, and launches AI assistants with full project context.

## Quick Install

```bash
git clone https://github.com/rubenmavarezb/ditloop.git
cd ditloop
pnpm install && pnpm build
pnpm link --global --filter @ditloop/tui
ditloop --help
```
