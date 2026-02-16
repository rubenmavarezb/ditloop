# @ditloop/tui

Terminal IDE application for DitLoop — the CLI entry point and full TUI dashboard.

## Installation

```bash
# From source (recommended)
pnpm build
pnpm link --global --filter @ditloop/tui

# The `ditloop` command is now available globally
```

## CLI Commands

```bash
ditloop                          # Launch TUI dashboard
ditloop init                     # Interactive setup wizard
ditloop workspace list           # List configured workspaces
ditloop profile list             # List configured profiles
ditloop profile current          # Show current git identity
ditloop scaffold <type>          # Scaffold AIDF file (task|role|skill|plan)
ditloop server start|stop|status # Manage HTTP/WebSocket server
ditloop --version                # Print version
ditloop --help                   # Show help
```

## TUI Views

| View | Description |
|------|-------------|
| Home | Workspace overview with sidebar navigation |
| Workspace Detail | Git status, tasks, and actions for a workspace |
| Task Detail | Task inspection and metadata |
| Task Editor | Create and edit AIDF tasks |
| Launcher | AI CLI launcher with context injection |
| Diff Review | Code diff review interface |
| Execution Dashboard | Real-time execution monitoring |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate |
| `Enter` | Select |
| `Ctrl+B` | Toggle sidebar |
| `1`-`9` | Switch to workspace |
| `Escape` | Back to home |
| `q` | Quit |

See the [root README](../../README.md) for full documentation.
