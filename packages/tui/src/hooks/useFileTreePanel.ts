import { useState, useEffect, useCallback } from 'react';
import type { TreeNodeEntry } from '@ditloop/ui';

/** Data returned by the useFileTreePanel hook. */
export interface FileTreePanelData {
  /** Flattened tree nodes in display order. */
  nodes: TreeNodeEntry[];
  /** Currently selected node index. */
  selectedIndex: number;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
  /** Toggle expand/collapse of selected directory. */
  toggleExpand: () => void;
  /** Path of the currently selected node. */
  selectedPath: string | null;
}

/**
 * Hook that manages file tree panel state and connects to core FileTreeBuilder.
 * Provides selection navigation, expand/collapse, and live directory updates.
 *
 * @param rootPath - Path to the directory to display (typically .ai/)
 * @returns Panel data with tree nodes and interaction controls
 */
export function useFileTreePanel(rootPath: string | null): FileTreePanelData {
  const [nodes, setNodes] = useState<TreeNodeEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(nodes.length - 1, prev + 1));
  }, [nodes.length]);

  const toggleExpand = useCallback(() => {
    setNodes((prev) => {
      const node = prev[selectedIndex];
      if (!node || !node.isDirectory) return prev;
      return prev.map((n, i) => i === selectedIndex ? { ...n, expanded: !n.expanded } : n);
    });
  }, [selectedIndex]);

  const selectedPath = nodes[selectedIndex]?.path ?? null;

  useEffect(() => {
    if (!rootPath) {
      setNodes([]);
      setSelectedIndex(0);
      return;
    }

    // TODO: Wire to FileTreeBuilder.build() for initial tree
    // and watch for file system changes.
    setSelectedIndex(0);
  }, [rootPath]);

  return { nodes, selectedIndex, moveUp, moveDown, toggleExpand, selectedPath };
}
