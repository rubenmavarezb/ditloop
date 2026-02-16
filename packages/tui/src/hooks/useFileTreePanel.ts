import { useState, useEffect, useCallback } from 'react';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
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
 * Hook that manages file tree panel state with real filesystem data.
 * Reads directory contents and supports expand/collapse navigation.
 *
 * @param rootPath - Path to the directory to display
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

      const isExpanding = !node.expanded;
      const updated = [...prev];
      updated[selectedIndex] = { ...node, expanded: isExpanding };

      if (!isExpanding) {
        // Collapse: remove all children at deeper depth
        let removeCount = 0;
        for (let i = selectedIndex + 1; i < updated.length; i++) {
          if (updated[i].depth > node.depth) removeCount++;
          else break;
        }
        if (removeCount > 0) updated.splice(selectedIndex + 1, removeCount);
      } else {
        // Expand: load children asynchronously
        loadChildren(node.path, node.depth + 1).then((children) => {
          setNodes((current) => {
            const idx = current.findIndex((n) => n.path === node.path);
            if (idx === -1) return current;
            const result = [...current];
            result.splice(idx + 1, 0, ...children);
            return result;
          });
        });
      }

      return updated;
    });
  }, [selectedIndex]);

  const selectedPath = nodes[selectedIndex]?.path ?? null;

  useEffect(() => {
    if (!rootPath) {
      setNodes([]);
      setSelectedIndex(0);
      return;
    }

    loadChildren(rootPath, 0).then((entries) => {
      setNodes(entries);
      setSelectedIndex(0);
    });
  }, [rootPath]);

  return { nodes, selectedIndex, moveUp, moveDown, toggleExpand, selectedPath };
}

/**
 * Load directory children as tree nodes.
 *
 * @param dirPath - Directory path to read
 * @param depth - Nesting depth for indentation
 * @returns Array of tree node entries
 */
async function loadChildren(dirPath: string, depth: number): Promise<TreeNodeEntry[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith('.') || e.name === '.ai')
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((e) => ({
        name: e.name,
        path: join(dirPath, e.name),
        isDirectory: e.isDirectory(),
        depth,
        expanded: false,
      }));
  } catch {
    return [];
  }
}
