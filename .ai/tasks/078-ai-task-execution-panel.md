# TASK: AI Task execution panel with approval workflow

## Goal
Panel showing autonomous AI task execution with step progress, agent logs, and inline approval for proposed changes. The core of the Developer In The Loop experience.

## Scope

### Allowed
- packages/desktop/src/components/TaskExecution/

### Forbidden
- packages/core/** (use existing execution engine, don't modify)
- packages/tui/**

## Requirements
1. Task header: task ID, title, provider, status badge (Running/Paused/Awaiting Approval/Done)
2. Step progress list: sequence of steps with status indicators
3. Agent execution logs: timestamped entries tagged by agent role ([ARCHITECT], [ANALYZER], etc.)
4. Approval banner (yellow): "AI wants to modify N files" with [Review Diff] [Approve] [Reject]
5. Diff preview for proposed changes (reuse DiffViewer component)
6. Controls: Pause, Resume, Stop buttons
7. "Continue Plan" CTA when awaiting human input
8. AIDF task reference: which .ai/tasks/ file is being executed
9. Context info: provider, model, context window usage, elapsed time
10. Task can run in background while user works in other panels
11. Notification when task needs approval

## Definition of Done
- [ ] TaskExecution component with all sub-sections
- [ ] Integration with @ditloop/core execution engine
- [ ] Approval flow connected to core approval engine
- [ ] Tests for task state transitions
- [ ] Step progress updates in real-time
- [ ] Approval flow works: review diff → approve → changes applied
- [ ] Task continues running while switching workspace tabs

## Metadata
- **Version**: v0.8
- **Phase**: Phase 3: AI Integration
- **Priority**: critical
- **Package**: @ditloop/desktop

## Status: 📋 Planned
