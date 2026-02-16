import { useState, useCallback, useEffect } from 'react';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PanelTaskEntry, PanelTaskStatus } from '@ditloop/ui';

/** Data returned by the useTasksPanel hook. */
export interface TasksPanelData {
  /** All tasks from AIDF. */
  tasks: PanelTaskEntry[];
  /** Currently selected task index. */
  selectedIndex: number;
  /** Active status filter. */
  filter: PanelTaskStatus | null;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
  /** Cycle through status filters. */
  cycleFilter: () => void;
}

/** Filter cycle order. */
const FILTER_CYCLE: Array<PanelTaskStatus | null> = [null, 'pending', 'in-progress', 'done', 'blocked'];

/** Valid AIDF task statuses. */
const VALID_STATUSES = new Set<string>(['pending', 'in-progress', 'done', 'blocked']);

/**
 * Hook that manages AIDF tasks panel state with real task file data.
 * Reads .ai/tasks/ directory and parses task markdown files.
 *
 * @param workspacePath - Path to the workspace root containing .ai/ folder
 * @returns Panel data with tasks, selection controls, and filter state
 */
export function useTasksPanel(workspacePath: string | null): TasksPanelData {
  const [tasks, setTasks] = useState<PanelTaskEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<PanelTaskStatus | null>(null);

  useEffect(() => {
    if (!workspacePath) {
      setTasks([]);
      return;
    }

    async function loadTasks() {
      const tasksDir = join(workspacePath!, '.ai', 'tasks');
      try {
        const files = await readdir(tasksDir);
        const taskFiles = files.filter((f) => f.endsWith('.md'));
        const loaded: PanelTaskEntry[] = [];

        for (const file of taskFiles.slice(0, 30)) {
          const content = await readFile(join(tasksDir, file), 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)/m);
          const statusMatch = content.match(/status:\s*(\S+)/i);
          const rawStatus = statusMatch?.[1]?.toLowerCase() ?? 'pending';
          const status = VALID_STATUSES.has(rawStatus) ? (rawStatus as PanelTaskStatus) : 'pending';
          loaded.push({
            id: file.replace('.md', ''),
            title: titleMatch?.[1] ?? file.replace('.md', ''),
            status,
          });
        }
        setTasks(loaded);
        setSelectedIndex(0);
      } catch {
        setTasks([]);
      }
    }

    loadTasks();
  }, [workspacePath]);

  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks;

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1));
  }, [filtered.length]);

  const cycleFilter = useCallback(() => {
    setFilter((prev) => {
      const idx = FILTER_CYCLE.indexOf(prev);
      return FILTER_CYCLE[(idx + 1) % FILTER_CYCLE.length];
    });
    setSelectedIndex(0);
  }, []);

  return { tasks, selectedIndex, filter, moveUp, moveDown, cycleFilter };
}
