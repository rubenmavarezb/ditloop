import { useMemo } from 'react';
import { useTaskExecutionStore, type AiTask, type TaskStep, type AgentLogEntry } from '../../store/task-execution.js';

/**
 * AI Task Execution panel — shows autonomous task progress,
 * agent logs, and approval workflow for proposed changes.
 */
export function TaskExecutionPanel() {
  const { tasks, activeTaskId, setActiveTask, approveChanges, rejectChanges, setTaskStatus } = useTaskExecutionStore();
  const taskList = useMemo(() => Object.values(tasks), [tasks]);
  const activeTask = activeTaskId ? tasks[activeTaskId] : undefined;

  if (taskList.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 48, height: 48, background: 'var(--dl-accent-gradient)', opacity: 0.4 }}
        >
          <span className="text-lg font-bold" style={{ color: 'var(--dl-text-inverse)' }}>AI</span>
        </div>
        <span className="text-sm" style={{ color: 'var(--dl-text-muted)' }}>
          No tasks running
        </span>
        <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
          Start a task from the AI Chat panel
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Task selector tabs */}
      {taskList.length > 1 && (
        <div
          className="flex shrink-0 overflow-x-auto"
          style={{
            height: 36,
            borderBottom: '1px solid var(--dl-border-subtle)',
            background: 'var(--dl-bg-panel-hover)',
            scrollbarWidth: 'none',
          }}
        >
          {taskList.map((task) => (
            <button
              key={task.id}
              onClick={() => setActiveTask(task.id)}
              className="flex items-center gap-2 px-3 text-xs shrink-0"
              style={{
                color: task.id === activeTaskId ? 'var(--dl-text-primary)' : 'var(--dl-text-muted)',
                borderBottom: task.id === activeTaskId ? '2px solid var(--dl-accent-primary)' : '2px solid transparent',
              }}
            >
              <StatusDot status={task.status} />
              {task.title}
            </button>
          ))}
        </div>
      )}

      {activeTask ? (
        <TaskDetail
          task={activeTask}
          onApprove={() => approveChanges(activeTask.id)}
          onReject={() => rejectChanges(activeTask.id)}
          onPause={() => setTaskStatus(activeTask.id, 'paused')}
          onResume={() => setTaskStatus(activeTask.id, 'running')}
          onStop={() => setTaskStatus(activeTask.id, 'failed')}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>Select a task</span>
        </div>
      )}
    </div>
  );
}

