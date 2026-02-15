import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileManager } from './profile-manager.js';
import { EventBus } from '../events/index.js';
import type { DitLoopConfig } from '../config/index.js';

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
}));

vi.mock('./ssh-agent.js', () => ({
  SSHAgent: vi.fn().mockImplementation(() => ({
    loadKey: vi.fn().mockResolvedValue(undefined),
    clearAgent: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { execa } from 'execa';

const mockedExeca = vi.mocked(execa);

function createTestConfig(overrides?: Partial<DitLoopConfig>): DitLoopConfig {
  return {
    profiles: {
      personal: {
        name: 'Ruben',
        email: 'ruben@personal.com',
        platform: 'github',
      },
      work: {
        name: 'Ruben Work',
        email: 'ruben@work.com',
        sshHost: 'github-work',
        platform: 'github',
      },
    },
    workspaces: [],
    defaults: { editor: '$EDITOR', aidf: true },
    server: { enabled: false, port: 9847, host: '127.0.0.1' },
    ...overrides,
  };
}

describe('ProfileManager', () => {
  let manager: ProfileManager;
  let eventBus: EventBus;
  let config: DitLoopConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    config = createTestConfig();
    eventBus = new EventBus();
    manager = new ProfileManager(config, eventBus);
  });

  describe('list', () => {
    it('should return all profiles from config', () => {
      const profiles = manager.list();
      expect(Object.keys(profiles)).toEqual(['personal', 'work']);
      expect(profiles['personal']!.email).toBe('ruben@personal.com');
      expect(profiles['work']!.email).toBe('ruben@work.com');
    });

    it('should return empty record when no profiles configured', () => {
      const emptyManager = new ProfileManager(
        createTestConfig({ profiles: {} }),
        eventBus,
      );
      expect(emptyManager.list()).toEqual({});
    });
  });

  describe('get', () => {
    it('should return a specific profile by name', () => {
      const profile = manager.get('personal');
      expect(profile).toBeDefined();
      expect(profile!.email).toBe('ruben@personal.com');
    });

    it('should return undefined for non-existent profile', () => {
      expect(manager.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getCurrent', () => {
    it('should return current git user email', async () => {
      mockedExeca.mockResolvedValueOnce({
        stdout: 'ruben@personal.com',
      } as never);

      const email = await manager.getCurrent();
      expect(email).toBe('ruben@personal.com');
      expect(mockedExeca).toHaveBeenCalledWith('git', ['config', 'user.email']);
    });

    it('should return undefined when git config fails', async () => {
      mockedExeca.mockRejectedValueOnce(new Error('not in a git repo'));

      const email = await manager.getCurrent();
      expect(email).toBeUndefined();
    });

    it('should return undefined when git config returns empty string', async () => {
      mockedExeca.mockResolvedValueOnce({ stdout: '' } as never);

      const email = await manager.getCurrent();
      expect(email).toBeUndefined();
    });
  });

  describe('switchTo', () => {
    it('should set global git config when no repoPath provided', async () => {
      await manager.switchTo('personal');

      expect(mockedExeca).toHaveBeenCalledWith(
        'git',
        ['config', '--global', 'user.name', 'Ruben'],
        {},
      );
      expect(mockedExeca).toHaveBeenCalledWith(
        'git',
        ['config', '--global', 'user.email', 'ruben@personal.com'],
        {},
      );
    });

    it('should set local git config when repoPath provided', async () => {
      await manager.switchTo('personal', '/path/to/repo');

      expect(mockedExeca).toHaveBeenCalledWith(
        'git',
        ['config', '--local', 'user.name', 'Ruben'],
        { cwd: '/path/to/repo' },
      );
      expect(mockedExeca).toHaveBeenCalledWith(
        'git',
        ['config', '--local', 'user.email', 'ruben@personal.com'],
        { cwd: '/path/to/repo' },
      );
    });

    it('should load SSH key when profile has sshHost', async () => {
      const { SSHAgent } = await import('./ssh-agent.js');
      await manager.switchTo('work');

      // SSHAgent is mocked, verify loadKey was called
      const mockInstance = (SSHAgent as unknown as vi.Mock).mock.results[0]?.value;
      expect(mockInstance.loadKey).toHaveBeenCalledWith('~/.ssh/github-work');
    });

    it('should NOT load SSH key when profile has no sshHost', async () => {
      const { SSHAgent } = await import('./ssh-agent.js');
      await manager.switchTo('personal');

      const mockInstance = (SSHAgent as unknown as vi.Mock).mock.results[0]?.value;
      expect(mockInstance.loadKey).not.toHaveBeenCalled();
    });

    it('should emit profile:switched event', async () => {
      const handler = vi.fn();
      eventBus.on('profile:switched', handler);

      await manager.switchTo('work');

      expect(handler).toHaveBeenCalledWith({
        name: 'Ruben Work',
        email: 'ruben@work.com',
        sshHost: 'github-work',
      });
    });

    it('should throw when profile not found', async () => {
      await expect(manager.switchTo('nonexistent')).rejects.toThrow(
        'Profile "nonexistent" not found in config',
      );
    });
  });

  describe('resolveForWorkspace', () => {
    it('should return profile matching workspace profile name', () => {
      const profile = manager.resolveForWorkspace('personal');
      expect(profile).toBeDefined();
      expect(profile!.email).toBe('ruben@personal.com');
    });

    it('should return undefined for unknown workspace profile', () => {
      expect(manager.resolveForWorkspace('unknown')).toBeUndefined();
    });
  });
});
