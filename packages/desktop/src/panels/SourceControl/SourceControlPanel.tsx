import { useState, useCallback } from 'react';
import { useGitStatus, useGitLog, useGitActions, useGitStash } from '../../hooks/useLocalGit.js';
import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';

/**
 * Source Control panel — right sidebar.
 * Shows branch info, commit input, staged/unstaged/untracked changes, recent commits, stashes.
 * Wired to Tauri git commands for real git operations.
 */
export function SourceControlPanel() {
  const { activeTabId } = useWorkspaceTabsStore();
  const { workspaces } = useWorkspaces();
  const activeWorkspace = workspaces.find((ws) => ws.id === activeTabId);
  const workspacePath = activeWorkspace?.path;

  const { data: status, loading, refresh } = useGitStatus(workspacePath);
  const { data: recentCommits } = useGitLog(workspacePath, 10);
  const { stageFiles, unstageFiles, discardFile, commit, push } = useGitActions(workspacePath);
  const { stashes, create: createStash, pop: popStash, drop: dropStash } = useGitStash(workspacePath);

  const [commitMsg, setCommitMsg] = useState('');
  const [committing, setCommitting] = useState(false);
  const [showCommits, setShowCommits] = useState(false);
  const [showStashes, setShowStashes] = useState(false);

  const totalChanges = (status?.staged.length ?? 0) + (status?.unstaged.length ?? 0) + (status?.untracked.length ?? 0);

  const handleCommit = useCallback(async () => {
    if (!commitMsg.trim()) return;
    setCommitting(true);
    try {
      await commit(commitMsg.trim());
      setCommitMsg('');
      await refresh();
    } finally {
      setCommitting(false);
    }
  }, [commitMsg, commit, refresh]);

  const handleCommitAndPush = useCallback(async () => {
    if (!commitMsg.trim()) return;
    setCommitting(true);
    try {
      await commit(commitMsg.trim());
      await push();
      setCommitMsg('');
      await refresh();
    } finally {
      setCommitting(false);
    }
  }, [commitMsg, commit, push, refresh]);

  const handleStageFile = useCallback(
    async (file: string) => {
      await stageFiles([file]);
      await refresh();
    },
    [stageFiles, refresh],
  );

  const handleUnstageFile = useCallback(
    async (file: string) => {
      await unstageFiles([file]);
      await refresh();
    },
    [unstageFiles, refresh],
  );

  const handleStageAll = useCallback(async () => {
    const files = [...(status?.unstaged.map((f) => f.path) ?? []), ...(status?.untracked ?? [])];
    if (files.length > 0) {
      await stageFiles(files);
      await refresh();
    }
  }, [status, stageFiles, refresh]);

  const handleUnstageAll = useCallback(async () => {
    const files = status?.staged.map((f) => f.path) ?? [];
    if (files.length > 0) {
      await unstageFiles(files);
      await refresh();
    }
  }, [status, unstageFiles, refresh]);

  const handleDiscard = useCallback(
    async (file: string) => {
      await discardFile(file);
      await refresh();
    },
    [discardFile, refresh],
  );

  if (!workspacePath) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
          Select a workspace to view source control
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 44,
          background: 'var(--dl-bg-panel-hover)',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: 'var(--dl-text-primary)', letterSpacing: '0.6px' }}
          >
            SOURCE CONTROL
          </span>
          {totalChanges > 0 && (
            <span
              className="flex items-center justify-center text-xs rounded-full px-1.5"
              style={{
                height: 18,
                minWidth: 20,
                background: 'rgba(0, 184, 212, 0.2)',
                color: 'var(--dl-accent-primary)',
                border: '1px solid rgba(0, 184, 212, 0.3)',
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {totalChanges}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={refresh} className="p-1 rounded" style={{ color: 'var(--dl-text-muted)' }} title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading && !status && (
          <div className="flex items-center justify-center py-8">
            <span style={{ color: 'var(--dl-text-muted)', fontSize: 12 }}>Loading git status...</span>
          </div>
        )}

        {status && (
          <>
            {/* Branch Info */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'var(--dl-bg-panel-hover)',
                border: '1px solid var(--dl-border-subtle)',
                borderRadius: 'var(--dl-radius-button)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dl-accent-primary)' }}>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ color: 'var(--dl-text-primary)' }}>
                  {status.branch}
                </span>
                <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
                  {status.ahead > 0 || status.behind > 0
                    ? `↑ ${status.ahead} ↓ ${status.behind} from origin`
                    : 'Up to date'}
                </span>
              </div>
            </div>

            {/* Commit Message Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleCommit();
                  }
                }}
                placeholder="Commit message... (Ctrl+Enter to commit)"
                className="w-full resize-none rounded-lg p-3 text-xs outline-none selectable"
                style={{
                  background: 'var(--dl-bg-input)',
                  border: '1px solid var(--dl-border-default)',
                  borderRadius: 'var(--dl-radius-button)',
                  color: 'var(--dl-text-primary)',
                  fontFamily: 'var(--dl-font-sans)',
                  minHeight: 60,
                }}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCommit}
                  disabled={committing || !commitMsg.trim() || (status.staged.length === 0)}
                  className="flex-1 rounded-lg py-2 text-xs font-medium"
                  style={{
                    background: commitMsg.trim() && status.staged.length > 0 ? 'var(--dl-accent-primary)' : 'var(--dl-bg-panel-hover)',
                    color: commitMsg.trim() && status.staged.length > 0 ? 'var(--dl-text-inverse)' : 'var(--dl-text-muted)',
                    borderRadius: 'var(--dl-radius-button)',
                    opacity: committing ? 0.6 : 1,
                  }}
                >
                  {committing ? 'Committing...' : 'Commit'}
                </button>
                <button
                  onClick={handleCommitAndPush}
                  disabled={committing || !commitMsg.trim() || (status.staged.length === 0)}
                  className="rounded-lg py-2 px-3 text-xs font-medium"
                  style={{
                    background: 'var(--dl-bg-panel-hover)',
                    color: 'var(--dl-text-secondary)',
                    border: '1px solid var(--dl-border-default)',
                    borderRadius: 'var(--dl-radius-button)',
                    opacity: committing ? 0.6 : 1,
                  }}
                >
                  Commit & Push
                </button>
              </div>
            </div>

            {/* Staged Changes */}
            {status.staged.length > 0 && (
              <FileSection
                title="Staged Changes"
                count={status.staged.length}
                actions={<SectionButton label="−" title="Unstage all" onClick={handleUnstageAll} />}
              >
                {status.staged.map((f) => (
                  <FileEntry
                    key={f.path}
                    name={f.path}
                    status={statusToCode(f.status)}
                    onAction={() => handleUnstageFile(f.path)}
                    actionIcon="−"
                    actionTitle="Unstage"
                  />
                ))}
              </FileSection>
            )}

            {/* Unstaged Changes */}
            {status.unstaged.length > 0 && (
              <FileSection
                title="Changes"
                count={status.unstaged.length}
                actions={<SectionButton label="+" title="Stage all" onClick={handleStageAll} />}
              >
                {status.unstaged.map((f) => (
                  <FileEntry
                    key={f.path}
                    name={f.path}
                    status={statusToCode(f.status)}
                    onAction={() => handleStageFile(f.path)}
                    actionIcon="+"
                    actionTitle="Stage"
                    onSecondaryAction={() => handleDiscard(f.path)}
                    secondaryIcon="↺"
                    secondaryTitle="Discard changes"
                  />
                ))}
              </FileSection>
            )}

            {/* Untracked */}
            {status.untracked.length > 0 && (
              <FileSection title="Untracked" count={status.untracked.length}>
                {status.untracked.map((f) => (
                  <FileEntry
                    key={f}
                    name={f}
                    status="?"
                    onAction={() => handleStageFile(f)}
                    actionIcon="+"
                    actionTitle="Stage"
                  />
                ))}
              </FileSection>
            )}

            {/* Stashes */}
            <CollapsibleSection
              title="Stashes"
              count={stashes.length}
              open={showStashes}
              onToggle={() => setShowStashes(!showStashes)}
              actions={
                <SectionButton label="+" title="Create stash" onClick={() => createStash()} />
              }
            >
              {stashes.map((s) => (
                <div key={s.index} className="flex items-center justify-between px-2 py-1 text-xs">
                  <span style={{ color: 'var(--dl-text-secondary)', fontFamily: 'var(--dl-font-mono)', fontSize: 11 }}>
                    stash@{`{${s.index}}`}: {s.message}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => popStash(s.index)}
                      className="px-1 rounded"
                      style={{ color: 'var(--dl-color-success)', fontSize: 10 }}
                      title="Pop stash"
                    >
                      pop
                    </button>
                    <button
                      onClick={() => dropStash(s.index)}
                      className="px-1 rounded"
                      style={{ color: 'var(--dl-color-error)', fontSize: 10 }}
                      title="Drop stash"
                    >
                      drop
                    </button>
                  </div>
                </div>
              ))}
              {stashes.length === 0 && (
                <span className="px-2 text-xs" style={{ color: 'var(--dl-text-muted)' }}>No stashes</span>
              )}
            </CollapsibleSection>

            {/* Recent Commits */}
            <CollapsibleSection
              title="Recent Commits"
              count={recentCommits.length}
              open={showCommits}
              onToggle={() => setShowCommits(!showCommits)}
            >
              {recentCommits.slice(0, 10).map((c) => (
                <div key={c.hash} className="flex items-start gap-2 px-2 py-1.5">
                  <span
                    className="shrink-0 font-mono"
                    style={{ color: 'var(--dl-accent-primary)', fontSize: 10 }}
                  >
                    {c.short_hash}
                  </span>
                  <span className="text-xs truncate" style={{ color: 'var(--dl-text-secondary)' }}>
                    {c.message}
                  </span>
                </div>
              ))}
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}

