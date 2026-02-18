import { useState } from 'react';
import { useLayoutStore, type LayoutPresetId, layoutPresets } from '@ditloop/web-ui';

/** Preset metadata for UI display. */
const PRESET_ICONS: Record<LayoutPresetId, { icon: string; shortcut: string }> = {
  default: { icon: '⊞', shortcut: '⌘1' },
  'code-focus': { icon: '⟨⟩', shortcut: '⌘2' },
  'ai-focus': { icon: '✦', shortcut: '⌘3' },
  'git-focus': { icon: '⑂', shortcut: '⌘4' },
  zen: { icon: '◯', shortcut: '⌘5' },
};

/**
 * Layout preset selector — displays current preset with dropdown to switch.
 * Renders as a compact button in the title bar.
 */
export function LayoutSelector() {
  const { preset, setPreset } = useLayoutStore();
  const [open, setOpen] = useState(false);
  const currentPreset = layoutPresets[preset];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: 'var(--dl-bg-panel-hover)',
          border: '1px solid var(--dl-border-subtle)',
        }}
      >
        <span style={{ fontSize: 12 }}>{PRESET_ICONS[preset].icon}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--dl-text-primary)' }}>
          {currentPreset.name}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dl-text-muted)' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full right-0 mt-1 z-50 rounded-lg overflow-hidden"
            style={{
              background: 'var(--dl-bg-surface, #0f0f13)',
              border: '1px solid var(--dl-border-default)',
              borderRadius: 'var(--dl-radius-card)',
              minWidth: 220,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--dl-border-subtle)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--dl-text-muted)', letterSpacing: '0.6px' }}>
                LAYOUT
              </span>
            </div>
            {(Object.keys(layoutPresets) as LayoutPresetId[]).map((id) => {
              const p = layoutPresets[id];
              const meta = PRESET_ICONS[id];
              const isActive = id === preset;
              return (
                <button
                  key={id}
                  onClick={() => { setPreset(id); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left"
                  style={{
                    background: isActive ? 'rgba(0, 217, 255, 0.08)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>
                    {meta.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: isActive ? 'var(--dl-accent-primary)' : 'var(--dl-text-primary)' }}>
                      {p.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--dl-text-muted)', fontSize: 10 }}>
                      {p.description}
                    </div>
                  </div>
                  <kbd
                    className="text-xs px-1 rounded shrink-0"
                    style={{
                      background: 'var(--dl-border-strong)',
                      color: 'var(--dl-text-muted)',
                      fontFamily: 'var(--dl-font-mono)',
                      fontSize: 9,
                    }}
                  >
                    {meta.shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
