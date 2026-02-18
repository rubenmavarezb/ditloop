/** Panel position within the IDE layout grid. */
export type PanelPosition = 'left' | 'center-top' | 'center-bottom' | 'right';

/** Panel definition in the registry. */
export interface PanelDefinition {
  /** Unique panel identifier. */
  id: string;
  /** Human-readable panel name. */
  name: string;
  /** Default position in the layout grid. */
  position: PanelPosition;
  /** Default size in pixels for the resizable axis. */
  defaultSize: number;
  /** Minimum size in pixels. */
  minSize: number;
  /** Maximum size in pixels. */
  maxSize: number;
  /** Icon name (lucide icon identifier). */
  icon?: string;
}

/** Runtime state for a panel instance. */
export interface PanelState {
  /** Whether the panel is currently visible. */
  visible: boolean;
  /** Current size in pixels for the resizable axis. */
  size: number;
}

/** All built-in panel definitions. */
export const PANEL_DEFINITIONS: Record<string, PanelDefinition> = {
  'workspace-nav': {
    id: 'workspace-nav',
    name: 'Workspace Navigator',
    position: 'left',
    defaultSize: 280,
    minSize: 200,
    maxSize: 400,
    icon: 'folder-tree',
  },
  'file-explorer': {
    id: 'file-explorer',
    name: 'File Explorer',
    position: 'left',
    defaultSize: 280,
    minSize: 200,
    maxSize: 400,
    icon: 'files',
  },
  'ai-chat': {
    id: 'ai-chat',
    name: 'AI Chat',
    position: 'center-top',
    defaultSize: 796,
    minSize: 300,
    maxSize: 1200,
    icon: 'message-square',
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    position: 'center-bottom',
    defaultSize: 280,
    minSize: 120,
    maxSize: 600,
    icon: 'terminal',
  },
  'source-control': {
    id: 'source-control',
    name: 'Source Control',
    position: 'right',
    defaultSize: 320,
    minSize: 240,
    maxSize: 480,
    icon: 'git-branch',
  },
  'ai-task': {
    id: 'ai-task',
    name: 'AI Task',
    position: 'center-bottom',
    defaultSize: 280,
    minSize: 120,
    maxSize: 600,
    icon: 'bot',
  },
  'aidf-context': {
    id: 'aidf-context',
    name: 'AIDF Context',
    position: 'right',
    defaultSize: 320,
    minSize: 240,
    maxSize: 480,
    icon: 'brain',
  },
};
