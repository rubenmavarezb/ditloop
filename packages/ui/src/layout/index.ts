export {
  resolveLayout,
  adjustSplit,
  DEFAULT_WORKSPACE_LAYOUT,
} from './LayoutEngine/index.js';
export type {
  PanelSlot,
  LayoutConfig,
  LayoutRow,
  LayoutColumn,
  ResolvedPanel,
  PanelConstraints,
} from './LayoutEngine/index.js';

export { PanelContainer } from './PanelContainer/index.js';
export type { PanelContainerProps } from './PanelContainer/index.js';

export { FocusablePanel } from './FocusablePanel/index.js';
export type { FocusablePanelProps } from './FocusablePanel/index.js';
