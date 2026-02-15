import { Box, Text, useInput } from 'ink';
import type { ReactNode } from 'react';
import { useScrollable } from '../../hooks/useScrollable.js';
import { useTheme } from '../../hooks/useTheme.js';

/** Props for the SelectList component. */
export interface SelectListProps<T> {
  /** Items to display in the list. */
  items: T[];
  /** Maximum visible items before scrolling. Defaults to 10. */
  visibleCount?: number;
  /** Render function for each item. */
  renderItem: (item: T, index: number, isSelected: boolean) => ReactNode;
  /** Called when an item is selected (Enter key). */
  onSelect?: (item: T, index: number) => void;
  /** Whether this list is focused and accepts keyboard input. Defaults to true. */
  isFocused?: boolean;
}

/**
 * Keyboard-navigable list with scrolling support.
 * Uses arrow keys for navigation and Enter to select.
 *
 * @param props - List configuration with items and render function
 */
export function SelectList<T>({
  items,
  visibleCount = 10,
  renderItem,
  onSelect,
  isFocused = true,
}: SelectListProps<T>) {
  const theme = useTheme();
  const { selectedIndex, scrollOffset, moveUp, moveDown } = useScrollable(
    items.length,
    visibleCount,
  );

  useInput(
    (input, key) => {
      if (key.upArrow) moveUp();
      if (key.downArrow) moveDown();
      if (key.return && items[selectedIndex]) {
        onSelect?.(items[selectedIndex], selectedIndex);
      }
    },
    { isActive: isFocused },
  );

  if (items.length === 0) {
    return <Text color={theme.textDim}>No items</Text>;
  }

  const visible = items.slice(scrollOffset, scrollOffset + visibleCount);
  const hasMore = scrollOffset + visibleCount < items.length;

  return (
    <Box flexDirection="column">
      {scrollOffset > 0 && <Text color={theme.textDim}>  ↑ more</Text>}
      {visible.map((item, i) => {
        const actualIndex = scrollOffset + i;
        return (
          <Box key={actualIndex}>
            {renderItem(item, actualIndex, actualIndex === selectedIndex)}
          </Box>
        );
      })}
      {hasMore && <Text color={theme.textDim}>  ↓ more</Text>}
    </Box>
  );
}
