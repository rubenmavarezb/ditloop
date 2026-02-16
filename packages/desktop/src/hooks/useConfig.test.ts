import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConfig } from './useConfig.js';

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useConfig', () => {
  it('loads config on mount', async () => {
    mockInvoke.mockResolvedValueOnce({
      config: {
        profiles: {
          personal: { name: 'Test', email: 'test@example.com' },
        },
        workspaces: [
          { name: 'my-project', path: '/home/user/project', type: 'single', profile: 'personal', aidf: true },
        ],
      },
      configPath: '/home/user/.ditloop/config.yml',
      exists: true,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).not.toBeNull();
    expect(result.current.config!.profiles.personal.email).toBe('test@example.com');
    expect(result.current.config!.workspaces).toHaveLength(1);
    expect(result.current.configExists).toBe(true);
    expect(result.current.configPath).toBe('/home/user/.ditloop/config.yml');
    expect(result.current.error).toBeNull();
  });

  it('handles missing config file', async () => {
    mockInvoke.mockResolvedValueOnce({
      config: { profiles: {}, workspaces: [] },
      configPath: '/home/user/.ditloop/config.yml',
      exists: false,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.configExists).toBe(false);
    expect(result.current.config!.workspaces).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('handles invoke error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error: Permission denied');
    expect(result.current.config).toBeNull();
  });

  it('can reload config', async () => {
    mockInvoke
      .mockResolvedValueOnce({
        config: { profiles: {}, workspaces: [] },
        configPath: '/home/user/.ditloop/config.yml',
        exists: true,
      })
      .mockResolvedValueOnce({
        config: {
          profiles: { work: { name: 'Work', email: 'work@co.com' } },
          workspaces: [],
        },
        configPath: '/home/user/.ditloop/config.yml',
        exists: true,
      });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Object.keys(result.current.config!.profiles)).toHaveLength(0);

    await result.current.reload();

    await waitFor(() => {
      expect(Object.keys(result.current.config!.profiles)).toHaveLength(1);
    });
  });
});
