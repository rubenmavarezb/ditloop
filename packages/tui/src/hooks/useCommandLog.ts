import { useState, useCallback } from 'react';
import type { CommandLogEntry } from '@ditloop/ui';

/** Data returned by the useCommandLog hook. */
export interface CommandLogData {
  /** Recent command entries, newest first. */
  entries: CommandLogEntry[];
  /** Add a new command entry. */
  addEntry: (entry: CommandLogEntry) => void;
  /** Clear all entries. */
  clear: () => void;
}

/** Maximum entries to keep in memory. */
const MAX_LOG_ENTRIES = 100;

/**
 * Hook that manages command log state.
 * Collects executed command results for display in the CommandLogPanel.
 *
 * @returns Command log data with entries and mutation controls
 */
export function useCommandLog(): CommandLogData {
  const [entries, setEntries] = useState<CommandLogEntry[]>([]);

  const addEntry = useCallback((entry: CommandLogEntry) => {
    setEntries((prev) => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, addEntry, clear };
}
