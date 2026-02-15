import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { SelectList } from './SelectList.js';
import { ThemeProvider } from '../../theme/ThemeProvider.js';

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

function renderWithTheme(ui: JSX.Element) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

const items = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

function renderItem(item: string, _index: number, isSelected: boolean) {
  return <Text>{isSelected ? `> ${item}` : `  ${item}`}</Text>;
}

describe('SelectList', () => {
  it('renders items via renderItem callback', () => {
    const { lastFrame } = renderWithTheme(
      <SelectList items={items} renderItem={renderItem} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Alpha');
    expect(frame).toContain('Beta');
    expect(frame).toContain('Gamma');
  });

  it('renders empty state when items array is empty', () => {
    const { lastFrame } = renderWithTheme(
      <SelectList items={[]} renderItem={renderItem} />
    );
    expect(lastFrame()).toContain('No items');
  });

  it('highlights selected item (index 0 by default)', () => {
    const { lastFrame } = renderWithTheme(
      <SelectList items={items} renderItem={renderItem} />
    );
    expect(lastFrame()).toContain('> Alpha');
    expect(lastFrame()).toContain('  Beta');
  });

  it('calls onSelect when Enter is pressed', async () => {
    const onSelect = vi.fn();
    const { stdin } = renderWithTheme(
      <SelectList items={items} renderItem={renderItem} onSelect={onSelect} />
    );
    await delay();
    stdin.write('\r');
    await delay();
    expect(onSelect).toHaveBeenCalledWith('Alpha', 0);
  });

  it('respects isFocused prop (ignores input when false)', async () => {
    const onSelect = vi.fn();
    const { stdin } = renderWithTheme(
      <SelectList items={items} renderItem={renderItem} onSelect={onSelect} isFocused={false} />
    );
    await delay();
    stdin.write('\r');
    await delay();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handles visibleCount windowing (only renders N items)', () => {
    const { lastFrame } = renderWithTheme(
      <SelectList items={items} renderItem={renderItem} visibleCount={2} />
    );
    const frame = lastFrame()!;
    expect(frame).toContain('Alpha');
    expect(frame).toContain('Beta');
    expect(frame).not.toContain('Gamma');
    expect(frame).toContain('↓ more');
  });
});
