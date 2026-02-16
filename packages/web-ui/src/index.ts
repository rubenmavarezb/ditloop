// --- Visual Components (no server dependency) ---

// Components
export {
  ConfirmDialog,
  DiffViewer,
  ExecutionCard,
  MessageBubble,
  WorkspaceCard,
} from './components/index.js';

// Theme
export { useThemeStore } from './store/theme.js';
export type { ThemeState, ThemeMode } from './store/theme.js';
export { useTheme } from './hooks/useTheme.js';
export { ditloopPreset } from './tailwind.preset.js';
