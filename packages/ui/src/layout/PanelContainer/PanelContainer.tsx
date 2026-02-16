import { Box } from 'ink';
import type { ReactNode } from 'react';
import type { ResolvedPanel } from '../LayoutEngine/index.js';

/** Props for the PanelContainer component. */
export interface PanelContainerProps {
  /** Resolved panels with absolute positions from resolveLayout. */
  panels: ResolvedPanel[];
  /** Render function called for each panel. */
  renderPanel: (panelId: string, width: number, height: number) => ReactNode;
}

/**
 * Container that arranges resolved panels into rows using Ink flexbox.
 * Groups panels by y-coordinate into rows, then renders each row
 * with its columns sized according to the resolved dimensions.
 *
 * @param props - Panel container configuration
 */
export function PanelContainer({ panels, renderPanel }: PanelContainerProps) {
  // Group panels by y-coordinate into rows
  const rowMap = new Map<number, ResolvedPanel[]>();
  for (const panel of panels) {
    const existing = rowMap.get(panel.y);
    if (existing) {
      existing.push(panel);
    } else {
      rowMap.set(panel.y, [panel]);
    }
  }

  // Sort rows by y position
  const sortedRows = [...rowMap.entries()].sort(([a], [b]) => a - b);

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {sortedRows.map(([y, rowPanels]) => {
        // Sort panels within row by x position
        const sorted = [...rowPanels].sort((a, b) => a.x - b.x);

        return (
          <Box key={y} flexDirection="row">
            {sorted.map((panel) => (
              <Box
                key={panel.panelId}
                width={panel.width}
                height={panel.height}
              >
                {renderPanel(panel.panelId, panel.width, panel.height)}
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
