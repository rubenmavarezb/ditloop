// @ditloop/ui — DitLoop Design System
// Reusable Ink components for terminal UI

export const uiVersion = '0.1.0';

// Theme
export { defaultColors, ThemeProvider, ThemeContext } from './theme/index.js';
export type { ThemeColors, ThemeProviderProps } from './theme/index.js';

// Hooks
export { useTheme } from './hooks/index.js';
export { useScrollable } from './hooks/useScrollable.js';
export type { ScrollableState } from './hooks/useScrollable.js';

// Primitives
export {
  Panel,
  Divider,
  StatusBadge,
  Breadcrumb,
  Header,
  ShortcutsBar,
  SplitView,
} from './primitives/index.js';
export type {
  PanelProps,
  DividerProps,
  StatusBadgeProps,
  StatusVariant,
  BreadcrumbProps,
  HeaderProps,
  ShortcutsBarProps,
  Shortcut,
  SplitViewProps,
} from './primitives/index.js';

// Input
export { SelectList } from './input/index.js';
export type { SelectListProps } from './input/index.js';

// Data Display
export { RelativeTime, formatRelativeTime } from './data-display/index.js';
export type { RelativeTimeProps } from './data-display/index.js';

// Layout
export {
  resolveLayout,
  adjustSplit,
  DEFAULT_WORKSPACE_LAYOUT,
  PanelContainer,
  FocusablePanel,
} from './layout/index.js';
export type {
  LayoutConfig,
  LayoutRow,
  LayoutColumn,
  ResolvedPanel,
  PanelSlot,
  PanelConstraints,
  PanelContainerProps,
  FocusablePanelProps,
} from './layout/index.js';

// Composite
export { WorkspaceItem, TaskItem, Sidebar } from './composite/index.js';
export type {
  WorkspaceItemProps,
  WorkspaceItemData,
  TaskItemProps,
  TaskItemData,
  TaskStatus,
  SidebarProps,
} from './composite/index.js';