/** Detailed view of a single task. */
function TaskDetail({
  task,
  onApprove,
  onReject,
  onPause,
  onResume,
  onStop,
}: {
  task: AiTask;
  onApprove: () => void;
  onReject: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const statusLabels: Record<string, string> = {
    running: 'Running',
    paused: 'Paused',
    'awaiting-approval': 'Awaiting Approval',
    done: 'Done',
    failed: 'Failed',
  };

  const statusColors: Record<string, string> = {
    running: 'var(--dl-accent-primary)',
    paused: 'var(--dl-color-warning)',
    'awaiting-approval': '#fb923c',
    done: 'var(--dl-color-success)',
    failed: 'var(--dl-color-error)',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Task header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 48,
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: `${statusColors[task.status]}22`,
              color: statusColors[task.status],
              borderRadius: 'var(--dl-radius-small)',
            }}
          >
            {task.id}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--dl-text-primary)' }}>
            {task.title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: `${statusColors[task.status]}15`,
              color: statusColors[task.status],
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {statusLabels[task.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
            {task.provider}/{task.model.split('/').pop()}
          </span>
          {task.status === 'running' && (
            <button onClick={onPause} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--dl-color-warning)', background: 'rgba(250, 204, 21, 0.1)' }}>
              Pause
            </button>
          )}
          {task.status === 'paused' && (
            <button onClick={onResume} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--dl-accent-primary)', background: 'rgba(0, 217, 255, 0.1)' }}>
              Resume
            </button>
          )}
          <button onClick={onStop} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--dl-color-error)', background: 'rgba(239, 68, 68, 0.1)' }}>
            Stop
          </button>
        </div>
      </div>

      {/* Approval banner */}
      {task.status === 'awaiting-approval' && task.proposedChanges.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: 'rgba(251, 146, 60, 0.08)',
            borderBottom: '1px solid rgba(251, 146, 60, 0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fb923c' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs font-medium" style={{ color: '#fb923c' }}>
              AI wants to modify {task.proposedChanges.length} file{task.proposedChanges.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onApprove} className="text-xs px-3 py-1.5 rounded font-medium" style={{ background: 'var(--dl-color-success)', color: 'var(--dl-text-inverse)', borderRadius: 'var(--dl-radius-small)' }}>
              Approve
            </button>
            <button onClick={onReject} className="text-xs px-3 py-1.5 rounded font-medium" style={{ background: 'var(--dl-bg-panel-hover)', color: 'var(--dl-text-secondary)', border: '1px solid var(--dl-border-default)', borderRadius: 'var(--dl-radius-small)' }}>
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Content: Steps + Logs */}
      <div className="flex flex-1 overflow-hidden">
        {/* Steps */}
        <div className="w-64 shrink-0 p-4 overflow-y-auto" style={{ borderRight: '1px solid var(--dl-border-subtle)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: 'var(--dl-text-secondary)', letterSpacing: '0.6px' }}>
            STEPS
          </div>
          <div className="flex flex-col gap-3">
            {task.steps.map((step) => (
              <StepRow key={step.id} step={step} />
            ))}
          </div>

          {task.aidfTaskRef && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--dl-border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>AIDF Task:</span>
              <span className="text-xs font-mono block mt-1" style={{ color: 'var(--dl-accent-primary)', fontSize: 10 }}>
                {task.aidfTaskRef}
              </span>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="flex-1 p-4 overflow-y-auto" style={{ background: 'var(--dl-bg-terminal, #08080a)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: 'var(--dl-text-secondary)', letterSpacing: '0.6px' }}>
            AGENT LOGS
          </div>
          {task.logs.length === 0 ? (
            <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
              Waiting for output...
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              {task.logs.map((log, i) => (
                <LogRow key={i} entry={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Task step row. */
function StepRow({ step }: { step: TaskStep }) {
  const colors = {
    done: 'var(--dl-color-success)',
    running: 'var(--dl-accent-primary)',
    pending: 'var(--dl-text-muted)',
    failed: 'var(--dl-color-error)',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{
          background: colors[step.status],
          boxShadow: step.status === 'running' ? `0 0 6px ${colors[step.status]}` : undefined,
        }}
      />
      <span
        className="text-xs"
        style={{
          color: step.status === 'pending' ? 'var(--dl-text-muted)' : 'var(--dl-text-secondary)',
          fontWeight: step.status === 'running' ? 600 : 400,
        }}
      >
        {step.label}
      </span>
      {step.status === 'done' && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--dl-color-success)' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

/** Agent log row. */
function LogRow({ entry }: { entry: AgentLogEntry }) {
  const agentColors: Record<string, string> = {
    ARCHITECT: '#bd00ff',
    ANALYZER: 'var(--dl-accent-primary)',
    CODER: 'var(--dl-color-success)',
    TESTER: 'var(--dl-color-warning)',
    REVIEWER: '#fb923c',
  };

  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex items-start gap-2 font-mono text-xs">
      <span style={{ color: 'var(--dl-text-muted)', fontSize: 10, flexShrink: 0 }}>{time}</span>
      <span style={{ color: agentColors[entry.agent] ?? 'var(--dl-text-muted)', fontWeight: 600, fontSize: 10, flexShrink: 0 }}>
        [{entry.agent}]
      </span>
      <span style={{ color: entry.level === 'error' ? 'var(--dl-color-error)' : entry.level === 'warn' ? 'var(--dl-color-warning)' : 'var(--dl-text-secondary)' }}>
        {entry.message}
      </span>
    </div>
  );
}

/** Status dot matching task status. */
function StatusDot({ status }: { status: AiTask['status'] }) {
  const colors: Record<string, string> = {
    running: 'var(--dl-accent-primary)',
    paused: 'var(--dl-color-warning)',
    'awaiting-approval': '#fb923c',
    done: 'var(--dl-color-success)',
    failed: 'var(--dl-color-error)',
  };

  return (
    <div
      className="h-1.5 w-1.5 rounded-full"
      style={{
        background: colors[status],
        boxShadow: status === 'running' ? `0 0 4px ${colors[status]}` : undefined,
      }}
    />
  );
}
