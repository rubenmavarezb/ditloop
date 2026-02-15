import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createApprovalRoutes } from './approvals.js';

describe('approval routes', () => {
  const mockApprovalEngine = {
    pendingActions: [] as any[],
    approveOne: vi.fn(),
    reject: vi.fn(),
    edit: vi.fn(),
  };

  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApprovalEngine.pendingActions = [];
    app = new Hono();
    app.route('/api', createApprovalRoutes({
      getApprovalEngine: () => mockApprovalEngine as any,
    }));
  });

  it('GET /approvals returns empty when no pending', async () => {
    const res = await app.request('/api/approvals');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.approvals).toEqual([]);
  });

  it('GET /approvals returns pending actions', async () => {
    mockApprovalEngine.pendingActions = [
      { id: '1', action: { type: 'file_create', path: '/tmp/a', content: 'x' }, status: 'pending' },
    ];

    const res = await app.request('/api/approvals');
    const json = await res.json();

    expect(json.approvals).toHaveLength(1);
    expect(json.approvals[0].id).toBe('1');
  });

  it('POST /approvals/:id approves an action', async () => {
    const res = await app.request('/api/approvals/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'approve' }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('accepted');
    expect(mockApprovalEngine.approveOne).toHaveBeenCalledWith('1');
  });

  it('POST /approvals/:id rejects with reason', async () => {
    const res = await app.request('/api/approvals/2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'reject', reason: 'unsafe' }),
    });

    expect(res.status).toBe(200);
    expect(mockApprovalEngine.reject).toHaveBeenCalledWith('2', 'unsafe');
  });

  it('POST /approvals/:id returns 409 for duplicate response', async () => {
    // First response
    await app.request('/api/approvals/dup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'approve' }),
    });

    // Duplicate
    const res = await app.request('/api/approvals/dup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'approve' }),
    });

    expect(res.status).toBe(409);
  });

  it('POST /approvals/:id returns 400 for invalid response', async () => {
    const res = await app.request('/api/approvals/3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'maybe' }),
    });

    expect(res.status).toBe(400);
  });

  it('POST /approvals/:id edit requires editedAction', async () => {
    const res = await app.request('/api/approvals/4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: 'edit' }),
    });

    expect(res.status).toBe(400);
  });
});
