import { Box, Text } from 'ink';
import { useTheme } from '../../hooks/useTheme.js';

/** A search result item for the fuzzy finder. */
export interface FuzzyItem {
  /** Display label. */
  label: string;
  /** Category identifier (ws, task, branch, file). */
  category: string;
  /** Optional metadata shown after the label. */
  meta?: string;
}

/** Props for the FuzzyFinder component. */
export interface FuzzyFinderProps {
  /** Whether the overlay is visible. */
  visible: boolean;
  /** Current search query. */
  query: string;
  /** Filtered and ranked results. */
  results: FuzzyItem[];
  /** Currently selected result index. */
  selectedIndex: number;
  /** Available terminal width for sizing. */
  termWidth: number;
  /** Available terminal height for sizing. */
  termHeight: number;
}

/** Category badge labels. */
const CATEGORY_BADGES: Record<string, string> = {
  ws: '[ws]',
  task: '[task]',
  branch: '[branch]',
  file: '[file]',
};

/**
 * Fuzzy finder overlay rendered as a centered box on top of the panel layout.
 * Shows a search input and ranked results with category badges.
 *
 * @param props - Search state, results, and sizing information
 */
export function FuzzyFinder({
  visible,
  query,
  results,
  selectedIndex,
  termWidth,
  termHeight,
}: FuzzyFinderProps) {
  const theme = useTheme();

  if (!visible) return null;

  const overlayWidth = Math.max(30, Math.floor(termWidth * 0.6));
  const overlayHeight = Math.max(8, Math.floor(termHeight * 0.7));
  const maxResults = overlayHeight - 4; // header + input + border padding

  const visibleResults = results.slice(0, maxResults);

  return (
    <Box
      flexDirection="column"
      width={overlayWidth}
      borderStyle="round"
      borderColor={theme.accent}
      paddingX={1}
    >
      <Text color={theme.accent} bold>
        Fuzzy Finder
      </Text>
      <Box>
        <Text color={theme.textDim}>{'> '}</Text>
        <Text color={theme.text}>{query}</Text>
        <Text color={theme.accent}>|</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {visibleResults.length === 0 ? (
          <Text color={theme.textDim}>
            {query ? 'No matches' : 'Type to search...'}
          </Text>
        ) : (
          visibleResults.map((item, i) => {
            const selected = i === selectedIndex;
            const badge = CATEGORY_BADGES[item.category] ?? `[${item.category}]`;
            return (
              <Box key={`${item.category}-${item.label}-${i}`} gap={1}>
                <Text color={selected ? theme.accent : theme.text}>
                  {selected ? '>' : ' '}
                </Text>
                <Text color={theme.warning}>{badge}</Text>
                <Text color={selected ? theme.accent : theme.text} bold={selected}>
                  {item.label}
                </Text>
                {item.meta && (
                  <Text color={theme.textDim}>{item.meta}</Text>
                )}
              </Box>
            );
          })
        )}
      </Box>
      {results.length > maxResults && (
        <Text color={theme.textDim}>
          ... {results.length - maxResults} more results
        </Text>
      )}
    </Box>
  );
}
