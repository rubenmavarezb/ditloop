import { useState, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';

/** A searchable item in the fuzzy finder. */
export interface FuzzySearchItem {
  /** Display label. */
  label: string;
  /** Category (ws, task, branch, file). */
  category: string;
  /** Optional metadata. */
  meta?: string;
  /** Action to execute on selection. */
  action: () => void;
}

/** Data returned by the useFuzzyFinder hook. */
export interface FuzzyFinderData {
  /** Whether the fuzzy finder is visible. */
  visible: boolean;
  /** Current search query. */
  query: string;
  /** Filtered and ranked results. */
  results: Array<{ label: string; category: string; meta?: string }>;
  /** Currently selected result index. */
  selectedIndex: number;
  /** Open the fuzzy finder. */
  open: () => void;
  /** Close the fuzzy finder. */
  close: () => void;
  /** Update the search query. */
  setQuery: (query: string) => void;
  /** Move selection up. */
  moveUp: () => void;
  /** Move selection down. */
  moveDown: () => void;
  /** Execute the selected item's action. */
  selectCurrent: () => void;
}

/** Category prefix filters. */
const CATEGORY_PREFIXES: Record<string, string> = {
  't:': 'task',
  'b:': 'branch',
  'w:': 'ws',
  'f:': 'file',
};

/**
 * Hook that manages fuzzy finder state and search logic.
 * Aggregates items from multiple sources and provides fuzzy matching via fuse.js.
 *
 * @param items - All searchable items from various panel sources
 * @returns Fuzzy finder state and interaction controls
 */
export function useFuzzyFinder(items: FuzzySearchItem[]): FuzzyFinderData {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fuse = useMemo(
    () => new Fuse(items, { keys: ['label', 'meta'], threshold: 0.4 }),
    [items],
  );

  const results = useMemo(() => {
    if (!query) return items.map(({ label, category, meta }) => ({ label, category, meta }));

    // Check for category prefix filter
    let searchQuery = query;
    let categoryFilter: string | null = null;
    for (const [prefix, cat] of Object.entries(CATEGORY_PREFIXES)) {
      if (query.startsWith(prefix)) {
        categoryFilter = cat;
        searchQuery = query.slice(prefix.length);
        break;
      }
    }

    let filteredItems = items;
    if (categoryFilter) {
      filteredItems = items.filter((item) => item.category === categoryFilter);
    }

    if (!searchQuery) {
      return filteredItems.map(({ label, category, meta }) => ({ label, category, meta }));
    }

    const fuseInstance = categoryFilter
      ? new Fuse(filteredItems, { keys: ['label', 'meta'], threshold: 0.4 })
      : fuse;

    return fuseInstance
      .search(searchQuery)
      .map(({ item }) => ({ label: item.label, category: item.category, meta: item.meta }));
  }, [query, items, fuse]);

  const open = useCallback(() => {
    setVisible(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const updateQuery = useCallback((q: string) => {
    setQuery(q);
    setSelectedIndex(0);
  }, []);

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(results.length - 1, prev + 1));
  }, [results.length]);

  const selectCurrent = useCallback(() => {
    if (results.length === 0) return;
    const selected = results[selectedIndex];
    if (!selected) return;
    // Find the original item to call its action
    const original = items.find(
      (item) => item.label === selected.label && item.category === selected.category,
    );
    if (original) {
      original.action();
    }
    close();
  }, [results, selectedIndex, items, close]);

  return {
    visible,
    query,
    results,
    selectedIndex,
    open,
    close,
    setQuery: updateQuery,
    moveUp,
    moveDown,
    selectCurrent,
  };
}
