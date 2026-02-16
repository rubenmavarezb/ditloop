# CLI Reference

## Global Options

| Option | Description |
|--------|-------------|
| `--version` | Print version number |
| `--help` | Show help |

## Commands

### `ditloop`

Launch the full TUI dashboard.

```bash
ditloop
```

Opens the terminal interface with:
- Sidebar with workspace navigation
- Workspace details with git status
- Task management
- AI CLI launcher
- Execution monitoring

### `ditloop init`

Interactive setup wizard for first-time configuration.

```bash
ditloop init
```

Guides you through creating `~/.ditloop/config.yaml` with workspaces and profiles.

### `ditloop workspace list`

List all configured workspaces.

```bash
ditloop workspace list
```

Displays workspace names, paths, types (single/group), and associated profiles.

### `ditloop profile list`

List all configured git identity profiles.

```bash
ditloop profile list
```

Shows profile names, emails, and git usernames.

### `ditloop profile current`

Show the currently active git identity.

```bash
ditloop profile current
```

Displays the current `user.name` and `user.email` from git config.

### `ditloop scaffold <type>`

Scaffold an AIDF file interactively.

```bash
ditloop scaffold task    # Create a task definition
ditloop scaffold role    # Create a role definition
ditloop scaffold skill   # Create a skill definition
ditloop scaffold plan    # Create a multi-task plan
```

Launches an interactive wizard that creates the file in the project's `.ai/` directory.

### `ditloop server <command>`

Manage the HTTP/WebSocket server for remote access.

```bash
ditloop server start     # Start the server
ditloop server stop      # Stop the server
ditloop server restart   # Restart the server
ditloop server status    # Show server status
```

The server enables the mobile PWA companion app to connect and receive real-time updates.

## Keyboard Shortcuts (TUI)

When running the TUI dashboard, these shortcuts are available:

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate items |
| `→` `←` | Expand / collapse |
| `Enter` | Select item |
| `Ctrl+B` | Toggle sidebar |
| `1`-`9` | Jump to workspace by index |
| `Escape` | Go back to home |
| `q` | Quit |

## Configuration

DitLoop reads configuration from `~/.ditloop/config.yaml`.

### Example Configuration

```yaml
workspaces:
  - name: personal-projects
    path: ~/projects
    type: group
    profile: personal

  - name: work-monorepo
    path: ~/work/main-repo
    type: single
    profile: work

profiles:
  - name: personal
    email: you@example.com
    gitUser: Your Name
    sshKey: ~/.ssh/id_ed25519

  - name: work
    email: you@company.com
    gitUser: Your Name (Company)
    sshKey: ~/.ssh/id_work
```

### Config Schema

| Section | Field | Type | Required | Description |
|---------|-------|------|----------|-------------|
| `workspaces[]` | `name` | string | Yes | Display name |
| | `path` | string | Yes | Absolute path |
| | `type` | `"single"` \| `"group"` | No | Default: `"single"` |
| | `profile` | string | No | Auto-switch profile |
| `profiles[]` | `name` | string | Yes | Profile identifier |
| | `email` | string | Yes | Git email |
| | `gitUser` | string | Yes | Git user name |
| | `sshKey` | string | No | SSH private key path |
