import { useState, useEffect, useCallback, useMemo } from 'react';
import { safeInvoke } from '../../lib/tauri.js';
import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';
import { useGitStatus } from '../../hooks/useLocalGit.js';

/** File entry from Rust backend. */
interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_hidden: boolean;
  size: number;
  modified: number | null;
}

/** Tree node with children and expansion state. */
interface TreeNode extends FileEntry {
  children?: TreeNode[];
  loading?: boolean;
}

/**
 * File Explorer panel — left sidebar for browsing workspace files.
 * Tree view with lazy loading, git status indicators, and AIDF awareness.
 */
export function FileExplorerPanel() {
  const { activeTabId } = useWorkspaceTabsStore();
  const { workspaces } = useWorkspaces();
  const activeWorkspace = workspaces.find((ws) => ws.id === activeTabId);
  const workspacePath = activeWorkspace?.path;

  const { data: gitStatus } = useGitStatus(workspacePath);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Build a map of file paths to git status
  const gitStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!gitStatus) return map;
    gitStatus.staged.forEach((f) => map.set(f.path, f.status === 'added' ? 'A' : 'M'));
    gitStatus.unstaged.forEach((f) => map.set(f.path, f.status === 'modified' ? 'M' : f.status === 'deleted' ? 'D' : 'M'));
    gitStatus.untracked.forEach((f) => map.set(f, '?'));
    return map;
  }, [gitStatus]);

  const loadDirectory = useCallback(
    async (path: string): Promise<TreeNode[]> => {
      try {
        const entries = await safeInvoke<FileEntry[]>('list_directory', { path });
        return (entries ?? [])
          .filter((e) => showHidden || !e.is_hidden)
          .map((e) => ({ ...e, children: e.is_dir ? undefined : undefined }));
      } catch {
        return [];
      }
    },
    [showHidden],
  );

  // Load root directory
  useEffect(() => {
    if (!workspacePath) return;
    setLoading(true);
    loadDirectory(workspacePath).then((nodes) => {
      setTree(nodes);
      setLoading(false);
    });
  }, [workspacePath, loadDirectory]);

  const toggleExpand = useCallback(
    async (node: TreeNode) => {
      const newExpanded = new Set(expandedPaths);
      if (newExpanded.has(node.path)) {
        newExpanded.delete(node.path);
      } else {
        newExpanded.add(node.path);
        // Lazy load children
        if (!node.children) {
          const children = await loadDirectory(node.path);
          setTree((prev) => updateTreeNode(prev, node.path, { children }));
        }
      }
      setExpandedPaths(newExpanded);
    },
    [expandedPaths, loadDirectory],
  );

  // Filter tree nodes
  const filteredTree = useMemo(() => {
    if (!filter) return tree;
    return filterTreeNodes(tree, filter.toLowerCase());
  }, [tree, filter]);

  if (!workspacePath) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
          Select a workspace to browse files
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 44,
          background: 'var(--dl-bg-panel-hover)',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <span
          className="text-xs font-bold tracking-wider"
          style={{ color: 'var(--dl-text-primary)', letterSpacing: '0.6px' }}
        >
          EXPLORER
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="p-1 rounded text-xs"
            style={{ color: showHidden ? 'var(--dl-accent-primary)' : 'var(--dl-text-muted)' }}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          >
            .*
          </button>
          <button
            onClick={() => { setTree([]); setLoading(true); loadDirectory(workspacePath).then((n) => { setTree(n); setLoading(false); }); }}
            className="p-1 rounded"
            style={{ color: 'var(--dl-text-muted)' }}
            title="Refresh"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search filter */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--dl-border-subtle)' }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter files..."
          className="w-full text-xs outline-none bg-transparent selectable"
          style={{ color: 'var(--dl-text-primary)' }}
        />
      </div>

      {/* Tree view */}
      <div className="flex-1 overflow-y-auto px-1 py-1" style={{ fontSize: 12 }}>
        {loading && tree.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span style={{ color: 'var(--dl-text-muted)', fontSize: 12 }}>Loading...</span>
          </div>
        )}
        {filteredTree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            expanded={expandedPaths.has(node.path)}
            onToggle={toggleExpand}
            expandedPaths={expandedPaths}
            gitStatusMap={gitStatusMap}
            workspacePath={workspacePath}
          />
        ))}
      </div>
    </div>
  );
}

