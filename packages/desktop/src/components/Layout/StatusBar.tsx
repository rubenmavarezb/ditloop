import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';
import { useGitStatus } from '../../hooks/useLocalGit.js';
import { useIdentityCheck } from '../../hooks/useIdentityCheck.js';
import { useAidfContextStore } from '../../store/aidf-context.js';
import { useTaskExecutionStore } from '../../store/task-execution.js';
import { useLayoutStore, layoutPresets } from '@ditloop/web-ui';
import { IdentityWarning } from '../IdentityWarning/IdentityWarning.js';

/**
 * Enhanced status bar with full context.
 * Height: 32px. Shows: git identity, branch, AIDF status, errors/warnings,
 * task status, cursor position, encoding, layout mode.
 */
export function StatusBar() {
  const { activeTabId } = useWorkspaceTabsStore();
  const { workspaces } = useWorkspaces();
  const activeWorkspace = workspaces.find((ws) => ws.id === activeTabId);
  const { data: gitStatus } = useGitStatus(activeWorkspace?.path);
  const { mismatch, switchProfile, dismiss } = useIdentityCheck(
    activeTabId,
    activeWorkspace?.path,
    activeWorkspace?.profile,
  );
  const { preset } = useLayoutStore();
  const currentPreset = layoutPresets[preset];

  const contextSummary = useAidfContextStore((s) => s.getContextSummary(activeTabId ?? ''));
  const runningTasks = useTaskExecutionStore((s) => Object.values(s.tasks).filter((t) => t.status === 'running' || t.status === 'awaiting-approval'));

  return (
    <footer
      className="flex shrink-0 items-center justify-between px-4"
      style={{
        height: 32,
        background: 'var(--dl-bg-header, rgba(10, 10, 15, 0.8))',
        backdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        WebkitBackdropFilter: 'blur(var(--dl-glass-blur, 10.5px))',
        borderTop: '1px solid var(--dl-border-subtle, rgba(255, 255, 255, 0.05))',
        fontFamily: 'var(--dl-font-sans)',
        fontSize: 11,
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Identity mismatch warning */}
        {mismatch && (
          <IdentityWarning
            mismatch={mismatch}
            onSwitch={switchProfile}
            onDismiss={dismiss}
            variant="inline"
          />
        )}

        {/* Git branch */}
        {gitStatus && (
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-text-secondary)' }}>
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <span style={{ color: 'var(--dl-text-secondary)', fontWeight: 500 }}>
              {gitStatus.branch}
              {(gitStatus.ahead > 0 || gitStatus.behind > 0) && '*'}
            </span>
            {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <span style={{ color: 'var(--dl-text-muted)', fontSize: 10 }}>
                ↑{gitStatus.ahead} ↓{gitStatus.behind}
              </span>
            )}
          </div>
        )}

        {/* AIDF Status */}
        {contextSummary !== 'No context' && (
          <div
            className="flex items-center gap-1.5 pl-3"
            style={{ borderLeft: '1px solid var(--dl-border-strong)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-accent-primary, #00d9ff)' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span
              style={{
                color: 'var(--dl-accent-primary, #00d9ff)',
                fontWeight: 700,
                textShadow: 'var(--dl-glow-primary, 0 0 8px rgba(0, 217, 255, 0.6))',
              }}
            >
              AIDF: {contextSummary}
            </span>
          </div>
        )}

        {/* Running tasks */}
        {runningTasks.length > 0 && (
          <div
            className="flex items-center gap-1.5 pl-3"
            style={{ borderLeft: '1px solid var(--dl-border-strong)' }}
          >
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--dl-accent-primary)' }} />
            <span style={{ color: 'var(--dl-accent-primary)', fontWeight: 600 }}>
              {runningTasks.length} task{runningTasks.length > 1 ? 's' : ''} running
            </span>
          </div>
        )}

        {/* Errors & Warnings */}
        <div
          className="flex items-center gap-3 pl-3"
          style={{ borderLeft: '1px solid var(--dl-border-strong, rgba(255, 255, 255, 0.1))' }}
        >
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-color-error, #f87171)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span style={{ color: 'var(--dl-color-error, #f87171)' }}>0</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-color-warning, #facc15)' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ color: 'var(--dl-color-warning, #facc15)' }}>0</span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3" style={{ color: 'var(--dl-text-muted, #6b7280)', opacity: 0.6 }}>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>TypeScript</span>
        {/* Layout mode badge */}
        <span
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            background: 'var(--dl-bg-panel-hover)',
            color: 'var(--dl-text-secondary)',
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          {currentPreset.name}
        </span>
      </div>
    </footer>
  );
}
