import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecutionMonitor } from './execution-monitor.js';
import { EventBus } from '@ditloop/core';

describe('ExecutionMonitor', () => {
  let eventBus: EventBus;
  let monitor: ExecutionMonitor;

  beforeEach(() => {
    eventBus = new EventBus();
    monitor = new ExecutionMonitor(eventBus);
  });

  afterEach(() => {
    monitor.destroy();
  });

  it('should submit and track an execution', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
    });

    expect(id).toBeTruthy();
    const execution = monitor.getExecution(id);
    expect(execution).toBeDefined();
    expect(execution!.taskId).toBe('task-1');
    expect(execution!.status).toBe('running');
  });

  it('should list all executions', async () => {
    await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws1',
    });
    await monitor.submitExecution({
      taskId: 'task-2',
      workspace: 'ws-2',
      workspacePath: '/tmp/ws2',
    });

    const list = monitor.listExecutions();
    expect(list).toHaveLength(2);
  });

  it('should cancel a running execution', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
    });

    const cancelled = monitor.cancelExecution(id);
    expect(cancelled).toBe(true);

    const execution = monitor.getExecution(id);
    expect(execution!.status).toBe('cancelled');
  });

  it('should return false when cancelling unknown execution', () => {
    expect(monitor.cancelExecution('nonexistent')).toBe(false);
  });

  it('should track output from events', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
    });

    eventBus.emit('execution:output', {
      taskId: id,
      stream: 'stdout',
      data: 'hello world',
    });

    const execution = monitor.getExecution(id);
    expect(execution!.output).toHaveLength(1);
    expect(execution!.output[0].data).toBe('hello world');
  });

  it('should complete execution from events', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
    });

    eventBus.emit('execution:completed', { taskId: id, exitCode: 0 });

    const execution = monitor.getExecution(id);
    expect(execution!.status).toBe('completed');
    expect(execution!.exitCode).toBe(0);
    expect(execution!.duration).toBeDefined();
  });

  it('should fail execution from events', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
    });

    eventBus.emit('execution:error', { taskId: id, error: 'something broke' });

    const execution = monitor.getExecution(id);
    expect(execution!.status).toBe('failed');
    expect(execution!.error).toBe('something broke');
  });

  it('should enforce rate limits', async () => {
    // Create monitor with low rate limit
    monitor.destroy();
    monitor = new ExecutionMonitor(eventBus, { default: 1 });

    const id1 = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws1',
    });

    const id2 = await monitor.submitExecution({
      taskId: 'task-2',
      workspace: 'ws-2',
      workspacePath: '/tmp/ws2',
    });

    const exec1 = monitor.getExecution(id1);
    const exec2 = monitor.getExecution(id2);

    expect(exec1!.status).toBe('running');
    expect(exec2!.status).toBe('queued');
  });

  it('should compute stats correctly', async () => {
    const id = await monitor.submitExecution({
      taskId: 'task-1',
      workspace: 'ws-1',
      workspacePath: '/tmp/ws',
      provider: 'claude',
    });

    eventBus.emit('execution:completed', { taskId: id, exitCode: 0 });

    const stats = monitor.getStats();
    expect(stats.total).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.running).toBe(0);
    expect(stats.providerUsage.claude).toBe(1);
  });
});
