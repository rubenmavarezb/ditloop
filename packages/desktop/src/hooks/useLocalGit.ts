import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

/** Git status from Rust backend. */
interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: Array<{ path: string; status: string }>;
  unstaged: Array<{ path: string; status: string }>;
  untracked: string[];
}

/** Git commit from Rust backend. */
interface GitCommit {
  hash: string;
  short_hash: string;
  message: string;
  author: string;
  date: string;
}

/** Git branch from Rust backend. */
interface GitBranch {
  name: string;
  is_current: boolean;
  is_remote: boolean;
}

/** Hook for git status with auto-refresh on window focus. */
export function useGitStatus(path: string | undefined) {
  const [data, setData] = useState<GitStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const result = await invoke<GitStatus>('git_status', { workspacePath: path });
      setData(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh on window focus
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [refresh]);

  return { data, error, loading, refresh };
}

/** Hook for git log. */
export function useGitLog(path: string | undefined, count = 20) {
  const [data, setData] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    invoke<GitCommit[]>('git_log', { workspacePath: path, count })
      .then(setData)
      .finally(() => setLoading(false));
  }, [path, count]);

  return { data, loading };
}

/** Hook for git diff. */
export function useGitDiff(path: string | undefined, staged = false) {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const result = await invoke<string>('git_diff', { workspacePath: path, staged });
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [path, staged]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

/** Hook for git branches. */
export function useGitBranches(path: string | undefined) {
  const [data, setData] = useState<GitBranch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    invoke<GitBranch[]>('git_branch_list', { workspacePath: path })
      .then(setData)
      .finally(() => setLoading(false));
  }, [path]);

  return { data, loading };
}
