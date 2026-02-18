import { useCallback, type ReactNode, type CSSProperties } from 'react';
import { useLayoutStore } from './useLayoutStore.js';
import { PANEL_DEFINITIONS } from './panel-registry.js';
import { ResizeHandle } from './ResizeHandle.js';

/** Slot map — consumers pass React nodes for each panel slot. */
export interface LayoutSlots {
  /** Left sidebar content (workspace nav or file explorer). */
  left?: ReactNode;
  /** Main center-top content (AI chat or editor). */
  centerTop?: ReactNode;
  /** Center-bottom content (terminal, AI task). */
  centerBottom?: ReactNode;
  /** Right sidebar content (source control, AIDF context). */
  right?: ReactNode;
}

/** Props for the LayoutEngine component. */
export interface LayoutEngineProps {
  /** Content for each panel slot. */
  slots: LayoutSlots;
}

/**
 * CSS Grid-based layout engine for the DitLoop IDE.
 * Renders panels in a responsive grid with resizable borders.
 * Layout matches the SuperDesign mockup: left sidebar | center (top+bottom) | right sidebar.
 */
export function LayoutEngine({ slots }: LayoutEngineProps) {
  const { panels, resizing, setPanelSize, setResizing } = useLayoutStore();

  // Determine which panels are visible
  const leftPanelId = findVisiblePanel(panels, ['workspace-nav', 'file-explorer', 'aidf-context']);
  const rightPanelId = findVisiblePanel(panels, ['source-control', 'aidf-context']);
  const bottomPanelId = findVisiblePanel(panels, ['terminal', 'ai-task']);

  const leftSize = leftPanelId ? panels[leftPanelId]?.size ?? 280 : 0;
  const rightSize = rightPanelId ? panels[rightPanelId]?.size ?? 320 : 0;
  const bottomSize = bottomPanelId ? panels[bottomPanelId]?.size ?? 280 : 0;

  const showLeft = !!leftPanelId;
  const showRight = !!rightPanelId;
  const showBottom = !!bottomPanelId;

  // Resize handlers
  const handleLeftResize = useCallback(
    (delta: number) => {
      if (!leftPanelId) return;
      const def = PANEL_DEFINITIONS[leftPanelId];
      const current = panels[leftPanelId]?.size ?? def?.defaultSize ?? 280;
      const clamped = clamp(current + delta, def?.minSize ?? 200, def?.maxSize ?? 400);
      setPanelSize(leftPanelId, clamped);
    },
    [leftPanelId, panels, setPanelSize],
  );

  const handleRightResize = useCallback(
    (delta: number) => {
      if (!rightPanelId) return;
      const def = PANEL_DEFINITIONS[rightPanelId];
      const current = panels[rightPanelId]?.size ?? def?.defaultSize ?? 320;
      // Right panel resizes inversely (drag left = bigger)
      const clamped = clamp(current - delta, def?.minSize ?? 240, def?.maxSize ?? 480);
      setPanelSize(rightPanelId, clamped);
    },
    [rightPanelId, panels, setPanelSize],
  );

  const handleBottomResize = useCallback(
    (delta: number) => {
      if (!bottomPanelId) return;
      const def = PANEL_DEFINITIONS[bottomPanelId];
      const current = panels[bottomPanelId]?.size ?? def?.defaultSize ?? 280;
      // Bottom panel: drag up = bigger (negative delta)
      const clamped = clamp(current - delta, def?.minSize ?? 120, def?.maxSize ?? 600);
      setPanelSize(bottomPanelId, clamped);
    },
    [bottomPanelId, panels, setPanelSize],
  );

  const handleResizeStart = useCallback(() => setResizing(true), [setResizing]);
  const handleResizeEnd = useCallback(() => setResizing(false), [setResizing]);

  const gap = 'var(--dl-space-panel-gap, 12px)';

  // Container style
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap,
    padding: gap,
    height: '100%',
    overflow: 'hidden',
    transition: resizing ? 'none' : undefined,
  };

  return (
    <div style={containerStyle} className="layout-engine">
      {/* Left Sidebar */}
      {showLeft && (
        <>
          <div
            className="layout-panel layout-panel-left"
            style={{
              width: leftSize,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <GlassPanel>{slots.left}</GlassPanel>
          </div>
          <ResizeHandle
            direction="horizontal"
            onResize={handleLeftResize}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
          />
        </>
      )}

      {/* Center Column */}
      <div
        className="layout-panel layout-panel-center"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Center Top (AI Chat / Editor) */}
        <div
          className="layout-panel layout-panel-center-top"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <GlassPanel>{slots.centerTop}</GlassPanel>
        </div>

        {/* Center Bottom (Terminal / AI Task) */}
        {showBottom && (
          <>
            <ResizeHandle
              direction="vertical"
              onResize={handleBottomResize}
              onResizeStart={handleResizeStart}
              onResizeEnd={handleResizeEnd}
            />
            <div
              className="layout-panel layout-panel-center-bottom"
              style={{
                height: bottomSize,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <GlassPanel>{slots.centerBottom}</GlassPanel>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar */}
      {showRight && (
        <>
          <ResizeHandle
            direction="horizontal"
            onResize={handleRightResize}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
          />
          <div
            className="layout-panel layout-panel-right"
            style={{
              width: rightSize,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <GlassPanel>{slots.right}</GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Glass panel wrapper — applies glassmorphism styling from theme tokens.
 */
function GlassPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="glass-panel"
      style={{
        height: '100%',
        borderRadius: 'var(--dl-radius-panel, 16px)',
        background: 'var(--dl-glass-bg, rgba(15, 15, 19, 0.6))',
        border: '1px solid var(--dl-glass-border, rgba(255, 255, 255, 0.08))',
        backdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        WebkitBackdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        boxShadow: 'var(--dl-glass-shadow, 0 4px 26px rgba(0, 0, 0, 0.5))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}

/** Find the first visible panel from a list of candidate IDs. */
function findVisiblePanel(
  panels: Record<string, { visible: boolean; size: number }>,
  candidates: string[],
): string | null {
  for (const id of candidates) {
    if (panels[id]?.visible) return id;
  }
  return null;
}

/** Clamp a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
