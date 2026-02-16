import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
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
  const [currentPath, setCurrentPath] = useState<string>('');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Load home directory on mount
  useEffect(() => {
    invoke<string>('get_home_dir').then((home) => {
      setCurrentPath(home);
    });
  }, []);

  // Load directory contents when path changes
  useEffect(() => {
    if (!currentPath) return;

    invoke<FileEntry[]>('list_directory', { path: currentPath })
      .then((result) => {
        setEntries(result.filter((e) => !e.is_hidden));
      })
      .catch(() => {
        setEntries([]);
      });
  }, [currentPath]);

  const handleSelect = useCallback(async (entry: FileEntry) => {
    if (entry.is_dir) return;

    try {
      const content = await invoke<FileContent>('read_file', {
        path: entry.path,
      });
      setSelectedFile(content);
      setSelectedFileName(entry.name);
    } catch {
      setSelectedFile(null);
    }
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      setCurrentPath(selected as string);
      setSelectedFile(null);
    }
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
        <span className="mx-2 text-slate-600">/</span>
        {breadcrumbs.map((part, i) => {
          const path = '/' + breadcrumbs.slice(0, i + 1).join('/');
          return (
            <span key={path} className="flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentPath(path);
                  setSelectedFile(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
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
          <FileTree entries={entries} onSelect={handleSelect} />
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
    </div>
  );
}
