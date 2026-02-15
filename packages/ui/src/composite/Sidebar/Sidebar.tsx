import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useScrollable } from '../../hooks/useScrollable.js';
import { Panel } from '../../primitives/Panel/Panel.js';
import { WorkspaceItem } from '../WorkspaceItem/WorkspaceItem.js';
import type { WorkspaceItemData } from '../WorkspaceItem/WorkspaceItem.js';

/** Props for the Sidebar component. */
export interface SidebarProps {
  /** List of workspaces to display. */
  workspaces: WorkspaceItemData[];
  /** Called when a workspace is selected (Enter). */
  onSelect?: (workspace: WorkspaceItemData, index: number) => void;
  /** Called when a workspace is activated (double Enter or specific action). */
  onActivate?: (workspace: WorkspaceItemData, index: number) => void;
  /** Whether the sidebar is visible. Defaults to true. */
  visible?: boolean;
  /** Whether the sidebar is focused. Defaults to true. */
  isFocused?: boolean;
}

/**
 * Fixed-width sidebar panel displaying a navigable list of workspaces.
 * Supports keyboard navigation (arrows), expand/collapse (left/right), and selection (Enter).
 *
 * @param props - Sidebar configuration
 */
export function Sidebar({
  workspaces,
  onSelect,
  onActivate,
  visible = true,
  isFocused = true,
}: SidebarProps) {
  const theme = useTheme();
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const { selectedIndex, moveUp, moveDown } = useScrollable(workspaces.length, 20);

  useInput(
    (input, key) => {
      if (key.upArrow) moveUp();
      if (key.downArrow) moveDown();

      if (key.rightArrow) {
        const ws = workspaces[selectedIndex];
        if (ws?.type === 'group') {
          setExpandedSet((prev) => new Set(prev).add(selectedIndex));
        }
      }

      if (key.leftArrow) {
        setExpandedSet((prev) => {
          const next = new Set(prev);
          next.delete(selectedIndex);
          return next;
        });
      }

      if (key.return) {
        const ws = workspaces[selectedIndex];
        if (ws) {
          onSelect?.(ws, selectedIndex);
        }
      }

      if (input === 'a') {
        const ws = workspaces[selectedIndex];
        if (ws) {
          onActivate?.(ws, selectedIndex);
        }
      }
    },
    { isActive: isFocused },
  );

  if (!visible) return null;

  return (
    <Panel title="Workspaces" badge={String(workspaces.length)}>
      {workspaces.length === 0 ? (
        <Text color={theme.textDim}>No workspaces configured</Text>
      ) : (
        <Box flexDirection="column">
          {workspaces.map((ws, i) => (
            <WorkspaceItem
              key={i}
              workspace={ws}
              isSelected={i === selectedIndex}
              isExpanded={expandedSet.has(i)}
            />
          ))}
        </Box>
      )}
    </Panel>
  );
}
