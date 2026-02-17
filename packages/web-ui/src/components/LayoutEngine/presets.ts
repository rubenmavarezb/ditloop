import type { PanelState } from './panel-registry.js';

/** Layout preset identifier. */
export type LayoutPresetId = 'default' | 'code-focus' | 'ai-focus' | 'git-focus' | 'zen';

/** A layout preset defines which panels are visible and their sizes. */
export interface LayoutPreset {
  id: LayoutPresetId;
  name: string;
  description: string;
  icon: string;
  panels: Record<string, PanelState>;
}

/** Default layout — all panels visible (matches .pen mockup). */
const defaultPreset: LayoutPreset = {
  id: 'default',
  name: 'Default',
  description: 'All panels visible — sidebar, chat, terminal, git',
  icon: 'layout-dashboard',
  panels: {
    'workspace-nav': { visible: true, size: 280 },
    'ai-chat': { visible: true, size: 796 },
    terminal: { visible: true, size: 280 },
    'source-control': { visible: true, size: 320 },
  },
};

/** Code Focus — explorer only, editor maximized, short terminal. */
const codeFocusPreset: LayoutPreset = {
  id: 'code-focus',
  name: 'Code Focus',
  description: 'Explorer + maximized editor + compact terminal',
  icon: 'code',
  panels: {
    'file-explorer': { visible: true, size: 200 },
    'ai-chat': { visible: true, size: 900 },
    terminal: { visible: true, size: 200 },
    'source-control': { visible: false, size: 320 },
  },
};

/** AI Focus — AI Chat main, execution logs bottom, narrow source control. */
const aiFocusPreset: LayoutPreset = {
  id: 'ai-focus',
  name: 'AI Focus',
  description: 'AI Chat centered with task execution and context',
  icon: 'bot',
  panels: {
    'aidf-context': { visible: true, size: 260 },
    'ai-chat': { visible: true, size: 900 },
    'ai-task': { visible: true, size: 300 },
    'source-control': { visible: true, size: 280 },
  },
};

/** Git Focus — diff viewer center, commit history, source control wide. */
const gitFocusPreset: LayoutPreset = {
  id: 'git-focus',
  name: 'Git Focus',
  description: 'Diff viewer + commit history + wide source control',
  icon: 'git-branch',
  panels: {
    'file-explorer': { visible: true, size: 240 },
    'ai-chat': { visible: true, size: 800 },
    terminal: { visible: true, size: 300 },
    'source-control': { visible: true, size: 350 },
  },
};

/** Zen — everything hidden except center + minimal terminal. */
const zenPreset: LayoutPreset = {
  id: 'zen',
  name: 'Zen',
  description: 'Distraction-free — center panel only',
  icon: 'eye-off',
  panels: {
    'workspace-nav': { visible: false, size: 280 },
    'ai-chat': { visible: true, size: 1000 },
    terminal: { visible: true, size: 160 },
    'source-control': { visible: false, size: 320 },
  },
};

/** All available layout presets indexed by ID. */
export const layoutPresets: Record<LayoutPresetId, LayoutPreset> = {
  default: defaultPreset,
  'code-focus': codeFocusPreset,
  'ai-focus': aiFocusPreset,
  'git-focus': gitFocusPreset,
  zen: zenPreset,
};

/** Default preset ID. */
export const DEFAULT_PRESET: LayoutPresetId = 'default';
