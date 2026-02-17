import { useCallback, useRef } from 'react';

/** Direction the resize handle operates in. */
export type ResizeDirection = 'horizontal' | 'vertical';

/** Props for the ResizeHandle component. */
export interface ResizeHandleProps {
  /** Resize direction — horizontal drags left/right, vertical drags up/down. */
  direction: ResizeDirection;
  /** Called continuously during drag with the delta in pixels. */
  onResize: (delta: number) => void;
  /** Called when drag starts. */
  onResizeStart?: () => void;
  /** Called when drag ends. */
  onResizeEnd?: () => void;
}

/**
 * Draggable resize handle between panels.
 * Placed between adjacent panels to allow resizing by dragging.
 */
export function ResizeHandle({ direction, onResize, onResizeStart, onResizeEnd }: ResizeHandleProps) {
  const startPos = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
      onResizeStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
        const delta = currentPos - startPos.current;
        startPos.current = currentPos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        onResizeEnd?.();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [direction, onResize, onResizeStart, onResizeEnd],
  );

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`group relative z-10 flex-shrink-0 ${
        isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      }`}
      role="separator"
      aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
    >
      {/* Visual indicator on hover/drag */}
      <div
        className={`absolute transition-opacity duration-150 opacity-0 group-hover:opacity-100 ${
          isHorizontal
            ? 'left-0 top-0 h-full w-full'
            : 'left-0 top-0 h-full w-full'
        }`}
        style={{ backgroundColor: 'var(--dl-accent-primary)', opacity: undefined }}
      />
    </div>
  );
}
