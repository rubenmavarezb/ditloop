import type { ThemeTokens } from './tokens.js';

/** Available theme identifiers. */
export type ThemeId = 'neon' | 'brutalist' | 'classic' | 'light';

/** Theme metadata + token values. */
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

/**
 * Neon theme — teal accent, dark bg, glassmorphism, rounded corners.
 * This is the default DitLoop theme matching the SuperDesign mockup.
 */
export const neonTheme: ThemeDefinition = {
  id: 'neon',
  name: 'Neon',
  description: 'Cyan & purple glassmorphism on deep dark',
  tokens: {
    '--dl-bg-base': '#050508',
    '--dl-bg-surface': '#0f0f13',
    '--dl-bg-panel': 'rgba(15, 15, 19, 0.6)',
    '--dl-bg-panel-hover': 'rgba(255, 255, 255, 0.05)',
    '--dl-bg-overlay': 'rgba(0, 0, 0, 0.2)',
    '--dl-bg-header': 'rgba(10, 10, 15, 0.4)',
    '--dl-bg-input': 'rgba(0, 0, 0, 0.2)',
    '--dl-bg-terminal': '#08080a',

    '--dl-accent-primary': '#00d9ff',
    '--dl-accent-secondary': '#bd00ff',
    '--dl-accent-gradient': 'linear-gradient(135deg, #00d9ff, #9d00d4)',

    '--dl-text-primary': '#d1d5db',
    '--dl-text-secondary': '#9ca3af',
    '--dl-text-muted': '#6b7280',
    '--dl-text-inverse': '#050508',

    '--dl-color-success': '#34d399',
    '--dl-color-warning': '#facc15',
    '--dl-color-error': '#f87171',
    '--dl-color-info': '#00d9ff',

    '--dl-border-subtle': 'rgba(255, 255, 255, 0.05)',
    '--dl-border-default': 'rgba(255, 255, 255, 0.08)',
    '--dl-border-strong': 'rgba(255, 255, 255, 0.1)',
    '--dl-border-accent': '#00d9ff',

    '--dl-glass-bg': 'rgba(15, 15, 19, 0.6)',
    '--dl-glass-border': 'rgba(255, 255, 255, 0.08)',
    '--dl-glass-blur': '10.5px',
    '--dl-glass-shadow': '0 4px 26px rgba(0, 0, 0, 0.5)',

    '--dl-glow-primary': '0 0 8px rgba(0, 217, 255, 0.6)',
    '--dl-glow-secondary': '0 0 8px rgba(189, 0, 255, 0.6)',

    '--dl-space-panel-gap': '12px',
    '--dl-space-panel-padding': '12px',

    '--dl-radius-panel': '16px',
    '--dl-radius-card': '12px',
    '--dl-radius-button': '8px',
    '--dl-radius-pill': '9999px',
    '--dl-radius-small': '4px',

    '--dl-font-sans': "'Inter', system-ui, -apple-system, sans-serif",
    '--dl-font-mono': "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",

    '--dl-shadow-panel': '0 4px 26px rgba(0, 0, 0, 0.5)',
    '--dl-shadow-dropdown': '0 8px 32px rgba(0, 0, 0, 0.6)',

    '--dl-scrollbar-thumb': 'rgba(0, 217, 255, 0.3)',
    '--dl-scrollbar-thumb-hover': 'rgba(0, 217, 255, 0.5)',
  },
};

/**
 * Brutalist theme — red accent, sharp corners, monospace, bold.
 */
