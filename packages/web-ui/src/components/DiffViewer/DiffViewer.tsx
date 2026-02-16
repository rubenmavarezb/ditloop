import { useState } from 'react';

/** Maximum lines shown before truncation. */
const TRUNCATE_THRESHOLD = 500;

/** Props for the DiffViewer component. */
interface DiffViewerProps {
  /** Unified diff string to display. */
  diff: string;
}

/**
 * Renders a unified diff with syntax-highlighted additions, deletions, and hunk headers.
 * Truncates diffs longer than 500 lines with a "Show more" toggle.
 *
 * @param props - Component props
 * @param props.diff - Unified diff string
 */
export function DiffViewer({ diff }: DiffViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = diff.split('\n');
  const isTruncated = lines.length > TRUNCATE_THRESHOLD && !expanded;
  const visibleLines = isTruncated ? lines.slice(0, TRUNCATE_THRESHOLD) : lines;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      <div className="overflow-x-auto">
        <pre className="p-3 text-xs leading-5 font-mono">
          {visibleLines.map((line, i) => (
            <div key={i} className={getLineClass(line)}>
              <span className="mr-3 inline-block w-8 select-none text-right text-slate-600">
                {i + 1}
              </span>
              {line}
            </div>
          ))}
        </pre>
      </div>

      {lines.length > TRUNCATE_THRESHOLD && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border-t border-slate-700 py-2 text-center text-xs text-ditloop-400 active:bg-slate-800"
        >
          {expanded
            ? 'Show less'
            : `Show more (${lines.length - TRUNCATE_THRESHOLD} lines hidden)`}
        </button>
      )}
    </div>
  );
}

/**
 * Returns the Tailwind class string for a diff line based on its prefix.
 *
 * @param line - Single line from a unified diff
 * @returns Tailwind class string
 */
function getLineClass(line: string): string {
  if (line.startsWith('+')) return 'bg-green-950/50 text-green-300';
  if (line.startsWith('-')) return 'bg-red-950/50 text-red-300';
  if (line.startsWith('@@')) return 'text-blue-400';
  return 'text-slate-300';
}
