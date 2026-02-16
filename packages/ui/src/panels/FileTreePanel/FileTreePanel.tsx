import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A node in the file tree. */
export interface TreeNodeEntry {
  /** File or directory name. */
  name: string;
  /** Relative path from workspace root. */
  path: string;
  /** Whether this is a directory. */
  isDirectory: boolean;
  /** Nesting depth (0 = root level). */
  depth: number;
  /** Whether this directory is expanded (only for directories). */
  expanded?: boolean;
}

/** Props for the FileTreePanel component. */
export interface FileTreePanelProps {
  /** Flattened tree nodes in display order. */
  nodes: TreeNodeEntry[];
  /** Currently selected node index. */
  selectedIndex: number;
  /** Called when a node is highlighted. */
  onNodeSelect?: (path: string) => void;
}

/**
 * Display a file tree with expandable directories.
 * Directories show a chevron indicator; files are indented under their parent.
 *
 * @param props - Tree data and callbacks
 */
export function FileTreePanel({
  nodes,
  selectedIndex,
}: FileTreePanelProps) {
  const theme = useTheme();

  if (nodes.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>No files</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {nodes.map((node, i) => {
        const selected = i === selectedIndex;
        const indent = '  '.repeat(node.depth);
        const icon = node.isDirectory
          ? node.expanded ? '▼ ' : '▶ '
          : '  ';
        const nameColor = node.isDirectory
          ? (selected ? theme.accent : theme.warning)
          : (selected ? theme.accent : theme.text);

        return (
          <Text key={node.path} color={nameColor}>
            {selected ? '>' : ' '} {indent}{icon}{node.name}
          </Text>
        );
      })}
    </Box>
  );
}