export const brutalistTheme: ThemeDefinition = {
  id: 'brutalist',
  name: 'Brutalist',
  description: 'Sharp edges, red accent, monospace type',
  tokens: {
    '--dl-bg-base': '#111111',
    '--dl-bg-surface': '#1a1a1a',
    '--dl-bg-panel': '#1a1a1a',
    '--dl-bg-panel-hover': 'rgba(255, 255, 255, 0.05)',
    '--dl-bg-overlay': 'rgba(0, 0, 0, 0.4)',
    '--dl-bg-header': '#111111',
    '--dl-bg-input': '#0d0d0d',
    '--dl-bg-terminal': '#0a0a0a',

    '--dl-accent-primary': '#ef4444',
    '--dl-accent-secondary': '#f97316',
    '--dl-accent-gradient': 'linear-gradient(135deg, #ef4444, #f97316)',

    '--dl-text-primary': '#e5e5e5',
    '--dl-text-secondary': '#a3a3a3',
    '--dl-text-muted': '#737373',
    '--dl-text-inverse': '#111111',

    '--dl-color-success': '#22c55e',
    '--dl-color-warning': '#eab308',
    '--dl-color-error': '#ef4444',
    '--dl-color-info': '#3b82f6',

    '--dl-border-subtle': 'rgba(255, 255, 255, 0.06)',
    '--dl-border-default': 'rgba(255, 255, 255, 0.12)',
    '--dl-border-strong': 'rgba(255, 255, 255, 0.2)',
    '--dl-border-accent': '#ef4444',

    '--dl-glass-bg': '#1a1a1a',
    '--dl-glass-border': 'rgba(255, 255, 255, 0.12)',
    '--dl-glass-blur': '0px',
    '--dl-glass-shadow': '4px 4px 0 rgba(0, 0, 0, 0.8)',

    '--dl-glow-primary': 'none',
    '--dl-glow-secondary': 'none',

    '--dl-space-panel-gap': '8px',
    '--dl-space-panel-padding': '8px',

    '--dl-radius-panel': '0px',
    '--dl-radius-card': '0px',
    '--dl-radius-button': '0px',
    '--dl-radius-pill': '0px',
    '--dl-radius-small': '0px',

    '--dl-font-sans': "'JetBrains Mono', 'Fira Code', monospace",
    '--dl-font-mono': "'JetBrains Mono', 'Fira Code', monospace",

    '--dl-shadow-panel': '4px 4px 0 rgba(0, 0, 0, 0.8)',
    '--dl-shadow-dropdown': '4px 4px 0 rgba(0, 0, 0, 0.8)',

    '--dl-scrollbar-thumb': 'rgba(239, 68, 68, 0.4)',
    '--dl-scrollbar-thumb-hover': 'rgba(239, 68, 68, 0.6)',
  },
};

/**
 * Classic theme — muted green accent, darker bg, dense spacing, keyboard hints.
 */
export const classicTheme: ThemeDefinition = {
  id: 'classic',
  name: 'Classic',
  description: 'Muted green, dense spacing, old-school IDE feel',
  tokens: {
    '--dl-bg-base': '#1e1e1e',
    '--dl-bg-surface': '#252526',
    '--dl-bg-panel': '#252526',
    '--dl-bg-panel-hover': '#2a2d2e',
    '--dl-bg-overlay': 'rgba(0, 0, 0, 0.3)',
    '--dl-bg-header': '#333333',
    '--dl-bg-input': '#3c3c3c',
    '--dl-bg-terminal': '#1e1e1e',

    '--dl-accent-primary': '#4ec9b0',
    '--dl-accent-secondary': '#569cd6',
    '--dl-accent-gradient': 'linear-gradient(135deg, #4ec9b0, #569cd6)',

    '--dl-text-primary': '#cccccc',
    '--dl-text-secondary': '#858585',
    '--dl-text-muted': '#5a5a5a',
    '--dl-text-inverse': '#1e1e1e',

    '--dl-color-success': '#6a9955',
    '--dl-color-warning': '#cca700',
    '--dl-color-error': '#f14c4c',
    '--dl-color-info': '#569cd6',

    '--dl-border-subtle': '#2d2d2d',
    '--dl-border-default': '#3e3e3e',
    '--dl-border-strong': '#505050',
    '--dl-border-accent': '#4ec9b0',

    '--dl-glass-bg': '#252526',
    '--dl-glass-border': '#3e3e3e',
    '--dl-glass-blur': '0px',
    '--dl-glass-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',

    '--dl-glow-primary': 'none',
    '--dl-glow-secondary': 'none',

    '--dl-space-panel-gap': '1px',
    '--dl-space-panel-padding': '0px',

    '--dl-radius-panel': '0px',
    '--dl-radius-card': '4px',
    '--dl-radius-button': '2px',
    '--dl-radius-pill': '2px',
    '--dl-radius-small': '2px',

    '--dl-font-sans': "'Segoe UI', system-ui, -apple-system, sans-serif",
    '--dl-font-mono': "'Cascadia Code', 'Consolas', monospace",

    '--dl-shadow-panel': '0 2px 8px rgba(0, 0, 0, 0.3)',
    '--dl-shadow-dropdown': '0 4px 16px rgba(0, 0, 0, 0.4)',

    '--dl-scrollbar-thumb': 'rgba(121, 121, 121, 0.4)',
    '--dl-scrollbar-thumb-hover': 'rgba(121, 121, 121, 0.7)',
  },
};

