import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { WorkspaceManager } from './workspace-manager.js';
import { EventBus } from '../events/index.js';
import { DitLoopConfigSchema } from '../config/index.js';
import type { DitLoopConfig, SingleWorkspace, GroupWorkspace } from '../config/index.js';

describe('WorkspaceManager', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-wm-'));
    eventBus = new EventBus();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createRepo(name: string): string {
    const repoPath = join(tempDir, name);
    mkdirSync(repoPath, { recursive: true });
    mkdirSync(join(repoPath, '.git'));
    return repoPath;
  }

  function makeConfig(workspaces: (SingleWorkspace | GroupWorkspace)[]): DitLoopConfig {
    return DitLoopConfigSchema.parse({
      profiles: {},
      workspaces,
      defaults: { editor: '$EDITOR', aidf: true },
      server: { enabled: false, port: 9847, host: '127.0.0.1' },
    });
  }

  describe('single workspace', () => {
    it('loads a single workspace', () => {
      const projectPath = createRepo('my-project');
      const config = makeConfig([{
        type: 'single',
        name: 'My Project',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const list = manager.list();

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('my-project');
      expect(list[0].name).toBe('My Project');
      expect(list[0].type).toBe('single');
      expect(list[0].path).toBe(projectPath);
      expect(list[0].profile).toBe('personal');
    });

    it('creates a single project entry for single workspaces', () => {
      const projectPath = createRepo('solo');
      const config = makeConfig([{
        type: 'single',
        name: 'Solo',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const projects = manager.getProjects('solo');

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('Solo');
      expect(projects[0].path).toBe(projectPath);
    });
  });

  describe('group workspace', () => {
    it('loads a group workspace and discovers sub-projects', () => {
      createRepo('repo-a');
      createRepo('repo-b');
      mkdirSync(join(tempDir, 'not-a-repo'));

      const config = makeConfig([{
        type: 'group',
        name: 'Work Projects',
        path: tempDir,
        profile: 'work',
        aidf: true,
        autoDiscover: true,
        exclude: [],
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const ws = manager.get('work-projects');

      expect(ws).toBeDefined();
      expect(ws!.type).toBe('group');
      expect(ws!.projects).toHaveLength(2);
      expect(ws!.projects.map(p => p.name)).toEqual(['repo-a', 'repo-b']);
    });

    it('respects exclude in group workspace', () => {
      createRepo('keep');
      createRepo('skip');

      const config = makeConfig([{
        type: 'group',
        name: 'Filtered',
        path: tempDir,
        profile: 'work',
        aidf: true,
        autoDiscover: true,
        exclude: ['skip'],
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const projects = manager.getProjects('filtered');

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('keep');
    });

    it('returns empty projects when autoDiscover is false', () => {
      createRepo('repo-x');

      const config = makeConfig([{
        type: 'group',
        name: 'No Discover',
        path: tempDir,
        profile: 'work',
        aidf: true,
        autoDiscover: false,
        exclude: [],
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const projects = manager.getProjects('no-discover');

      expect(projects).toHaveLength(0);
    });
  });

  describe('get()', () => {
    it('returns undefined for unknown ID', () => {
      const config = makeConfig([]);
      const manager = new WorkspaceManager(config, eventBus);

      expect(manager.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getProjects()', () => {
    it('returns empty array for unknown workspace', () => {
      const config = makeConfig([]);
      const manager = new WorkspaceManager(config, eventBus);

      expect(manager.getProjects('unknown')).toEqual([]);
    });
  });

  describe('activate / deactivate', () => {
    it('emits workspace:activated on activate', () => {
      const projectPath = createRepo('activatable');
      const config = makeConfig([{
        type: 'single',
        name: 'Activatable',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const handler = vi.fn();
      eventBus.on('workspace:activated', handler);

      manager.activate('activatable');

      expect(handler).toHaveBeenCalledWith({
        id: 'activatable',
        name: 'Activatable',
        path: projectPath,
      });
    });

    it('getActive returns the activated workspace', () => {
      const projectPath = createRepo('active-ws');
      const config = makeConfig([{
        type: 'single',
        name: 'Active WS',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      expect(manager.getActive()).toBeNull();

      manager.activate('active-ws');
      const active = manager.getActive();

      expect(active).not.toBeNull();
      expect(active!.id).toBe('active-ws');
    });

    it('emits workspace:deactivated when switching workspaces', () => {
      const pathA = createRepo('ws-a');
      const pathB = createRepo('ws-b');
      const config = makeConfig([
        { type: 'single', name: 'WS A', path: pathA, profile: 'personal', aidf: true },
        { type: 'single', name: 'WS B', path: pathB, profile: 'personal', aidf: true },
      ]);

      const manager = new WorkspaceManager(config, eventBus);
      const deactivateHandler = vi.fn();
      eventBus.on('workspace:deactivated', deactivateHandler);

      manager.activate('ws-a');
      manager.activate('ws-b');

      expect(deactivateHandler).toHaveBeenCalledWith({ id: 'ws-a' });
    });

    it('does not emit deactivated when activating the same workspace', () => {
      const projectPath = createRepo('same-ws');
      const config = makeConfig([{
        type: 'single',
        name: 'Same WS',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const deactivateHandler = vi.fn();
      eventBus.on('workspace:deactivated', deactivateHandler);

      manager.activate('same-ws');
      manager.activate('same-ws');

      expect(deactivateHandler).not.toHaveBeenCalled();
    });

    it('emits workspace:error when activating non-existent workspace', () => {
      const config = makeConfig([]);
      const manager = new WorkspaceManager(config, eventBus);
      const errorHandler = vi.fn();
      eventBus.on('workspace:error', errorHandler);

      manager.activate('ghost');

      expect(errorHandler).toHaveBeenCalledWith({
        id: 'ghost',
        error: 'Workspace "ghost" not found',
      });
    });
  });

  describe('tilde expansion', () => {
    it('expands ~ to home directory in single workspace path', () => {
      const config = makeConfig([{
        type: 'single',
        name: 'Tilde Single',
        path: '~/some/project',
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const ws = manager.get('tilde-single');

      expect(ws).toBeDefined();
      expect(ws!.path).toBe(join(homedir(), 'some/project'));
      expect(ws!.projects[0].path).toBe(join(homedir(), 'some/project'));
    });

    it('expands ~ to home directory in group workspace path', () => {
      const config = makeConfig([{
        type: 'group',
        name: 'Tilde Group',
        path: '~/work/projects',
        profile: 'work',
        aidf: true,
        autoDiscover: false,
        exclude: [],
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const ws = manager.get('tilde-group');

      expect(ws).toBeDefined();
      expect(ws!.path).toBe(join(homedir(), 'work/projects'));
    });

    it('does not modify paths without tilde', () => {
      const projectPath = createRepo('no-tilde');
      const config = makeConfig([{
        type: 'single',
        name: 'No Tilde',
        path: projectPath,
        profile: 'personal',
        aidf: true,
      }]);

      const manager = new WorkspaceManager(config, eventBus);
      const ws = manager.get('no-tilde');

      expect(ws!.path).toBe(projectPath);
    });
  });

  describe('multiple workspaces', () => {
    it('loads mixed single and group workspaces', () => {
      const singlePath = createRepo('single-project');
      const groupDir = join(tempDir, 'group-dir');
      mkdirSync(groupDir);
      mkdirSync(join(groupDir, 'sub-a'));
      mkdirSync(join(groupDir, 'sub-a', '.git'));
      mkdirSync(join(groupDir, 'sub-b'));
      mkdirSync(join(groupDir, 'sub-b', '.git'));

      const config = makeConfig([
        { type: 'single', name: 'Single', path: singlePath, profile: 'personal', aidf: true },
        { type: 'group', name: 'Group', path: groupDir, profile: 'work', aidf: true, autoDiscover: true, exclude: [] },
      ]);

      const manager = new WorkspaceManager(config, eventBus);
      const list = manager.list();

      expect(list).toHaveLength(2);
      expect(list[0].type).toBe('single');
      expect(list[1].type).toBe('group');
      expect(list[1].projects).toHaveLength(2);
    });
  });
});
