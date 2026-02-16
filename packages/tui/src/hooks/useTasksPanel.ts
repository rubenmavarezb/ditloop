import { useState, useCallback, useEffect } from 'react';
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

/**
 * Hook that manages AIDF tasks panel state.
 * Provides filtering, selection navigation, and live task updates.
 *
 * @param workspacePath - Path to the workspace root containing .ai/ folder
 * @returns Panel data with tasks, selection controls, and filter state
 */
export function useTasksPanel(workspacePath: string | null): TasksPanelData {
  const [tasks, setTasks] = useState<PanelTaskEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<PanelTaskStatus | null>(null);

  // TODO: Wire to AIDF context loader for live task data.
  // Sample data for visual testing.
  useEffect(() => {
    if (!workspacePath) { setTasks([]); return; }
    setTasks([
      { id: 'TASK-053', title: 'Layout Engine', status: 'done' },
      { id: 'TASK-054', title: 'Keyboard Manager', status: 'done' },
      { id: 'TASK-055', title: 'Git Status Panel', status: 'done' },
      { id: 'TASK-061', title: 'Fuzzy Finder', status: 'in-progress' },
      { id: 'TASK-062', title: 'Panel Resizing', status: 'pending' },
    ]);
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
