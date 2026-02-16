/** Position of a panel in the layout grid. */
export interface PanelSlot {
  panelId: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

/** Declarative layout configuration. */
export interface LayoutConfig {
  rows: LayoutRow[];
  bottomBar?: { panelId: string; height: number };
}

/** A single row in the layout grid. */
export interface LayoutRow {
  /** Row height as percentage string (e.g., '33%') or absolute number string (e.g., '6'). */
  height: string;
  columns: LayoutColumn[];
}

/** A single column within a layout row. */
export interface LayoutColumn {
  panelId: string;
  /** Column width as percentage string (e.g., '40%'). */
  width: string;
  /** Span multiple rows in this column position. */
  rowSpan?: number;
}

/** Resolved panel with absolute terminal coordinates. */
export interface ResolvedPanel {
  panelId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Minimum size constraints for panels. */
export interface PanelConstraints {
  minWidth?: number;
  minHeight?: number;
}

/**
 * Parse a dimension string into an absolute value.
 *
 * @param value - Percentage string (e.g., '33%') or absolute number string (e.g., '6')
 * @param total - The total available space to resolve percentages against
 * @returns Resolved absolute value (floored)
 */
function parseDimension(value: string, total: number): number {
  if (value.endsWith('%')) {
    const pct = parseFloat(value.slice(0, -1));
    return Math.floor((pct / 100) * total);
  }
  return Math.floor(parseFloat(value));
}

/**
 * Convert a percentage-based layout config into absolute terminal coordinates.
 * Handles percentage heights/widths, rowSpan, bottomBar, and remainder distribution.
 *
 * @param config - Declarative layout configuration
 * @param termWidth - Terminal width in columns
 * @param termHeight - Terminal height in rows
 * @returns Array of resolved panels with absolute positions
 */
export function resolveLayout(
  config: LayoutConfig,
  termWidth: number,
  termHeight: number,
): ResolvedPanel[] {
  const panels: ResolvedPanel[] = [];

  // Reserve bottom bar space
  const bottomBarHeight = config.bottomBar ? config.bottomBar.height : 0;
  const availableHeight = termHeight - bottomBarHeight;

  // Resolve row heights
  const rawHeights = config.rows.map((row) =>
    parseDimension(row.height, availableHeight),
  );

  // Distribute remainder to last row
  const totalRawHeight = rawHeights.reduce((sum, h) => sum + h, 0);
  const heightRemainder = availableHeight - totalRawHeight;
  if (heightRemainder !== 0 && rawHeights.length > 0) {
    rawHeights[rawHeights.length - 1] += heightRemainder;
  }

  // Calculate y positions for each row
  const rowYPositions: number[] = [];
  let currentY = 0;
  for (let ri = 0; ri < config.rows.length; ri++) {
    rowYPositions.push(currentY);
    currentY += rawHeights[ri];
  }

  // Track which cells are occupied by rowSpan from previous rows.
  // Maps "rowIndex" -> set of x-ranges that are occupied
  const occupiedRanges = new Map<number, { x: number; width: number; panelId: string }[]>();

  // Resolve each row
  for (let ri = 0; ri < config.rows.length; ri++) {
    const row = config.rows[ri];
    const y = rowYPositions[ri];
    const rowHeight = rawHeights[ri];

    // Check if any columns from a rowSpan above occupy space in this row
    const spannedInRow = occupiedRanges.get(ri) ?? [];
    const spannedWidth = spannedInRow.reduce((sum, s) => sum + s.width, 0);
    const availableWidth = termWidth - spannedWidth;

    // Resolve column widths based on available width
    const colWidths = row.columns.map((col) =>
      parseDimension(col.width, availableWidth),
    );

    // Distribute width remainder to last column
    const totalColWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const widthRemainder = availableWidth - totalColWidth;
    if (widthRemainder !== 0 && colWidths.length > 0) {
      colWidths[colWidths.length - 1] += widthRemainder;
    }

    // Build free x-regions around spanned panels
    const sortedSpanned = [...spannedInRow].sort((a, b) => a.x - b.x);
    const freeRegions: { x: number; width: number }[] = [];
    let freeX = 0;
    for (const sp of sortedSpanned) {
      if (sp.x > freeX) {
        freeRegions.push({ x: freeX, width: sp.x - freeX });
      }
      freeX = sp.x + sp.width;
    }
    if (freeX < termWidth) {
      freeRegions.push({ x: freeX, width: termWidth - freeX });
    }

    // If no spanned panels, one region covers the whole width
    if (freeRegions.length === 0) {
      freeRegions.push({ x: 0, width: termWidth });
    }

    // Place columns sequentially into free regions
    let regionIdx = 0;
    let regionOffset = 0;

    for (let ci = 0; ci < row.columns.length; ci++) {
      const col = row.columns[ci];
      const colWidth = colWidths[ci];
      const span = col.rowSpan ?? 1;

      // Calculate spanned height
      let spanHeight = 0;
      for (let s = 0; s < span && ri + s < rawHeights.length; s++) {
        spanHeight += rawHeights[ri + s];
      }

      // Find the free region to place this column
      if (regionIdx < freeRegions.length) {
        const region = freeRegions[regionIdx];
        const panelX = region.x + regionOffset;

        panels.push({
          panelId: col.panelId,
          x: panelX,
          y,
          width: colWidth,
          height: spanHeight,
        });

        // Register occupation for subsequent rows if rowSpan > 1
        if (span > 1) {
          for (let s = 1; s < span && ri + s < config.rows.length; s++) {
            const targetRow = ri + s;
            if (!occupiedRanges.has(targetRow)) {
              occupiedRanges.set(targetRow, []);
            }
            occupiedRanges.get(targetRow)!.push({
              x: panelX,
              width: colWidth,
              panelId: col.panelId,
            });
          }
        }

        regionOffset += colWidth;
        if (regionOffset >= region.width) {
          regionIdx++;
          regionOffset = 0;
        }
      }
    }
  }

  // Add bottom bar
  if (config.bottomBar) {
    panels.push({
      panelId: config.bottomBar.panelId,
      x: 0,
      y: termHeight - bottomBarHeight,
      width: termWidth,
      height: bottomBarHeight,
    });
  }

  return panels;
}

/**
 * Adjust a split boundary by delta percentage points, clamped to 15% minimum.
 * Finds the panel in the layout and adjusts its width or height,
 * redistributing the change to the neighbor.
 *
 * @param config - Current layout configuration
 * @param panelId - The panel whose boundary to adjust
 * @param axis - 'v' for vertical (adjust column widths) or 'h' for horizontal (adjust row heights)
 * @param delta - Percentage points to add (positive) or subtract (negative)
 * @returns New layout configuration with adjusted split
 */
export function adjustSplit(
  config: LayoutConfig,
  panelId: string,
  axis: 'h' | 'v',
  delta: number,
): LayoutConfig {
  const MIN_PCT = 15;
  const newConfig: LayoutConfig = {
    ...config,
    rows: config.rows.map((row) => ({
      ...row,
      columns: row.columns.map((col) => ({ ...col })),
    })),
  };

  if (axis === 'v') {
    // Find which row contains this panel
    for (const row of newConfig.rows) {
      const colIdx = row.columns.findIndex((c) => c.panelId === panelId);
      if (colIdx === -1) continue;

      // Must have a neighbor to the right
      if (colIdx >= row.columns.length - 1) break;

      const currentPct = parseFloat(row.columns[colIdx].width);
      const neighborPct = parseFloat(row.columns[colIdx + 1].width);

      let newCurrent = currentPct + delta;
      let newNeighbor = neighborPct - delta;

      // Clamp both to minimum
      if (newCurrent < MIN_PCT) {
        newCurrent = MIN_PCT;
        newNeighbor = currentPct + neighborPct - MIN_PCT;
      }
      if (newNeighbor < MIN_PCT) {
        newNeighbor = MIN_PCT;
        newCurrent = currentPct + neighborPct - MIN_PCT;
      }

      row.columns[colIdx].width = `${newCurrent}%`;
      row.columns[colIdx + 1].width = `${newNeighbor}%`;
      break;
    }
  } else {
    // Horizontal: adjust row heights
    const rowIdx = newConfig.rows.findIndex((row) =>
      row.columns.some((c) => c.panelId === panelId),
    );
    if (rowIdx === -1 || rowIdx >= newConfig.rows.length - 1) return newConfig;

    const currentPct = parseFloat(newConfig.rows[rowIdx].height);
    const neighborPct = parseFloat(newConfig.rows[rowIdx + 1].height);

    let newCurrent = currentPct + delta;
    let newNeighbor = neighborPct - delta;

    if (newCurrent < MIN_PCT) {
      newCurrent = MIN_PCT;
      newNeighbor = currentPct + neighborPct - MIN_PCT;
    }
    if (newNeighbor < MIN_PCT) {
      newNeighbor = MIN_PCT;
      newCurrent = currentPct + neighborPct - MIN_PCT;
    }

    newConfig.rows[rowIdx].height = `${newCurrent}%`;
    newConfig.rows[rowIdx + 1].height = `${newNeighbor}%`;
  }

  return newConfig;
}

/** Default workspace layout for the DitLoop TUI dashboard. */
export const DEFAULT_WORKSPACE_LAYOUT: LayoutConfig = {
  rows: [
    {
      height: '33%',
      columns: [
        { panelId: 'git-status', width: '35%' },
        { panelId: 'commits', width: '65%' },
      ],
    },
    {
      height: '34%',
      columns: [
        { panelId: 'tasks', width: '35%' },
        { panelId: 'preview', width: '65%', rowSpan: 2 },
      ],
    },
    {
      height: '33%',
      columns: [
        { panelId: 'branches', width: '35%' },
      ],
    },
  ],
  bottomBar: { panelId: 'command-log', height: 6 },
};