/**
 * Light theme — light bg, dark text, blue accent, standard IDE feel.
 */
export const lightTheme: ThemeDefinition = {
  id: 'light',
  name: 'Light',
  description: 'Light background, blue accent, clean and minimal',
  tokens: {
    '--dl-bg-base': '#ffffff',
    '--dl-bg-surface': '#f5f5f5',
    '--dl-bg-panel': '#ffffff',
    '--dl-bg-panel-hover': '#f0f0f0',
    '--dl-bg-overlay': 'rgba(0, 0, 0, 0.06)',
    '--dl-bg-header': '#fafafa',
    '--dl-bg-input': '#ffffff',
    '--dl-bg-terminal': '#1e1e1e',

    '--dl-accent-primary': '#2563eb',
    '--dl-accent-secondary': '#7c3aed',
    '--dl-accent-gradient': 'linear-gradient(135deg, #2563eb, #7c3aed)',

    '--dl-text-primary': '#1f2937',
    '--dl-text-secondary': '#6b7280',
    '--dl-text-muted': '#9ca3af',
    '--dl-text-inverse': '#ffffff',

    '--dl-color-success': '#16a34a',
    '--dl-color-warning': '#ca8a04',
    '--dl-color-error': '#dc2626',
    '--dl-color-info': '#2563eb',

    '--dl-border-subtle': '#f3f4f6',
    '--dl-border-default': '#e5e7eb',
    '--dl-border-strong': '#d1d5db',
    '--dl-border-accent': '#2563eb',

    '--dl-glass-bg': 'rgba(255, 255, 255, 0.8)',
    '--dl-glass-border': '#e5e7eb',
    '--dl-glass-blur': '8px',
    '--dl-glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',

    '--dl-glow-primary': 'none',
    '--dl-glow-secondary': 'none',

    '--dl-space-panel-gap': '8px',
    '--dl-space-panel-padding': '8px',

    '--dl-radius-panel': '12px',
    '--dl-radius-card': '8px',
    '--dl-radius-button': '6px',
    '--dl-radius-pill': '9999px',
    '--dl-radius-small': '4px',

    '--dl-font-sans': "'Inter', system-ui, -apple-system, sans-serif",
    '--dl-font-mono': "'JetBrains Mono', 'Fira Code', monospace",

    '--dl-shadow-panel': '0 1px 3px rgba(0, 0, 0, 0.08)',
    '--dl-shadow-dropdown': '0 4px 16px rgba(0, 0, 0, 0.12)',

    '--dl-scrollbar-thumb': 'rgba(0, 0, 0, 0.15)',
    '--dl-scrollbar-thumb-hover': 'rgba(0, 0, 0, 0.3)',
  },
};

/** All available themes indexed by ID. */
export const themes: Record<ThemeId, ThemeDefinition> = {
  neon: neonTheme,
  brutalist: brutalistTheme,
  classic: classicTheme,
  light: lightTheme,
};

/** Default theme ID. */
export const DEFAULT_THEME: ThemeId = 'neon';