/** Recursive file tree node. */
function FileTreeNode({
  node,
  depth,
  expanded,
  onToggle,
  expandedPaths,
  gitStatusMap,
  workspacePath,
}: {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  onToggle: (node: TreeNode) => void;
  expandedPaths: Set<string>;
  gitStatusMap: Map<string, string>;
  workspacePath: string;
}) {
  const isAidf = node.is_dir && node.name === '.ai';
  const relativePath = node.path.replace(workspacePath + '/', '');
  const gitStatus = gitStatusMap.get(relativePath);

  const statusColors: Record<string, string> = {
    M: 'var(--dl-color-warning)',
    A: 'var(--dl-color-success)',
    D: 'var(--dl-color-error)',
    '?': 'var(--dl-text-muted)',
  };

  return (
    <div>
      <button
        className="flex items-center gap-1 w-full text-left rounded px-1 py-0.5 hover:bg-white/5"
        style={{ paddingLeft: depth * 16 + 4 }}
        onClick={() => node.is_dir ? onToggle(node) : undefined}
      >
        {/* Expand/collapse arrow or spacer */}
        {node.is_dir ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: 'var(--dl-text-muted)',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.1s',
              flexShrink: 0,
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          <span style={{ width: 10, flexShrink: 0 }} />
        )}

        {/* Icon */}
        <span style={{ fontSize: 13, flexShrink: 0, width: 16, textAlign: 'center' }}>
          {isAidf ? '✨' : node.is_dir ? '📁' : getFileIcon(node.name)}
        </span>

        {/* Name */}
        <span
          className="truncate"
          style={{
            color: isAidf
              ? 'var(--dl-accent-primary)'
              : gitStatus
                ? statusColors[gitStatus] ?? 'var(--dl-text-secondary)'
                : 'var(--dl-text-secondary)',
            fontWeight: isAidf ? 600 : 400,
            textShadow: isAidf ? 'var(--dl-glow-primary)' : undefined,
          }}
        >
          {node.name}
        </span>

        {/* Git status */}
        {gitStatus && (
          <span className="ml-auto shrink-0 text-xs font-bold" style={{ color: statusColors[gitStatus], fontSize: 9 }}>
            {gitStatus}
          </span>
        )}
      </button>

      {/* Children */}
      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expandedPaths.has(child.path)}
              onToggle={onToggle}
              expandedPaths={expandedPaths}
              gitStatusMap={gitStatusMap}
              workspacePath={workspacePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Get file icon based on extension. */
function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const icons: Record<string, string> = {
    ts: '🔷', tsx: '⚛️', js: '🟡', jsx: '⚛️',
    rs: '🦀', py: '🐍', go: '🔵', rb: '💎',
    json: '📋', yaml: '📋', yml: '📋', toml: '📋',
    md: '📝', mdx: '📝', css: '🎨', scss: '🎨',
    html: '🌐', svg: '🖼️', png: '🖼️', jpg: '🖼️',
    sh: '📜', bash: '📜', zsh: '📜',
    lock: '🔒', env: '🔐',
  };
  return icons[ext] ?? '📄';
}

/** Update a tree node by path. */
function updateTreeNode(tree: TreeNode[], path: string, updates: Partial<TreeNode>): TreeNode[] {
  return tree.map((node) => {
    if (node.path === path) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return { ...node, children: updateTreeNode(node.children, path, updates) };
    }
    return node;
  });
}

/** Filter tree nodes by name (case-insensitive). */
function filterTreeNodes(tree: TreeNode[], query: string): TreeNode[] {
  return tree
    .map((node) => {
      if (node.is_dir && node.children) {
        const filtered = filterTreeNodes(node.children, query);
        if (filtered.length > 0 || node.name.toLowerCase().includes(query)) {
          return { ...node, children: filtered };
        }
        return null;
      }
      return node.name.toLowerCase().includes(query) ? node : null;
    })
    .filter(Boolean) as TreeNode[];
}
