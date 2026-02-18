import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { safeInvoke, isTauri } from '../../lib/tauri.js';
import { FileTree } from './FileTree.js';

/** File entry from Rust backend. */
interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_hidden: boolean;
  size: number;
  modified: number | null;
}

/** File content from Rust backend. */
interface FileContent {
  content: string;
  language: string;
  truncated: boolean;
}

/** Split-pane file browser with tree navigation and file preview. */
export function FileBrowser() {
  const [searchParams] = useSearchParams();
  const initialPath = searchParams.get('path');

  const [currentPath, setCurrentPath] = useState<string>(initialPath ?? '');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [showHidden, setShowHidden] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; isDir: boolean } | null>(null);

  // Load home directory on mount if no initial path
  useEffect(() => {
    if (!initialPath) {
      safeInvoke<string>('get_home_dir').then((home) => {
        if (home) setCurrentPath(home);
      });
    }
  }, [initialPath]);

  // Load directory contents when path changes
  useEffect(() => {
    if (!currentPath) return;

    safeInvoke<FileEntry[]>('list_directory', { path: currentPath })
      .then((result) => {
        if (!result) return;
        setEntries(showHidden ? result : result.filter((e) => !e.is_hidden));
      })
      .catch(() => {
        setEntries([]);
      });
  }, [currentPath, showHidden]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleSelect = useCallback(async (entry: FileEntry) => {
    if (entry.is_dir) return;

    try {
      const content = await safeInvoke<FileContent>('read_file', {
        path: entry.path,
      });
      setSelectedFile(content ?? null);
      setSelectedFileName(entry.name);
      setSelectedFilePath(entry.path);
    } catch {
      setSelectedFile(null);
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, path: string, isDir: boolean) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, path, isDir });
  }, []);

  const handleOpenFolder = useCallback(async () => {
    if (!isTauri()) return;
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      setCurrentPath(selected as string);
      setSelectedFile(null);
    }
  }, []);

  const handleCopyPath = useCallback(async (path: string) => {
    await navigator.clipboard.writeText(path);
    setContextMenu(null);
  }, []);

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-1 border-b border-slate-800 px-3 py-2">
        <button
          onClick={handleOpenFolder}
          className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          Open Folder
        </button>
        <label className="ml-2 flex items-center gap-1">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="h-3 w-3"
          />
          <span className="text-[10px] text-slate-500">Hidden</span>
        </label>
        <span className="mx-2 text-slate-600">/</span>
        {breadcrumbs.map((part, i) => {
          const path = '/' + breadcrumbs.slice(0, i + 1).join('/');
          const isAidf = part === '.ai';
          return (
            <span key={path} className="flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentPath(path);
                  setSelectedFile(null);
                }}
                className={`text-xs hover:text-white ${isAidf ? 'font-semibold text-ditloop-400' : 'text-slate-400'}`}
              >
                {part}
              </button>
              {i < breadcrumbs.length - 1 && (
                <span className="text-slate-600">/</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* File tree */}
        <div className="w-64 shrink-0 overflow-auto border-r border-slate-800 p-2">
          <FileTree
            entries={entries}
            onSelect={handleSelect}
            onContextMenu={handleContextMenu}
          />
        </div>

        {/* File preview */}
        <div className="flex-1 overflow-auto p-4">
          {selectedFile ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {selectedFileName}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
                  {selectedFile.language}
                </span>
                {selectedFile.truncated && (
                  <span className="text-xs text-amber-400">Truncated (1MB limit)</span>
                )}
                <button
                  onClick={() => handleCopyPath(selectedFilePath)}
                  className="ml-auto text-[10px] text-slate-500 hover:text-white"
                >
                  Copy Path
                </button>
                <button
                  onClick={() => safeInvoke('open_in_editor', { path: selectedFilePath, editor: null })}
                  className="text-[10px] text-slate-500 hover:text-white"
                >
                  Open in Editor
                </button>
              </div>
              <pre className="selectable whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs text-slate-300">
                {selectedFile.content}
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <p>Select a file to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded border border-slate-700 bg-slate-900 py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              safeInvoke('open_in_terminal', { path: contextMenu.isDir ? contextMenu.path : currentPath });
              setContextMenu(null);
            }}
            className="block w-full px-3 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
          >
            Open in Terminal
          </button>
          <button
            onClick={() => {
              safeInvoke('open_in_editor', { path: contextMenu.path, editor: null });
              setContextMenu(null);
            }}
            className="block w-full px-3 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
          >
            Open in Editor
          </button>
          <button
            onClick={() => handleCopyPath(contextMenu.path)}
            className="block w-full px-3 py-1 text-left text-xs text-slate-300 hover:bg-slate-800"
          >
            Copy Path
          </button>
        </div>
      )}
    </div>
  );
}
