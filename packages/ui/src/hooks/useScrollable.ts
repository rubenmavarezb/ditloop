import { useState, useCallback } from 'react';

/** Return type of the useScrollable hook. */
export interface ScrollableState {
  /** Currently selected index. */
  selectedIndex: number;
  /** First visible item index for windowed rendering. */
  scrollOffset: number;
  /** Move selection up by one. */
  moveUp: () => void;
  /** Move selection down by one. */
  moveDown: () => void;
  /** Set selection to a specific index. */
  selectIndex: (index: number) => void;
}

/**
 * Hook for keyboard-navigable scrollable lists.
 * Manages selection index and scroll offset for windowed rendering.
 *
 * @param itemCount - Total number of items in the list
 * @param visibleCount - Number of items visible at once
 * @returns Scrollable state with navigation handlers
 */
export function useScrollable(itemCount: number, visibleCount: number): ScrollableState {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const clampAndScroll = useCallback(
    (newIndex: number) => {
      const clamped = Math.max(0, Math.min(newIndex, itemCount - 1));
      setSelectedIndex(clamped);

      // Adjust scroll offset to keep selection visible
      if (clamped < scrollOffset) {
        setScrollOffset(clamped);
      } else if (clamped >= scrollOffset + visibleCount) {
        setScrollOffset(clamped - visibleCount + 1);
      }
    },
    [itemCount, visibleCount, scrollOffset],
  );

  const moveUp = useCallback(() => {
    clampAndScroll(selectedIndex - 1);
  }, [selectedIndex, clampAndScroll]);

  const moveDown = useCallback(() => {
    clampAndScroll(selectedIndex + 1);
  }, [selectedIndex, clampAndScroll]);

  const selectIndex = useCallback(
    (index: number) => {
      clampAndScroll(index);
    },
    [clampAndScroll],
  );

  return { selectedIndex, scrollOffset, moveUp, moveDown, selectIndex };
}
