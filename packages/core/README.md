# @ditloop/core

Business logic for DitLoop — workspace management, git identity, AI providers, execution engine, and AIDF integration. Zero UI dependencies.

## Installation

```bash
pnpm add @ditloop/core
```

## Key Exports

| Module | Exports | Purpose |
|--------|---------|---------|
| `config` | `loadConfig`, `ConfigSchema` | YAML configuration loading and validation |
| `events` | `EventBus`, `DitLoopEventMap` | Typed event system for cross-module communication |
| `workspace` | `WorkspaceManager`, `GroupResolver` | Workspace discovery and management |
| `profile` | `ProfileManager`, `SSHAgent`, `IdentityGuard` | Git identity switching and verification |
| `git` | `GitManager` | Git operations (clone, status, commits) |
| `provider` | `ProviderRegistry`, adapters | AI provider abstraction (Claude, OpenAI) |
| `executor` | `ExecutionEngine` | Task execution with safety controls |
| `launcher` | `AiLauncher`, `CLIRegistry` | AI CLI detection and context-aware launching |
| `aidf` | `AidfDetector`, `ContextLoader`, `TemplateEngine`, `AidfWriter` | AIDF folder management and scaffolding |
| `safety` | `ApprovalEngine`, `ActionExecutor` | Approval workflows and action safety |

## Usage

```typescript
import { loadConfig, WorkspaceManager, ProfileManager, EventBus } from '@ditloop/core';

const config = await loadConfig();
const eventBus = new EventBus();
const workspaces = new WorkspaceManager(config, eventBus);
const profiles = new ProfileManager(config, eventBus);

const list = await workspaces.list();
await profiles.switchTo('personal');
```

## Architecture

Core follows an event-driven architecture. All modules communicate through the `EventBus` with typed events. No module directly imports another — they emit and subscribe to events.

See the [root README](../../README.md) for full architecture documentation.
