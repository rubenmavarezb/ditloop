import { useShortcutStore, DEFAULT_SHORTCUTS } from '../../store/shortcuts.js';

/**
 * Keyboard shortcut reference sheet — modal overlay listing all shortcuts.
 * Opened via Cmd+Shift+? or from the command palette.
 */
export function ShortcutSheet() {
  const { sheetOpen, closeSheet } = useShortcutStore();

  if (!sheetOpen) return null;

  // Group shortcuts by category
  const categories = new Map<string, typeof DEFAULT_SHORTCUTS>();
  for (const s of DEFAULT_SHORTCUTS) {
    const group = categories.get(s.category) ?? [];
    group.push(s);
    categories.set(s.category, group);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={closeSheet}
      />

      {/* Sheet */}
      <div
        className="fixed z-50 rounded-xl overflow-hidden"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, 90vw)',
          maxHeight: '80vh',
          background: 'var(--dl-bg-surface, #0f0f13)',
          border: '1px solid var(--dl-border-default)',
          borderRadius: 'var(--dl-radius-card)',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--dl-border-subtle)' }}
        >
          <span className="text-sm font-bold" style={{ color: 'var(--dl-text-primary)' }}>
            Keyboard Shortcuts
          </span>
          <button
            onClick={closeSheet}
            className="flex items-center justify-center rounded"
            style={{ width: 24, height: 24, color: 'var(--dl-text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 64px)' }}>
          {[...categories.entries()].map(([category, shortcuts]) => (
            <div key={category} className="mb-4">
              <div
                className="text-xs font-bold mb-2 tracking-wider"
                style={{ color: 'var(--dl-text-muted)', letterSpacing: '0.6px' }}
              >
                {category.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {shortcuts.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <span className="text-xs" style={{ color: 'var(--dl-text-secondary)' }}>
                      {s.label}
                    </span>
                    <kbd
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--dl-bg-panel-hover)',
                        border: '1px solid var(--dl-border-subtle)',
                        color: 'var(--dl-text-primary)',
                        fontFamily: 'var(--dl-font-mono)',
                        fontSize: 11,
                      }}
                    >
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
