import React, { useState, useCallback } from 'react';
import { safeInvoke } from '../../lib/tauri.js';

/** File entry from Rust backend. */
interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_hidden: boolean;
  size: number;
  modified: number | null;
}

/** Icon by file type. */
function fileIcon(entry: FileEntry): string {
  if (entry.is_dir) {
    if (entry.name === '.ai') return '\u{1F916}'; // robot for AIDF
    return '\u{1F4C1}'; // folder
  }
  const ext = entry.name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return '\u{1F4DC}'; // scroll (code)
    case 'json':
    case 'yaml':
    case 'yml':
    case 'toml':
      return '\u{2699}'; // gear (config)
    case 'md':
    case 'mdx':
      return '\u{1F4DD}'; // memo (docs)
    default:
      return '\u{1F4C4}'; // page (generic)
  }
}

/** Recursive tree node for a single directory entry. */
function TreeNode({
  entry,
  depth,
  onSelect,
  onContextMenu,
}: {
  entry: FileEntry;
  depth: number;
  onSelect: (entry: FileEntry) => void;
  onContextMenu?: (e: React.MouseEvent, path: string, isDir: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!entry.is_dir) {
      onSelect(entry);
      return;
    }

    if (!expanded && children.length === 0) {
      setLoading(true);
      try {
        const entries = await safeInvoke<FileEntry[]>('list_directory', {
          path: entry.path,
        });
        setChildren((entries ?? []).filter((e) => !e.is_hidden));
      } catch {
        // Directory may be inaccessible
      }
      setLoading(false);
    }
    setExpanded(!expanded);
  }, [entry, expanded, children.length, onSelect]);

  const isAidf = entry.name === '.ai' && entry.is_dir;

  return (
    <div>
      <button
        onClick={toggle}
        onDoubleClick={() => entry.is_dir && toggle()}
        onContextMenu={(e) => onContextMenu?.(e, entry.path, entry.is_dir)}
        className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-sm hover:bg-slate-800/50 ${
          isAidf ? 'text-ditloop-400' : 'text-slate-300'
        }`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {entry.is_dir && (
          <span className="w-3 text-xs text-slate-500">
            {loading ? '\u25CB' : expanded ? '\u25BE' : '\u25B8'}
          </span>
        )}
        {!entry.is_dir && <span className="w-3" />}
        <span className="text-xs">{fileIcon(entry)}</span>
        <span className="truncate">{entry.name}</span>
      </button>

      {expanded &&
        children.map((child) => (
          <TreeNode
            key={child.path}
            entry={child}
            depth={depth + 1}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
          />
        ))}
    </div>
  );
}

/** Recursive file tree with lazy-loaded directory expansion. */
export function FileTree({
  entries,
  onSelect,
  onContextMenu,
}: {
  entries: FileEntry[];
  onSelect: (entry: FileEntry) => void;
  onContextMenu?: (e: React.MouseEvent, path: string, isDir: boolean) => void;
}) {
  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <TreeNode key={entry.path} entry={entry} depth={0} onSelect={onSelect} onContextMenu={onContextMenu} />
      ))}
    </div>
  );
}
