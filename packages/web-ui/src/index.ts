// --- Visual Components (no server dependency) ---

// Components
export {
  ConfirmDialog,
  DiffViewer,
  ExecutionCard,
  MessageBubble,
  WorkspaceCard,
} from './components/index.js';

// Layout Engine
export {
  LayoutEngine,
  ResizeHandle,
  useLayoutStore,
  PANEL_DEFINITIONS,
  layoutPresets,
  DEFAULT_PRESET,
} from './components/LayoutEngine/index.js';
export type {
  LayoutEngineProps,
  LayoutSlots,
  LayoutState,
  LayoutActions,
  LayoutStore,
  PanelDefinition,
  PanelState,
  PanelPosition,
  LayoutPreset,
  LayoutPresetId,
  ResizeHandleProps,
  ResizeDirection,
} from './components/LayoutEngine/index.js';

// Theme System (v0.8)
export {
  ThemeProvider,
  useDitloopTheme,
  themes,
  DEFAULT_THEME,
  neonTheme,
  brutalistTheme,
  classicTheme,
  lightTheme,
} from './theme/index.js';
export type {
  ThemeContextValue,
  ThemeId,
  ThemeDefinition,
  ThemeTokens,
  ThemeTokenName,
} from './theme/index.js';

// Legacy theme (v0.7 compatibility)
export { useThemeStore } from './store/theme.js';
export type { ThemeState, ThemeMode } from './store/theme.js';
export { useTheme } from './hooks/useTheme.js';
export { ditloopPreset } from './tailwind.preset.js';
