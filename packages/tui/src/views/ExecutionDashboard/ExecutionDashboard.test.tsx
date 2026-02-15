import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { ExecutionDashboard, type ExecutionRow } from './ExecutionDashboard.js';

describe('ExecutionDashboard', () => {
  const mockExecutions: ExecutionRow[] = [
    {
      id: 'exec-001',
      workspace: 'ditloop',
      status: 'running',
      startTime: Date.now() - 30000,
      duration: undefined,
    },
    {
      id: 'exec-002',
      workspace: 'solu',
      status: 'completed',
      startTime: Date.now() - 120000,
      duration: 90000,
      exitCode: 0,
    },
    {
      id: 'exec-003',
      workspace: 'ditloop',
      status: 'failed',
      startTime: Date.now() - 300000,
      duration: 45000,
      exitCode: 1,
    },
  ];

  it('should render execution table with headers', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={mockExecutions}
        serverConnected={true}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('Executions');
    expect(output).toContain('ID');
    expect(output).toContain('Workspace');
    expect(output).toContain('Status');
  });

  it('should show server connection status', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={[]}
        serverConnected={true}
      />,
    );

    expect(lastFrame()).toContain('Connected');
  });

  it('should show disconnected status', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={[]}
        serverConnected={false}
      />,
    );

    expect(lastFrame()).toContain('Disconnected');
  });

  it('should show empty message when no executions', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={[]}
        serverConnected={true}
      />,
    );

    expect(lastFrame()).toContain('No executions');
  });

  it('should display execution rows', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={mockExecutions}
        serverConnected={true}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('ditloop');
    expect(output).toContain('solu');
  });

  it('should show keyboard shortcuts', () => {
    const { lastFrame } = render(
      <ExecutionDashboard
        executions={[]}
        serverConnected={true}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('cancel');
    expect(output).toContain('filter');
    expect(output).toContain('sort');
  });
});
