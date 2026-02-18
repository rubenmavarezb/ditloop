/**
 * CSS custom property token definitions for the DitLoop theme system.
 * All UI components consume these tokens — never hardcode colors.
 */
export interface ThemeTokens {
  // Backgrounds
  '--dl-bg-base': string;
  '--dl-bg-surface': string;
  '--dl-bg-panel': string;
  '--dl-bg-panel-hover': string;
  '--dl-bg-overlay': string;
  '--dl-bg-header': string;
  '--dl-bg-input': string;
  '--dl-bg-terminal': string;

  // Accent colors
  '--dl-accent-primary': string;
  '--dl-accent-secondary': string;
  '--dl-accent-gradient': string;

  // Text colors
  '--dl-text-primary': string;
  '--dl-text-secondary': string;
  '--dl-text-muted': string;
  '--dl-text-inverse': string;

  // Semantic colors
  '--dl-color-success': string;
  '--dl-color-warning': string;
  '--dl-color-error': string;
  '--dl-color-info': string;

  // Borders
  '--dl-border-subtle': string;
  '--dl-border-default': string;
  '--dl-border-strong': string;
  '--dl-border-accent': string;

  // Glassmorphism
  '--dl-glass-bg': string;
  '--dl-glass-border': string;
  '--dl-glass-blur': string;
  '--dl-glass-shadow': string;

  // Glow effects
  '--dl-glow-primary': string;
  '--dl-glow-secondary': string;

  // Spacing (consistent across themes)
  '--dl-space-panel-gap': string;
  '--dl-space-panel-padding': string;

  // Border radius
  '--dl-radius-panel': string;
  '--dl-radius-card': string;
  '--dl-radius-button': string;
  '--dl-radius-pill': string;
  '--dl-radius-small': string;

  // Typography
  '--dl-font-sans': string;
  '--dl-font-mono': string;

  // Shadows
  '--dl-shadow-panel': string;
  '--dl-shadow-dropdown': string;

  // Scrollbar
  '--dl-scrollbar-thumb': string;
  '--dl-scrollbar-thumb-hover': string;
}

/** All available token names. */
export type ThemeTokenName = keyof ThemeTokens;
