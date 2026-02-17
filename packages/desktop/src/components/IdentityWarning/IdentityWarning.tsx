import type { IdentityMismatch } from '../../hooks/useIdentityCheck.js';

/** Props for the IdentityWarning component. */
interface IdentityWarningProps {
  mismatch: IdentityMismatch;
  onSwitch: () => void;
  onDismiss: () => void;
  /** Display variant: 'banner' for source control, 'inline' for status bar, 'badge' for tabs. */
  variant?: 'banner' | 'inline' | 'badge';
}

/**
 * Identity mismatch warning component.
 * Shows when git email doesn't match the workspace's configured profile.
 * Offers a quick "Switch to {profile}" action.
 */
export function IdentityWarning({ mismatch, onSwitch, onDismiss, variant = 'banner' }: IdentityWarningProps) {
  if (variant === 'badge') {
    return (
      <div
        className="flex items-center gap-1 px-1.5 py-0.5 rounded"
        style={{
          background: 'rgba(251, 146, 60, 0.15)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
        }}
        title={`Identity mismatch: using ${mismatch.currentEmail}, expected ${mismatch.expectedEmail}`}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#fb923c' }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ color: '#fb923c', fontSize: 10, fontWeight: 600 }}>ID</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onSwitch}
        className="flex items-center gap-1.5"
        style={{ color: '#fb923c' }}
        title={`Switch to ${mismatch.expectedProfile}`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ fontWeight: 600, fontSize: 11 }}>Identity mismatch</span>
      </button>
    );
  }

  // Banner variant (default) for source control panel
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{
        background: 'rgba(251, 146, 60, 0.08)',
        border: '1px solid rgba(251, 146, 60, 0.2)',
        borderRadius: 'var(--dl-radius-button)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fb923c', flexShrink: 0 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: '#fb923c' }}>
          Identity mismatch
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--dl-text-muted)' }}>
          Using <span style={{ fontFamily: 'var(--dl-font-mono)', color: 'var(--dl-text-secondary)' }}>{mismatch.currentEmail}</span>,
          expected <span style={{ fontFamily: 'var(--dl-font-mono)', color: 'var(--dl-text-secondary)' }}>{mismatch.expectedEmail}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSwitch}
          className="text-xs px-2 py-1 rounded font-medium"
          style={{
            background: 'rgba(251, 146, 60, 0.2)',
            color: '#fb923c',
            borderRadius: 'var(--dl-radius-small)',
          }}
        >
          Switch to {mismatch.expectedProfile}
        </button>
        <button
          onClick={onDismiss}
          className="p-1 rounded"
          style={{ color: 'var(--dl-text-muted)' }}
          title="Dismiss"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
