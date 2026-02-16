import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandsStore } from '../../store/commands.js';
import type { PaletteCommand } from '../../store/commands.js';

/** Fuzzy match: check if all characters of query appear in order in target. */
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/** Command palette modal triggered by Cmd+K / Ctrl+K. */
export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const recentIds = useCommandsStore((s) => s.recentIds);
  const addRecent = useCommandsStore((s) => s.addRecent);

  // Filter and sort commands
  const filtered = useMemo(() => {
    let results = commands;

    if (query) {
      results = results.filter(
        (cmd) =>
          fuzzyMatch(query, cmd.title) ||
          fuzzyMatch(query, cmd.category) ||
          cmd.keywords.some((kw) => fuzzyMatch(query, kw)),
      );
    }

    // Sort: recent first, then alphabetical
    return results.sort((a, b) => {
      const aRecent = recentIds.indexOf(a.id);
      const bRecent = recentIds.indexOf(b.id);
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      if (aRecent !== -1) return -1;
      if (bRecent !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [commands, query, recentIds]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          const cmd = filtered[selectedIndex];
          addRecent(cmd.id);
          cmd.action();
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-in fade-in zoom-in-95 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="border-b border-slate-800 p-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto p-1">
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => {
                addRecent(cmd.id);
                cmd.action();
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm ${
                i === selectedIndex
                  ? 'bg-ditloop-600/20 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="w-16 shrink-0 text-xs text-slate-500">
                {cmd.category}
              </span>
              <span className="flex-1">{cmd.title}</span>
              {recentIds.includes(cmd.id) && (
                <span className="text-xs text-slate-600">recent</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-3 py-2 text-xs text-slate-600">
          <span className="mr-4">\u2191\u2193 Navigate</span>
          <span className="mr-4">\u21B5 Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
