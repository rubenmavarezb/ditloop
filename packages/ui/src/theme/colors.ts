/** Color tokens for the DitLoop terminal UI theme. */
export interface ThemeColors {
  /** Active/success state (green). */
  active: string;
  /** Warning state (yellow). */
  warning: string;
  /** Error state (red). */
  error: string;
  /** Idle/inactive state (gray). */
  idle: string;
  /** Accent color for highlights (cyan). */
  accent: string;
  /** Primary text color. */
  text: string;
  /** Dimmed/secondary text color. */
  textDim: string;
  /** Border color for panels. */
  border: string;
  /** Background hint color. */
  bg: string;
}

/** Default color palette for DitLoop. */
export const defaultColors: ThemeColors = {
  active: '#2ecc71',
  warning: '#f1c40f',
  error: '#e74c3c',
  idle: '#7f8c8d',
  accent: '#00bcd4',
  text: '#ecf0f1',
  textDim: '#95a5a6',
  border: '#34495e',
  bg: '#1a1a2e',
};
