import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Text, Box, useInput } from 'ink';
import { useScrollable } from './useScrollable.js';

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

interface TestProps {
  itemCount: number;
  visibleCount: number;
}

function ScrollableHarness({ itemCount, visibleCount }: TestProps) {
  const { selectedIndex, scrollOffset, moveUp, moveDown, selectIndex } =
    useScrollable(itemCount, visibleCount);

  useInput((_input, key) => {
    if (key.upArrow) moveUp();
    if (key.downArrow) moveDown();
    if (key.rightArrow) selectIndex(5);
  });

  return (
    <Box flexDirection="column">
      <Text>selected:{selectedIndex}</Text>
      <Text>offset:{scrollOffset}</Text>
    </Box>
  );
}

function getValues(frame: string) {
  const selected = frame.match(/selected:(\d+)/)?.[1];
  const offset = frame.match(/offset:(\d+)/)?.[1];
  return {
    selectedIndex: Number(selected),
    scrollOffset: Number(offset),
  };
}

async function pressDown(stdin: { write: (s: string) => void }, times = 1) {
  for (let i = 0; i < times; i++) {
    await delay();
    stdin.write('\u001B[B');
  }
  await delay();
}

async function pressUp(stdin: { write: (s: string) => void }, times = 1) {
  for (let i = 0; i < times; i++) {
    await delay();
    stdin.write('\u001B[A');
  }
  await delay();
}

describe('useScrollable', () => {
  it('initial selectedIndex is 0', () => {
    const { lastFrame } = render(<ScrollableHarness itemCount={5} visibleCount={3} />);
    const { selectedIndex, scrollOffset } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(0);
    expect(scrollOffset).toBe(0);
  });

  it('moveDown increments selectedIndex', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={5} visibleCount={3} />);
    await pressDown(stdin);
    const { selectedIndex } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(1);
  });

  it('moveUp decrements selectedIndex', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={5} visibleCount={3} />);
    await pressDown(stdin, 2);
    await pressUp(stdin);
    const { selectedIndex } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(1);
  });

  it('clamps at lower boundary (does not go below 0)', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={5} visibleCount={3} />);
    await pressUp(stdin);
    const { selectedIndex } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(0);
  });

  it('clamps at upper boundary (does not exceed itemCount - 1)', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={3} visibleCount={3} />);
    await pressDown(stdin, 5);
    const { selectedIndex } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(2);
  });

  it('scrollOffset updates when selection moves beyond visible window', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={10} visibleCount={3} />);
    await pressDown(stdin, 4);
    const { selectedIndex, scrollOffset } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(4);
    expect(scrollOffset).toBeGreaterThan(0);
  });

  it('selectIndex sets specific index directly', async () => {
    const { lastFrame, stdin } = render(<ScrollableHarness itemCount={10} visibleCount={3} />);
    await delay();
    stdin.write('\u001B[C'); // right arrow → triggers selectIndex(5)
    await delay();
    const { selectedIndex } = getValues(lastFrame()!);
    expect(selectedIndex).toBe(5);
  });
});
