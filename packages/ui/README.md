# @ditloop/ui

Terminal component library for DitLoop — reusable Ink/React components and a design system for the TUI.

## Installation

```bash
pnpm add @ditloop/ui
```

## Key Exports

### Primitives

`Panel`, `Divider`, `StatusBadge`, `Breadcrumb`, `Header`, `ShortcutsBar`, `SplitView`

### Input

`SelectList`

### Composite

`Sidebar`, `WorkspaceItem`, `TaskItem`

### Data Display

`RelativeTime`, `formatRelativeTime`

### Theme

`ThemeProvider`, `defaultColors`, `useTheme`

### Hooks

`useTheme`, `useScrollable`

## Usage

```tsx
import { Panel, StatusBadge, ThemeProvider } from '@ditloop/ui';

const App = () => (
  <ThemeProvider>
    <Panel title="Workspaces">
      <StatusBadge status="active" label="my-project" />
    </Panel>
  </ThemeProvider>
);
```

## Peer Dependencies

- `@ditloop/core` — for workspace and profile types

See the [root README](../../README.md) for full documentation.
