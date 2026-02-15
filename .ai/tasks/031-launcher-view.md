# TASK: Launcher View

## Goal
Create TUI view for selecting an AI CLI tool and AIDF task before launching, with a clean handoff to the AI CLI and return to DitLoop on exit.

## Scope

### Allowed
- packages/tui/src/views/Launcher/LauncherView.tsx
- packages/tui/src/views/Launcher/LauncherView.test.tsx
- packages/tui/src/views/Launcher/index.ts
- packages/tui/src/views/index.ts (add export)
- packages/tui/src/navigation/router.ts (add route)
- packages/tui/src/app.tsx (add route handler)

### Forbidden
- packages/core/** (use AiLauncher + ContextBuilder only)
- packages/ui/** (unless adding a reusable component)

## Requirements
1. **AI Tool Selector** — list detected AI CLIs with status badges:
   - Green: installed and ready
   - Gray: not installed (show install hint)
   - Show version next to name
2. **Task Selector** — optional, list AIDF tasks from active workspace:
   - Show task title + status
   - Allow "No task" option (general chat)
   - Highlight in-progress tasks
3. **Context Preview** — show summary of what context will be injected:
   - Role, task title, workspace name, git branch
   - Total context size
4. **Launch** — Enter key launches selected CLI:
   - DitLoop TUI suspends (Ink's `exit()` or raw mode toggle)
   - Terminal handed to AI CLI process
   - On CLI exit, DitLoop TUI resumes
5. **Keyboard**: arrow keys to navigate, Enter to launch, Esc to go back
6. **Route**: accessible via `ditloop chat` command and from TUI sidebar

## Definition of Done
- [ ] View renders available CLIs with status
- [ ] Task selection works with AIDF tasks
- [ ] Context preview shows accurate summary
- [ ] Launch hands off terminal to AI CLI
- [ ] TUI resumes after CLI exits
- [ ] Route registered and accessible
- [ ] Component tests with ink-testing-library

## Status: 📋 Planned
