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
  /** Accent color for highlights (green). */
  accent: string;
  /** Primary text color. */
  text: string;
  /** Dimmed/secondary text color. */
  textDim: string;
  /** Light gray text for identity and normal content. */
  textLight: string;
  /** Border color for panels. */
  border: string;
  /** Background color. */
  bg: string;
  /** Muted background for badges and input fields. */
  bgMuted: string;
  /** Input field background. */
  bgInput: string;
  /** Focused panel border color. */
  borderFocused: string;
  /** Panel header background. */
  panelHeader: string;
  /** Bright green for AIDF indicators. */
  activeLight: string;
  /** Dark yellow for feature branches. */
  warningDark: string;
  /** Dark red for hotfix branches. */
  errorDark: string;
}

/** Default color palette for DitLoop, matched to Figma design spec. */
export const defaultColors: ThemeColors = {
  active: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  idle: '#71717a',
  accent: '#22c55e',
  text: '#d1d1d1',
  textDim: '#666666',
  textLight: '#d4d4d8',
  border: '#666666',
  bg: '#0c0c0c',
  bgMuted: '#27272a',
  bgInput: '#18181b',
  borderFocused: '#22c55e',
  panelHeader: '#18181b',
  activeLight: '#4ade80',
  warningDark: '#ca8a04',
  errorDark: '#dc2626',
};
