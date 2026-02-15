# TASK: Scaffold Command

## Goal
Create `ditloop scaffold` CLI command with interactive wizard for creating AIDF files from templates, supporting both interactive and non-interactive modes.

## Scope

### Allowed
- packages/tui/src/commands/scaffold.ts
- packages/tui/src/commands/scaffold.test.ts

### Forbidden
- packages/core/** (use AidfWriter + TemplateEngine only)

## Requirements
1. Subcommands: task, role, skill, plan
2. Interactive wizard: template selection, variable prompts, preview, confirmation
3. Non-interactive mode via flags (--template, --var key=value)
4. Accessible from TUI via Ctrl+N
5. Preview before creation with syntax highlighting
6. Support custom templates from .ai/templates/

## Definition of Done
- [ ] All subcommands functional
- [ ] Interactive wizard complete
- [ ] Non-interactive mode with flags
- [ ] Preview before creation
- [ ] CLI tests for both modes

## Status: 📋 Planned
