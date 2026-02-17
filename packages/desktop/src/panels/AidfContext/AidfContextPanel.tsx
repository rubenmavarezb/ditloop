import { useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAidfContextStore, type AidfFile } from '../../store/aidf-context.js';
import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';
import { useWorkspaces } from '../../hooks/useWorkspaces.js';

/**
 * AIDF Context Manager panel — shows and manages .ai/ folder contents
 * for the active workspace. Allows toggling context files on/off.
 */
export function AidfContextPanel() {
  const { activeTabId } = useWorkspaceTabsStore();
  const { workspaces } = useWorkspaces();
  const activeWorkspace = workspaces.find((ws) => ws.id === activeTabId);
  const workspaceId = activeTabId ?? '';
  const workspacePath = activeWorkspace?.path;

  const { setFiles, toggleFile, removeFile, setActiveRole, setActiveTask } = useAidfContextStore();
  const context = useAidfContextStore((s) => s.contexts[workspaceId]);
  const files = context?.files ?? [];
  const additionalFiles = context?.additionalFiles ?? [];

  // Auto-detect .ai/ folder contents
  const detectAidf = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const aiPath = `${workspacePath}/.ai`;
      const exists = await invoke<boolean>('file_exists', { path: aiPath });
      if (!exists) {
        setFiles(workspaceId, []);
        return;
      }

      const entries = await invoke<Array<{ name: string; path: string; is_dir: boolean }>>('list_directory', { path: aiPath });
      const aidfFiles: AidfFile[] = [];

      for (const entry of entries) {
        if (entry.is_dir) {
          // Scan subdirectories (roles/, tasks/, plans/)
          const subEntries = await invoke<Array<{ name: string; path: string; is_dir: boolean }>>('list_directory', { path: entry.path });
          const type = classifyAidfDir(entry.name);
          for (const sub of subEntries) {
            if (!sub.is_dir && (sub.name.endsWith('.md') || sub.name.endsWith('.yaml') || sub.name.endsWith('.yml'))) {
              aidfFiles.push({
                path: sub.path.replace(workspacePath + '/', ''),
                name: sub.name,
                type,
                enabled: true,
              });
            }
          }
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.yaml')) {
          aidfFiles.push({
            path: entry.path.replace(workspacePath + '/', ''),
            name: entry.name,
            type: entry.name.includes('AGENT') ? 'agent' : 'other',
            enabled: true,
          });
        }
      }

      setFiles(workspaceId, aidfFiles);
    } catch {
      setFiles(workspaceId, []);
    }
  }, [workspacePath, workspaceId, setFiles]);

  useEffect(() => {
    detectAidf();
  }, [detectAidf]);

  const roles = files.filter((f) => f.type === 'role');
  const tasks = files.filter((f) => f.type === 'task');
  const plans = files.filter((f) => f.type === 'plan');
  const agents = files.filter((f) => f.type === 'agent');
  const others = files.filter((f) => f.type === 'other');

  if (!workspacePath) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
          Select a workspace to manage AIDF context
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 44,
          background: 'var(--dl-bg-panel-hover)',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>✨</span>
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: 'var(--dl-accent-primary)', letterSpacing: '0.6px', textShadow: 'var(--dl-glow-primary)' }}
          >
            AIDF CONTEXT
          </span>
        </div>
        <button
          onClick={detectAidf}
          className="p-1 rounded"
          style={{ color: 'var(--dl-text-muted)' }}
          title="Refresh"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* Context summary card */}
      <div className="p-3">
        <div
          className="p-3 rounded-lg"
          style={{
            background: 'rgba(0, 217, 255, 0.05)',
            border: '1px solid rgba(0, 217, 255, 0.15)',
            borderRadius: 'var(--dl-radius-card)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--dl-accent-primary)' }}>
              Active Context
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {context?.activeRole && (
              <ContextTag label={`Role: ${context.activeRole}`} type="role" />
            )}
            {context?.activeTask && (
              <ContextTag label={`Task: ${context.activeTask}`} type="task" />
            )}
            {context?.activePlan && (
              <ContextTag label={`Plan: ${context.activePlan}`} type="plan" />
            )}
            <ContextTag label={`${files.filter((f) => f.enabled).length} files`} type="other" />
          </div>
        </div>
      </div>

      {/* File sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {roles.length > 0 && (
          <AidfSection
            title="Roles"
            icon="👤"
            files={roles}
            onToggle={(path) => toggleFile(workspaceId, path)}
            onActivate={(name) => setActiveRole(workspaceId, name)}
            activeItem={context?.activeRole}
          />
        )}
        {tasks.length > 0 && (
          <AidfSection
            title="Tasks"
            icon="📋"
            files={tasks}
            onToggle={(path) => toggleFile(workspaceId, path)}
            onActivate={(name) => setActiveTask(workspaceId, name)}
            activeItem={context?.activeTask}
          />
        )}
        {plans.length > 0 && (
          <AidfSection
            title="Plans"
            icon="🗺️"
            files={plans}
            onToggle={(path) => toggleFile(workspaceId, path)}
          />
        )}
        {agents.length > 0 && (
          <AidfSection
            title="Agents"
            icon="🤖"
            files={agents}
            onToggle={(path) => toggleFile(workspaceId, path)}
          />
        )}
        {others.length > 0 && (
          <AidfSection
            title="Other"
            icon="📄"
            files={others}
            onToggle={(path) => toggleFile(workspaceId, path)}
          />
        )}

        {/* Additional files */}
        {additionalFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--dl-text-secondary)' }}>
                Additional Files
              </span>
            </div>
            {additionalFiles.map((f) => (
              <div key={f} className="flex items-center justify-between py-1 px-2">
                <span className="text-xs font-mono truncate" style={{ color: 'var(--dl-text-secondary)', fontSize: 11 }}>
                  {f}
                </span>
                <button
                  onClick={() => removeFile(workspaceId, f)}
                  className="shrink-0"
                  style={{ color: 'var(--dl-text-muted)', fontSize: 10 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && additionalFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span style={{ fontSize: 24 }}>✨</span>
            <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
              No .ai/ folder detected
            </span>
            <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
              Create a .ai/ folder in your workspace to use AIDF
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Classify an .ai/ subdirectory name to a type. */
function classifyAidfDir(name: string): AidfFile['type'] {
  if (name === 'roles') return 'role';
  if (name === 'tasks') return 'task';
  if (name === 'plans') return 'plan';
  if (name === 'agents') return 'agent';
  return 'other';
}

/** Context tag badge. */
function ContextTag({ label, type }: { label: string; type: AidfFile['type'] }) {
  const colors: Record<string, string> = {
    role: 'rgba(189, 0, 255, 0.15)',
    task: 'rgba(0, 217, 255, 0.15)',
    plan: 'rgba(34, 197, 94, 0.15)',
    agent: 'rgba(251, 146, 60, 0.15)',
    other: 'rgba(255, 255, 255, 0.05)',
  };

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        background: colors[type] ?? colors.other,
        color: 'var(--dl-text-secondary)',
        fontSize: 10,
      }}
    >
      {label}
    </span>
  );
}

/** AIDF file section with toggle checkboxes. */
function AidfSection({
  title,
  icon,
  files,
  onToggle,
  onActivate,
  activeItem,
}: {
  title: string;
  icon: string;
  files: AidfFile[];
  onToggle: (path: string) => void;
  onActivate?: (name: string) => void;
  activeItem?: string | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--dl-text-secondary)' }}>
          {title}
        </span>
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>{files.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {files.map((f) => {
          const nameWithoutExt = f.name.replace(/\.(md|yaml|yml)$/, '');
          const isActive = activeItem === nameWithoutExt;
          return (
            <div key={f.path} className="flex items-center gap-2 py-1 px-2 rounded" style={{ background: isActive ? 'rgba(0, 217, 255, 0.05)' : undefined }}>
              <input
                type="checkbox"
                checked={f.enabled}
                onChange={() => onToggle(f.path)}
                className="shrink-0"
                style={{ accentColor: 'var(--dl-accent-primary)' }}
              />
              <button
                className="text-xs truncate flex-1 text-left"
                style={{
                  color: f.enabled ? 'var(--dl-text-secondary)' : 'var(--dl-text-muted)',
                  fontFamily: 'var(--dl-font-mono)',
                  fontSize: 11,
                }}
                onClick={() => onActivate?.(nameWithoutExt)}
              >
                {f.name}
              </button>
              {isActive && (
                <span className="text-xs shrink-0" style={{ color: 'var(--dl-accent-primary)', fontSize: 9, fontWeight: 600 }}>
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
