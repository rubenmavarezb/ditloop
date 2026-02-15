import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { createProfileRoutes } from './profiles.js';

describe('profile routes', () => {
  const mockProfileManager = {
    list: vi.fn(),
    getCurrent: vi.fn(),
  } as any;

  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/api', createProfileRoutes({ profileManager: mockProfileManager }));
  });

  it('GET /profiles returns profile list', async () => {
    mockProfileManager.list.mockReturnValue({
      personal: { name: 'Ruben', email: 'ruben@test.com', platform: 'github' },
    });

    const res = await app.request('/api/profiles');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.profiles).toHaveLength(1);
    expect(json.profiles[0].key).toBe('personal');
    expect(json.profiles[0].email).toBe('ruben@test.com');
  });

  it('GET /profiles/current returns current email', async () => {
    mockProfileManager.getCurrent.mockResolvedValue('ruben@test.com');

    const res = await app.request('/api/profiles/current');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.email).toBe('ruben@test.com');
  });

  it('GET /profiles/current returns null when no identity', async () => {
    mockProfileManager.getCurrent.mockResolvedValue(undefined);

    const res = await app.request('/api/profiles/current');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.email).toBeNull();
  });
});
