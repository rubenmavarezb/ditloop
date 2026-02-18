import { useState, useMemo } from 'react';

/** A parsed diff hunk. */
interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

/** A single diff line. */
interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNo?: number;
  newLineNo?: number;
}

/** Props for the DiffViewer component. */
interface DiffViewerProps {
  /** Raw unified diff output from git diff. */
  diff: string;
  /** File path being diffed. */
  filePath?: string;
  /** Number of additions. */
  additions?: number;
  /** Number of deletions. */
  deletions?: number;
}

/**
 * Side-by-side diff viewer with inline mode toggle.
 * Parses unified diff output and renders with color coding.
 */
export function DiffViewer({ diff, filePath, additions, deletions }: DiffViewerProps) {
  const [mode, setMode] = useState<'split' | 'inline'>('split');
  const [currentHunk, setCurrentHunk] = useState(0);

  const hunks = useMemo(() => parseDiff(diff), [diff]);

  if (!diff || hunks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>No changes to display</span>
      </div>
    );
  }

  const totalAdds = additions ?? hunks.reduce((sum, h) => sum + h.lines.filter((l) => l.type === 'add').length, 0);
  const totalDels = deletions ?? hunks.reduce((sum, h) => sum + h.lines.filter((l) => l.type === 'remove').length, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 40,
          background: 'var(--dl-bg-panel-hover)',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          {filePath && (
            <span className="text-xs font-mono" style={{ color: 'var(--dl-text-secondary)' }}>
              {filePath}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--dl-color-success)' }}>+{totalAdds}</span>
          <span className="text-xs" style={{ color: 'var(--dl-color-error)' }}>-{totalDels}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Hunk navigation */}
          <button
            onClick={() => setCurrentHunk(Math.max(0, currentHunk - 1))}
            disabled={currentHunk === 0}
            className="p-1 rounded"
            style={{ color: currentHunk === 0 ? 'var(--dl-text-muted)' : 'var(--dl-text-secondary)' }}
            title="Previous change"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
            {currentHunk + 1}/{hunks.length}
          </span>
          <button
            onClick={() => setCurrentHunk(Math.min(hunks.length - 1, currentHunk + 1))}
            disabled={currentHunk >= hunks.length - 1}
            className="p-1 rounded"
            style={{ color: currentHunk >= hunks.length - 1 ? 'var(--dl-text-muted)' : 'var(--dl-text-secondary)' }}
            title="Next change"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Mode toggle */}
          <div
            className="flex rounded overflow-hidden"
            style={{ border: '1px solid var(--dl-border-subtle)' }}
          >
            <button
              onClick={() => setMode('split')}
              className="px-2 py-0.5 text-xs"
              style={{
                background: mode === 'split' ? 'var(--dl-accent-primary)' : 'transparent',
                color: mode === 'split' ? 'var(--dl-text-inverse)' : 'var(--dl-text-muted)',
              }}
            >
              Split
            </button>
            <button
              onClick={() => setMode('inline')}
              className="px-2 py-0.5 text-xs"
              style={{
                background: mode === 'inline' ? 'var(--dl-accent-primary)' : 'transparent',
                color: mode === 'inline' ? 'var(--dl-text-inverse)' : 'var(--dl-text-muted)',
              }}
            >
              Inline
            </button>
          </div>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto" style={{ fontFamily: 'var(--dl-font-mono)', fontSize: 12 }}>
        {hunks.map((hunk, hunkIdx) => (
          <div key={hunkIdx}>
            {/* Hunk header */}
            <div
              className="px-4 py-1"
              style={{
                background: 'rgba(0, 217, 255, 0.05)',
                color: 'var(--dl-text-muted)',
                fontSize: 11,
              }}
            >
              @@ -{hunk.oldStart},{hunk.oldCount} +{hunk.newStart},{hunk.newCount} @@
            </div>

            {mode === 'split' ? (
              <SplitView hunk={hunk} />
            ) : (
              <InlineView hunk={hunk} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Side-by-side diff view. */
function SplitView({ hunk }: { hunk: DiffHunk }) {
  // Build paired lines for side-by-side
  const leftLines: (DiffLine | null)[] = [];
  const rightLines: (DiffLine | null)[] = [];

  let i = 0;
  while (i < hunk.lines.length) {
    const line = hunk.lines[i];
    if (line.type === 'context') {
      leftLines.push(line);
      rightLines.push(line);
      i++;
    } else if (line.type === 'remove') {
      // Check if next line is an add (paired change)
      const next = hunk.lines[i + 1];
      if (next?.type === 'add') {
        leftLines.push(line);
        rightLines.push(next);
        i += 2;
      } else {
        leftLines.push(line);
        rightLines.push(null);
        i++;
      }
    } else if (line.type === 'add') {
      leftLines.push(null);
      rightLines.push(line);
      i++;
    } else {
      i++;
    }
  }

  return (
    <div className="flex">
      <div className="flex-1" style={{ borderRight: '1px solid var(--dl-border-subtle)' }}>
        {leftLines.map((line, idx) => (
          <DiffLineRow key={idx} line={line} side="old" />
        ))}
      </div>
      <div className="flex-1">
        {rightLines.map((line, idx) => (
          <DiffLineRow key={idx} line={line} side="new" />
        ))}
      </div>
    </div>
  );
}

/** Inline (unified) diff view. */
function InlineView({ hunk }: { hunk: DiffHunk }) {
  return (
    <div>
      {hunk.lines.map((line, idx) => (
        <div
          key={idx}
          className="flex px-4 py-0"
          style={{
            background:
              line.type === 'add'
                ? 'rgba(34, 197, 94, 0.08)'
                : line.type === 'remove'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'transparent',
          }}
        >
          <span className="shrink-0 text-right pr-3" style={{ width: 40, color: 'var(--dl-text-muted)', fontSize: 10 }}>
            {line.oldLineNo ?? ''}
          </span>
          <span className="shrink-0 text-right pr-3" style={{ width: 40, color: 'var(--dl-text-muted)', fontSize: 10 }}>
            {line.newLineNo ?? ''}
          </span>
          <span
            className="shrink-0 pr-2"
            style={{
              width: 14,
              color: line.type === 'add' ? 'var(--dl-color-success)' : line.type === 'remove' ? 'var(--dl-color-error)' : 'var(--dl-text-muted)',
            }}
          >
            {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
          </span>
          <span className="selectable" style={{ color: 'var(--dl-text-primary)' }}>{line.content}</span>
        </div>
      ))}
    </div>
  );
}

/** Single diff line row for split view. */
function DiffLineRow({ line, side }: { line: DiffLine | null; side: 'old' | 'new' }) {
  if (!line) {
    return <div className="px-4 py-0" style={{ height: 20, background: 'rgba(255, 255, 255, 0.01)' }} />;
  }

  const lineNo = side === 'old' ? line.oldLineNo : line.newLineNo;

  return (
    <div
      className="flex px-4 py-0"
      style={{
        background:
          line.type === 'add'
            ? 'rgba(34, 197, 94, 0.08)'
            : line.type === 'remove'
              ? 'rgba(239, 68, 68, 0.08)'
              : 'transparent',
        minHeight: 20,
      }}
    >
      <span className="shrink-0 text-right pr-3" style={{ width: 40, color: 'var(--dl-text-muted)', fontSize: 10 }}>
        {lineNo ?? ''}
      </span>
      <span className="selectable" style={{ color: 'var(--dl-text-primary)' }}>{line.content}</span>
    </div>
  );
}

/** Parse unified diff output into hunks. */
function parseDiff(diff: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  const lines = diff.split('\n');
  let currentHunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
    if (hunkMatch) {
      if (currentHunk) hunks.push(currentHunk);
      const oldStart = parseInt(hunkMatch[1], 10);
      const oldCount = parseInt(hunkMatch[2] || '1', 10);
      const newStart = parseInt(hunkMatch[3], 10);
      const newCount = parseInt(hunkMatch[4] || '1', 10);
      currentHunk = { oldStart, oldCount, newStart, newCount, lines: [] };
      oldLine = oldStart;
      newLine = newStart;
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith('+')) {
      currentHunk.lines.push({ type: 'add', content: line.slice(1), newLineNo: newLine });
      newLine++;
    } else if (line.startsWith('-')) {
      currentHunk.lines.push({ type: 'remove', content: line.slice(1), oldLineNo: oldLine });
      oldLine++;
    } else if (line.startsWith(' ') || line === '') {
      currentHunk.lines.push({ type: 'context', content: line.slice(1), oldLineNo: oldLine, newLineNo: newLine });
      oldLine++;
      newLine++;
    }
  }

  if (currentHunk) hunks.push(currentHunk);
  return hunks;
}

export { parseDiff };
export type { DiffHunk, DiffLine };
