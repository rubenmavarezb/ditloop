# @ditloop/playground

Component catalog for DitLoop — Storybook-like explorer for terminal UI components.

## Usage

```bash
pnpm build && pnpm start   # Build and launch the playground
pnpm dev                    # Watch mode
```

## What It Does

The playground renders `@ditloop/ui` components in an interactive terminal catalog. Use it to:

- Preview components in isolation (Badge, StatusDot, Panel, WorkspaceCard, etc.)
- Test different props and states
- Develop new UI components visually

## Tech Stack

- [Ink](https://github.com/vadimdemedes/ink) — React for CLI
- [@ditloop/ui](../ui) — Component library

See the [root README](../../README.md) for full documentation.