/** Convert Rust status string to display code. */
function statusToCode(status: string): string {
  const map: Record<string, string> = {
    modified: 'M',
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    copied: 'C',
    'type-changed': 'T',
  };
  return map[status] ?? '?';
}

/** Small inline action button for section headers. */
function SectionButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center rounded"
      style={{
        width: 18,
        height: 18,
        color: 'var(--dl-text-muted)',
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

/** Section header for file groups (Staged, Changes, Untracked). */
function FileSection({
  title,
  count,
  actions,
  children,
}: {
  title: string;
  count: number;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--dl-text-secondary)' }}>
            {title}
          </span>
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>{count}</span>
        </div>
        {actions}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </div>
    </div>
  );
}

/** Collapsible section for commits and stashes. */
function CollapsibleSection({
  title,
  count,
  open,
  onToggle,
  actions,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-2">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: 'var(--dl-text-muted)',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--dl-text-secondary)' }}>
            {title}
          </span>
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>{count}</span>
        </button>
        {actions}
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Single file entry with action buttons. */
function FileEntry({
  name,
  status,
  onAction,
  actionIcon,
  actionTitle,
  onSecondaryAction,
  secondaryIcon,
  secondaryTitle,
}: {
  name: string;
  status: string;
  onAction?: () => void;
  actionIcon?: string;
  actionTitle?: string;
  onSecondaryAction?: () => void;
  secondaryIcon?: string;
  secondaryTitle?: string;
}) {
  const statusColors: Record<string, string> = {
    M: 'var(--dl-color-warning)',
    A: 'var(--dl-color-success)',
    D: 'var(--dl-color-error)',
    R: 'var(--dl-accent-primary)',
    '?': 'var(--dl-text-muted)',
  };

  return (
    <div
      className="group flex items-center justify-between rounded px-2 py-1 text-xs"
      style={{ borderRadius: 'var(--dl-radius-small)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold shrink-0" style={{ color: statusColors[status] ?? 'var(--dl-text-muted)', fontSize: 10, width: 14 }}>
          {status}
        </span>
        <span
          className="truncate"
          style={{ color: 'var(--dl-text-secondary)', fontFamily: 'var(--dl-font-mono)', fontSize: 11 }}
        >
          {name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onSecondaryAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onSecondaryAction(); }}
            title={secondaryTitle}
            className="flex items-center justify-center rounded"
            style={{ width: 16, height: 16, color: 'var(--dl-text-muted)', fontSize: 12 }}
          >
            {secondaryIcon}
          </button>
        )}
        {onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            title={actionTitle}
            className="flex items-center justify-center rounded"
            style={{ width: 16, height: 16, color: 'var(--dl-text-muted)', fontSize: 14 }}
          >
            {actionIcon}
          </button>
        )}
      </div>
    </div>
  );
}
