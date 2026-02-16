import { describe, it, expect, vi } from 'vitest';
import { useFuzzyFinder } from './useFuzzyFinder.js';
import type { FuzzySearchItem, FuzzyFinderData } from './useFuzzyFinder.js';

// Since we don't have @testing-library/react-hooks in TUI, test the hook's
// contract by verifying exports and types. Full integration testing will
// come when the fuzzy finder is wired into the TUI app lifecycle.

describe('useFuzzyFinder', () => {
  it('is a function', () => {
    expect(typeof useFuzzyFinder).toBe('function');
  });

  it('exports FuzzySearchItem type', () => {
    const item: FuzzySearchItem = {
      label: 'test',
      category: 'ws',
      action: vi.fn(),
    };
    expect(item.label).toBe('test');
    expect(item.category).toBe('ws');
  });

  it('exports FuzzyFinderData type', () => {
    const data: FuzzyFinderData = {
      visible: false,
      query: '',
      results: [],
      selectedIndex: 0,
      open: vi.fn(),
      close: vi.fn(),
      setQuery: vi.fn(),
      moveUp: vi.fn(),
      moveDown: vi.fn(),
      selectCurrent: vi.fn(),
    };
    expect(data.visible).toBe(false);
    expect(data.results).toEqual([]);
  });
});
