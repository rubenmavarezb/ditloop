# Getting Started

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 9.x — install via `corepack enable && corepack prepare pnpm@latest --activate`
- **Git** 2.x

## Installation

### From Source (Recommended)

```bash
git clone https://github.com/rubenmavarezb/ditloop.git
cd ditloop
pnpm install
pnpm build
pnpm link --global --filter @ditloop/tui
```

After linking, the `ditloop` command is available globally.

### Verify Installation

```bash
ditloop --version
ditloop --help
```

## Configuration

DitLoop reads its configuration from `~/.ditloop/config.yaml`.

### Create Config File

```bash
mkdir -p ~/.ditloop
```

Create `~/.ditloop/config.yaml`:

```yaml
workspaces:
  - name: my-project
    path: ~/projects/my-project
  - name: work-projects
    path: ~/work
    type: group       # auto-discovers all git repos inside

profiles:
  - name: personal
    email: you@example.com
    gitUser: Your Name
    sshKey: ~/.ssh/id_ed25519
  - name: work
    email: you@company.com
    gitUser: Your Name
    sshKey: ~/.ssh/id_work
```

### Configuration Fields

#### Workspaces

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name for the workspace |
| `path` | string | Absolute path to the project or directory |
| `type` | `"single"` \| `"group"` | Single repo or auto-discover all repos in directory |
| `profile` | string | (Optional) Profile to auto-switch when entering |

#### Profiles

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Profile identifier |
| `email` | string | Git user email |
| `gitUser` | string | Git user name |
| `sshKey` | string | (Optional) Path to SSH private key |

## First Run

### Launch the TUI Dashboard

```bash
ditloop
```

This opens the full terminal interface where you can:
- Browse workspaces in the sidebar
- View git status and tasks per workspace
- Launch AI CLIs with context
- Review diffs and manage executions

### List Workspaces

```bash
ditloop workspace list
```

### Check Current Git Identity

```bash
ditloop profile current
```

### Switch Profile

Profiles switch automatically based on workspace configuration. The Identity Guard warns you if you're about to commit with the wrong identity.

## Add AIDF Context

To get the most out of AI-assisted development, add an `.ai/` folder to your project:

```bash
ditloop scaffold task    # Create a new task definition
ditloop scaffold role    # Create a role definition
ditloop scaffold plan    # Create a multi-task plan
```

See the [AIDF Overview](/aidf/overview) for details on structuring AI context.

## Next Steps

- [Architecture](/guide/architecture) — understand how DitLoop is built
- [CLI Reference](/guide/cli-reference) — all commands and options
- [AIDF Overview](/aidf/overview) — learn about the AI Development Framework
