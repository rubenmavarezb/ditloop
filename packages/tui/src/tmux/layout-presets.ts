import type { TmuxManager, PaneIds } from './tmux-manager.js';

/** Available layout names. */
export type LayoutName = 'default' | 'code-focus' | 'git-focus' | 'multi-terminal' | 'zen';

/** Configuration for a single pane within a layout. */
export interface LayoutPaneConfig {
  /** Pane role identifier. */
  id: string;
  /** Pane role. */
  role: 'sidebar' | 'terminal' | 'git' | 'status';
  /** Position in the layout. */
  position: 'left' | 'center' | 'right' | 'bottom';
  /** Size as a percentage of total width/height. */
  sizePercent: number;
  /** Whether this pane is visible in this layout. */
  visible: boolean;
}

/** A named layout preset definition. */
export interface LayoutPreset {
  /** Layout identifier. */
  name: LayoutName;
  /** Human-readable label. */
  label: string;
  /** Description of the layout. */
  description: string;
  /** Pane configurations for this layout. */
  panes: LayoutPaneConfig[];
}

/** All 5 layout preset definitions. */
export const LAYOUT_PRESETS: Record<LayoutName, LayoutPreset> = {
  default: {
    name: 'default',
    label: 'Default',
    description: 'Sidebar (25%) | Terminal (50%) | Git (25%)',
    panes: [
      { id: 'sidebar', role: 'sidebar', position: 'left', sizePercent: 25, visible: true },
      { id: 'terminal', role: 'terminal', position: 'center', sizePercent: 50, visible: true },
      { id: 'git', role: 'git', position: 'right', sizePercent: 25, visible: true },
    ],
  },
  'code-focus': {
    name: 'code-focus',
    label: 'Code Focus',
    description: 'Sidebar (10%) | Terminal (80%) | Git (10%)',
    panes: [
      { id: 'sidebar', role: 'sidebar', position: 'left', sizePercent: 10, visible: true },
      { id: 'terminal', role: 'terminal', position: 'center', sizePercent: 80, visible: true },
      { id: 'git', role: 'git', position: 'right', sizePercent: 10, visible: true },
    ],
  },
  'git-focus': {
    name: 'git-focus',
    label: 'Git Focus',
    description: 'Sidebar (20%) | Terminal (50%) | Git (30%)',
    panes: [
      { id: 'sidebar', role: 'sidebar', position: 'left', sizePercent: 20, visible: true },
      { id: 'terminal', role: 'terminal', position: 'center', sizePercent: 50, visible: true },
      { id: 'git', role: 'git', position: 'right', sizePercent: 30, visible: true },
    ],
  },
  'multi-terminal': {
    name: 'multi-terminal',
    label: 'Multi-Terminal',
    description: 'Sidebar (20%) | Terminals (50%) | Git (30%)',
    panes: [
      { id: 'sidebar', role: 'sidebar', position: 'left', sizePercent: 20, visible: true },
      { id: 'terminal', role: 'terminal', position: 'center', sizePercent: 50, visible: true },
      { id: 'git', role: 'git', position: 'right', sizePercent: 30, visible: true },
    ],
  },
  zen: {
    name: 'zen',
    label: 'Zen',
    description: 'Terminal only (100%)',
    panes: [
      { id: 'sidebar', role: 'sidebar', position: 'left', sizePercent: 0, visible: false },
      { id: 'terminal', role: 'terminal', position: 'center', sizePercent: 100, visible: true },
      { id: 'git', role: 'git', position: 'right', sizePercent: 0, visible: false },
    ],
  },
};

/** Keyboard shortcut mapping for layouts. */
const LAYOUT_SHORTCUTS: Record<LayoutName, string> = {
  default: 'Ctrl+1',
  'code-focus': 'Ctrl+2',
  'git-focus': 'Ctrl+3',
  'multi-terminal': 'Ctrl+4',
  zen: 'Ctrl+5',
};

/**
 * Get the keyboard shortcut for a layout.
 *
 * @param layout - Layout name
 * @returns Shortcut string like "Ctrl+1"
 */
export function getLayoutShortcut(layout: LayoutName): string {
  return LAYOUT_SHORTCUTS[layout];
}

/**
 * Apply a layout preset to the tmux session by resizing panes.
 *
 * @param manager - TmuxManager instance
 * @param layout - Layout name to apply
 * @param paneIds - Current pane identifiers
 */
export async function applyLayout(
  manager: TmuxManager,
  layout: LayoutName,
  paneIds: PaneIds,
): Promise<void> {
  const preset = LAYOUT_PRESETS[layout];
  const totalWidth = (process.stdout.columns ?? 200);

  for (const pane of preset.panes) {
    const paneId = paneIds[pane.role as keyof PaneIds];
    if (!paneId) continue;

    if (!pane.visible || pane.sizePercent === 0) {
      const cols = 1;
      await manager.resizePane(paneId, 'x', cols);
    } else {
      const cols = Math.floor((pane.sizePercent / 100) * totalWidth);
      await manager.resizePane(paneId, 'x', cols);
    }
  }
}
