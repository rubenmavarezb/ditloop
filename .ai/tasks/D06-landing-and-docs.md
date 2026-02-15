# TASK: Landing Page & Documentation Content

## Goal
Write all documentation content: landing page with hero/features, getting started guide, architecture docs, CLI reference, and AIDF guide.

## Scope

### Allowed
- docs/**/*.md (content only)
- docs/public/ (images, diagrams)

### Forbidden
- Any source code changes
- docs/.vitepress/config.ts (handled by D05)

## Requirements

### Landing Page (docs/index.md)
1. Hero: project name, tagline ("Terminal IDE — Developer In The Loop"), install command
2. Features grid (4-6 cards):
   - Workspace Management: multi-project, auto-discovery
   - Git Identity Guard: never commit with wrong identity
   - AI CLI Launcher: launch Claude/Aider with AIDF context
   - AIDF Integration: structured task definitions
   - TUI Dashboard: full terminal interface
   - Extensible: provider adapters, templates, themes
3. Quick install section
4. "Why DitLoop?" section (the problem it solves)

### Getting Started (docs/guide/getting-started.md)
1. Prerequisites (Node 20+, pnpm)
2. Installation (global install or from source)
3. Create config file (~/.ditloop/config.yaml) with example
4. First run walkthrough
5. Add a workspace
6. Launch AI CLI with context

### Architecture (docs/guide/architecture.md)
1. Package diagram (core → ui → tui)
2. Core modules overview (config, events, workspace, profile, git, provider, executor, safety, launcher, aidf)
3. Event-driven architecture explanation
4. File organization rules summary
5. Provider adapter pattern

### CLI Reference (docs/guide/cli-reference.md)
1. Every command with syntax, options, and examples:
   - ditloop (launch TUI)
   - ditloop init
   - ditloop workspace list
   - ditloop profile list/current
   - ditloop scaffold [type]
   - ditloop chat (launcher)
   - ditloop server start/stop/status (if v0.4 done)
2. Configuration reference (config.yaml schema)

### AIDF Guide (docs/aidf/overview.md)
1. What is AIDF
2. Directory structure (.ai/)
3. File types: tasks, roles, skills, plans, templates
4. Example of each file type
5. How DitLoop uses AIDF context

## Definition of Done
- [ ] Landing page renders with hero and features
- [ ] Getting started guide is followable from scratch
- [ ] Architecture page has clear diagrams
- [ ] CLI reference covers all commands
- [ ] AIDF guide explains the framework
- [ ] All pages render correctly in VitePress

## Status: 📋 Planned
