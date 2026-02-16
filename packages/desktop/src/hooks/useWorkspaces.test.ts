import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkspaces } from './useWorkspaces.js';

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  vi.clearAllMocks();
});

const MOCK_CONFIG = {
  config: {
    profiles: {
      personal: { name: 'Test', email: 'test@example.com', sshHost: 'github-personal' },
      work: { name: 'Work', email: 'work@co.com' },
    },
    workspaces: [
      { name: 'My Project', path: '/home/user/my-project', type: 'single', profile: 'personal', aidf: true },
      { name: 'Work App', path: '/home/user/work/app', type: 'group', profile: 'work', aidf: false },
    ],
  },
  configPath: '/home/user/.ditloop/config.yml',
  exists: true,
};

describe('useWorkspaces', () => {
  it('resolves workspaces from config', async () => {
    mockInvoke.mockResolvedValueOnce(MOCK_CONFIG);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces).toHaveLength(2);

    const [ws1, ws2] = result.current.workspaces;
    expect(ws1.name).toBe('My Project');
    expect(ws1.type).toBe('single');
    expect(ws1.aidf).toBe(true);
    expect(ws2.name).toBe('Work App');
    expect(ws2.type).toBe('group');
  });

  it('generates slugified IDs', async () => {
    mockInvoke.mockResolvedValueOnce(MOCK_CONFIG);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces[0].id).toBe('my-project');
    expect(result.current.workspaces[1].id).toBe('work-app');
  });

  it('resolves profile config for each workspace', async () => {
    mockInvoke.mockResolvedValueOnce(MOCK_CONFIG);

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces[0].profileConfig?.email).toBe('test@example.com');
    expect(result.current.workspaces[0].profileConfig?.sshHost).toBe('github-personal');
    expect(result.current.workspaces[1].profileConfig?.email).toBe('work@co.com');
  });

  it('preserves full paths (tilde expanded by Rust)', async () => {
    mockInvoke.mockResolvedValueOnce({
      ...MOCK_CONFIG,
      config: {
        ...MOCK_CONFIG.config,
        workspaces: [
          { name: 'test', path: '/Users/ruben/projects/test', type: 'single', profile: 'personal', aidf: false },
        ],
      },
    });

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces[0].path).toBe('/Users/ruben/projects/test');
  });

  it('returns empty array when no config', async () => {
    mockInvoke.mockResolvedValueOnce({
      config: { profiles: {}, workspaces: [] },
      configPath: '/home/user/.ditloop/config.yml',
      exists: false,
    });

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces).toHaveLength(0);
    expect(result.current.configExists).toBe(false);
  });

  it('handles undefined profile gracefully', async () => {
    mockInvoke.mockResolvedValueOnce({
      config: {
        profiles: {},
        workspaces: [
          { name: 'orphan', path: '/tmp/orphan', type: 'single', profile: 'nonexistent', aidf: false },
        ],
      },
      configPath: '/home/user/.ditloop/config.yml',
      exists: true,
    });

    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces[0].profileConfig).toBeUndefined();
    expect(result.current.workspaces[0].profile).toBe('nonexistent');
  });
});
