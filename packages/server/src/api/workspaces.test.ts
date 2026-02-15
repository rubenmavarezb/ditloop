import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createWorkspaceRoutes } from './workspaces.js';

describe('workspace routes', () => {
  const mockWorkspaceManager = {
    list: vi.fn(),
    get: vi.fn(),
  } as any;

  const mockContextLoader = {
    load: vi.fn(),
  } as any;

  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/api', createWorkspaceRoutes({
      workspaceManager: mockWorkspaceManager,
      contextLoader: mockContextLoader,
    }));
  });

  it('GET /workspaces returns workspace list', async () => {
    mockWorkspaceManager.list.mockReturnValue([
      {
        id: 'test',
        name: 'Test',
        type: 'single',
        path: '/tmp/test',
        profile: 'personal',
        aidf: true,
        projects: [{ id: 'test', name: 'Test', path: '/tmp/test' }],
      },
    ]);

    const res = await app.request('/api/workspaces');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.workspaces).toHaveLength(1);
    expect(json.workspaces[0].id).toBe('test');
    expect(json.workspaces[0].projectCount).toBe(1);
  });

  it('GET /workspaces/:id returns 404 for unknown workspace', async () => {
    mockWorkspaceManager.get.mockReturnValue(undefined);

    const res = await app.request('/api/workspaces/unknown');
    expect(res.status).toBe(404);
  });

  it('GET /workspaces/:id returns workspace detail', async () => {
    mockWorkspaceManager.get.mockReturnValue({
      id: 'test',
      name: 'Test',
      type: 'single',
      path: '/tmp/test',
      profile: 'personal',
      aidf: true,
      projects: [],
    });

    const res = await app.request('/api/workspaces/test');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe('test');
    expect(json.name).toBe('Test');
  });

  it('GET /workspaces/:id/aidf returns AIDF context', async () => {
    mockWorkspaceManager.get.mockReturnValue({
      id: 'test',
      name: 'Test',
      path: '/tmp/test',
      aidf: true,
    });

    mockContextLoader.load.mockReturnValue({
      capabilities: {
        present: true,
        features: new Set(['tasks', 'roles']),
        hasAgentsFile: true,
      },
      tasks: [{ id: '001', title: 'Setup' }],
      roles: [],
      skills: [],
      plans: [],
    });

    const res = await app.request('/api/workspaces/test/aidf');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.tasks).toHaveLength(1);
    expect(json.capabilities.present).toBe(true);
  });

  it('GET /workspaces/:id/aidf returns 400 when AIDF disabled', async () => {
    mockWorkspaceManager.get.mockReturnValue({
      id: 'test',
      name: 'Test',
      path: '/tmp/test',
      aidf: false,
    });

    const res = await app.request('/api/workspaces/test/aidf');
    expect(res.status).toBe(400);
  });
});
