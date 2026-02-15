import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { loadConfig } from './config/index.js';
import { WorkspaceManager } from './workspace/index.js';
import { EventBus } from './events/index.js';
import { AidfDetector } from './aidf/detector/index.js';
import { ContextLoader } from './aidf/context-loader/index.js';
import { ContextMerger } from './aidf/context-loader/context-merger.js';
import type { DitLoopConfig, SingleWorkspace, GroupWorkspace } from './config/index.js';

describe('Integration: Config → Workspaces → AIDF', () => {
  let tempDir: string;
  let eventBus: EventBus;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-integration-'));
    eventBus = new EventBus();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createRepo(base: string, name: string): string {
    const repoPath = join(base, name);
    mkdirSync(repoPath, { recursive: true });
    mkdirSync(join(repoPath, '.git'));
    return repoPath;
  }

  function createAidfFolder(repoPath: string, options: {
    agentsContent?: string;
    tasks?: Array<{ id: string; title: string; status: string; goal: string }>;
    roles?: Array<{ id: string; name: string; description: string }>;
  } = {}): string {
    const aiPath = join(repoPath, '.ai');
    mkdirSync(aiPath, { recursive: true });

    if (options.agentsContent) {
      writeFileSync(join(aiPath, 'AGENTS.md'), options.agentsContent);
    }

    if (options.tasks && options.tasks.length > 0) {
      const tasksDir = join(aiPath, 'tasks');
      mkdirSync(tasksDir);
      for (const task of options.tasks) {
        writeFileSync(
          join(tasksDir, `${task.id}.md`),
          `# TASK: ${task.title}\n\n## Goal\n${task.goal}\n\n## Status: ${task.status}\n`,
        );
      }
    }

    if (options.roles && options.roles.length > 0) {
      const rolesDir = join(aiPath, 'roles');
      mkdirSync(rolesDir);
      for (const role of options.roles) {
        writeFileSync(
          join(rolesDir, `${role.id}.md`),
          `# ${role.name}\n\n${role.description}\n`,
        );
      }
    }

    return aiPath;
  }

  function makeConfig(
    workspaces: (SingleWorkspace | GroupWorkspace)[],
    profiles: DitLoopConfig['profiles'] = {},
  ): DitLoopConfig {
    return {
      profiles,
      workspaces,
      defaults: { editor: '$EDITOR', aidf: true },
      server: { enabled: false, port: 9847, host: '127.0.0.1' },
    };
  }

  describe('config loads and workspaces resolve', () => {
    it('loads config from YAML and resolves workspaces with AIDF', () => {
      // Create realistic structure: 1 single + 1 group with 2 sub-projects
      const singlePath = createRepo(tempDir, 'ditloop');
      createAidfFolder(singlePath, {
        agentsContent: '# DitLoop Agent Context',
        tasks: [
          { id: '001', title: 'Setup project', status: '✅ Done', goal: 'Initialize the project' },
        ],
      });

      const groupDir = join(tempDir, 'pivotree');
      mkdirSync(groupDir, { recursive: true });
      const subA = createRepo(groupDir, 'project-alpha');
      createRepo(groupDir, 'project-beta');
      createAidfFolder(subA, {
        agentsContent: '# Project Alpha Agents',
        tasks: [
          { id: '010', title: 'Fix auth bug', status: '⬜ Pending', goal: 'Fix login flow' },
        ],
      });

      // Also add AIDF at group level
      createAidfFolder(groupDir, {
        agentsContent: '# Pivotree Group Agents',
        roles: [
          { id: 'reviewer', name: 'Code Reviewer', description: 'Reviews pull requests' },
        ],
      });

      const config = makeConfig(
        [
          { type: 'single', name: 'DitLoop', path: singlePath, profile: 'personal', aidf: true },
          { type: 'group', name: 'Pivotree', path: groupDir, profile: 'pivotree', aidf: true, autoDiscover: true, exclude: [] },
        ],
        {
          personal: { name: 'Ruben', email: 'ruben@personal.com', platform: 'github' },
          pivotree: { name: 'Ruben Mavarez', email: 'ruben@pivotree.com', platform: 'github', sshHost: 'github-work' },
        },
      );

      // 1. WorkspaceManager resolves all workspaces
      const manager = new WorkspaceManager(config, eventBus);
      const list = manager.list();

      expect(list).toHaveLength(2);

      // Single workspace
      const ditloop = manager.get('ditloop');
      expect(ditloop).toBeDefined();
      expect(ditloop!.type).toBe('single');
      expect(ditloop!.profile).toBe('personal');
      expect(ditloop!.projects).toHaveLength(1);

      // Group workspace
      const pivotree = manager.get('pivotree');
      expect(pivotree).toBeDefined();
      expect(pivotree!.type).toBe('group');
      expect(pivotree!.profile).toBe('pivotree');
      expect(pivotree!.projects).toHaveLength(2);
      expect(pivotree!.projects.map(p => p.name).sort()).toEqual(['project-alpha', 'project-beta']);

      // 2. AIDF detected on single workspace
      const detector = new AidfDetector();
      const singleAidf = detector.detect(singlePath);
      expect(singleAidf.present).toBe(true);
      expect(singleAidf.hasAgentsFile).toBe(true);
      expect(singleAidf.features.has('tasks')).toBe(true);

      // 3. AIDF detected on group sub-project (project-alpha has it)
      const alphaAidf = detector.detect(subA);
      expect(alphaAidf.present).toBe(true);

      // 4. AIDF NOT present on project-beta
      const betaAidf = detector.detect(join(groupDir, 'project-beta'));
      expect(betaAidf.present).toBe(false);

      // 5. Profiles assigned correctly
      expect(config.profiles[ditloop!.profile]).toBeDefined();
      expect(config.profiles[ditloop!.profile].email).toBe('ruben@personal.com');
      expect(config.profiles[pivotree!.profile]).toBeDefined();
      expect(config.profiles[pivotree!.profile].email).toBe('ruben@pivotree.com');
    });
  });

  describe('AIDF context loading and merging', () => {
    it('loads context from a workspace with full AIDF', () => {
      const repoPath = createRepo(tempDir, 'full-aidf');
      createAidfFolder(repoPath, {
        agentsContent: '# Full AIDF Agent',
        tasks: [
          { id: '001', title: 'Task One', status: '⬜ Pending', goal: 'Do something' },
          { id: '002', title: 'Task Two', status: '✅ Done', goal: 'Did it' },
        ],
        roles: [
          { id: 'dev', name: 'Developer', description: 'Writes code' },
        ],
      });

      const loader = new ContextLoader();
      const context = loader.load(repoPath);

      expect(context.capabilities.present).toBe(true);
      expect(context.agentsContent).toBe('# Full AIDF Agent');
      expect(context.tasks).toHaveLength(2);
      expect(context.tasks[0].title).toBe('Task One');
      expect(context.tasks[0].status).toBe('pending');
      expect(context.tasks[1].status).toBe('done');
      expect(context.roles).toHaveLength(1);
      expect(context.roles[0].name).toBe('Developer');
    });

    it('merges group + project AIDF contexts correctly', () => {
      // Group-level AIDF
      const groupDir = join(tempDir, 'group-merge');
      mkdirSync(groupDir, { recursive: true });
      createAidfFolder(groupDir, {
        agentsContent: '# Group-level context',
        tasks: [
          { id: 'shared-001', title: 'Group Task', status: '⬜ Pending', goal: 'Group goal' },
          { id: 'group-only', title: 'Group Only Task', status: '⬜ Pending', goal: 'Only in group' },
        ],
        roles: [
          { id: 'reviewer', name: 'Group Reviewer', description: 'Reviews at group level' },
        ],
      });

      // Project-level AIDF (overrides shared-001)
      const projectDir = createRepo(groupDir, 'project-x');
      createAidfFolder(projectDir, {
        agentsContent: '# Project-level context',
        tasks: [
          { id: 'shared-001', title: 'Project Override', status: '✅ Done', goal: 'Project goal wins' },
          { id: 'project-only', title: 'Project Only Task', status: '⬜ Pending', goal: 'Only in project' },
        ],
      });

      const loader = new ContextLoader();
      const groupContext = loader.load(groupDir);
      const projectContext = loader.load(projectDir);

      const merger = new ContextMerger();
      const merged = merger.merge(groupContext, projectContext);

      // Both contexts present
      expect(merged.hasGroupContext).toBe(true);
      expect(merged.hasProjectContext).toBe(true);

      // Agents content merged with separator
      expect(merged.agentsContent).toContain('Group-level context');
      expect(merged.agentsContent).toContain('Project-level context');
      expect(merged.agentsContent).toContain('---');

      // Tasks: project overrides shared ID, both exclusive tasks present
      expect(merged.tasks).toHaveLength(3);
      const sharedTask = merged.tasks.find(t => t.id === 'shared-001');
      expect(sharedTask?.title).toBe('Project Override');
      expect(sharedTask?.status).toBe('done');
      expect(merged.tasks.find(t => t.id === 'group-only')).toBeDefined();
      expect(merged.tasks.find(t => t.id === 'project-only')).toBeDefined();

      // Roles from group still present (project didn't override)
      expect(merged.roles).toHaveLength(1);
      expect(merged.roles[0].name).toBe('Group Reviewer');
    });

    it('handles workspace with no AIDF gracefully', () => {
      const repoPath = createRepo(tempDir, 'no-aidf');

      const loader = new ContextLoader();
      const context = loader.load(repoPath);

      expect(context.capabilities.present).toBe(false);
      expect(context.agentsContent).toBeUndefined();
      expect(context.tasks).toEqual([]);
      expect(context.roles).toEqual([]);
    });
  });

  describe('workspace activation events', () => {
    it('full flow: resolve → activate → switch → events', () => {
      const pathA = createRepo(tempDir, 'ws-a');
      const pathB = createRepo(tempDir, 'ws-b');

      const config = makeConfig([
        { type: 'single', name: 'WS A', path: pathA, profile: 'personal', aidf: true },
        { type: 'single', name: 'WS B', path: pathB, profile: 'work', aidf: true },
      ], {
        personal: { name: 'Ruben', email: 'ruben@personal.com', platform: 'github' },
        work: { name: 'Ruben Work', email: 'ruben@work.com', platform: 'github' },
      });

      const manager = new WorkspaceManager(config, eventBus);

      const activated: string[] = [];
      const deactivated: string[] = [];

      eventBus.on('workspace:activated', (payload) => activated.push(payload.id));
      eventBus.on('workspace:deactivated', (payload) => deactivated.push(payload.id));

      // Activate first workspace
      manager.activate('ws-a');
      expect(manager.getActive()?.id).toBe('ws-a');
      expect(activated).toEqual(['ws-a']);

      // Switch to second
      manager.activate('ws-b');
      expect(manager.getActive()?.id).toBe('ws-b');
      expect(activated).toEqual(['ws-a', 'ws-b']);
      expect(deactivated).toEqual(['ws-a']);

      // Verify profile assignment
      const activeWs = manager.getActive()!;
      expect(config.profiles[activeWs.profile].email).toBe('ruben@work.com');
    });
  });

  describe('config loading from YAML', () => {
    it('loads a complete config file', async () => {
      const configPath = join(tempDir, 'config.yml');
      writeFileSync(configPath, `
profiles:
  personal:
    name: Ruben
    email: ruben@personal.com
    platform: github
  pivotree:
    name: Ruben Mavarez
    email: ruben@pivotree.com
    platform: github
    sshHost: github-work

workspaces:
  - type: single
    name: DitLoop
    path: /tmp/ditloop
    profile: personal
  - type: group
    name: Pivotree
    path: /tmp/pivotree
    profile: pivotree
    autoDiscover: true

defaults:
  profile: personal
  editor: vim
  aidf: true

server:
  enabled: false
  port: 9847
`);

      const config = await loadConfig({ path: configPath });

      // Profiles loaded
      expect(Object.keys(config.profiles)).toHaveLength(2);
      expect(config.profiles.personal.email).toBe('ruben@personal.com');
      expect(config.profiles.pivotree.sshHost).toBe('github-work');

      // Workspaces loaded
      expect(config.workspaces).toHaveLength(2);
      expect(config.workspaces[0].type).toBe('single');
      expect(config.workspaces[0].name).toBe('DitLoop');
      expect(config.workspaces[1].type).toBe('group');

      // Defaults loaded
      expect(config.defaults.profile).toBe('personal');
      expect(config.defaults.editor).toBe('vim');
      expect(config.defaults.aidf).toBe(true);

      // Server loaded
      expect(config.server.enabled).toBe(false);
      expect(config.server.port).toBe(9847);
    });

    it('returns default config when file does not exist', async () => {
      const config = await loadConfig({ path: join(tempDir, 'nonexistent.yml') });

      expect(config.profiles).toEqual({});
      expect(config.workspaces).toEqual([]);
      expect(config.defaults.aidf).toBe(true);
    });
  });

  describe('full pipeline: config → workspace → AIDF → context', () => {
    it('processes a realistic workspace structure end-to-end', async () => {
      // Setup: create realistic filesystem
      const singlePath = createRepo(tempDir, 'my-project');
      createAidfFolder(singlePath, {
        agentsContent: '# My Project\nAI agent context for the project.',
        tasks: [
          { id: '001-setup', title: 'Initial Setup', status: '✅ Done', goal: 'Bootstrap the project' },
          { id: '002-feature', title: 'Add Feature', status: '⬜ Pending', goal: 'Implement the feature' },
        ],
      });

      const groupDir = join(tempDir, 'work-repos');
      mkdirSync(groupDir);
      const projectAlpha = createRepo(groupDir, 'alpha');
      const projectBeta = createRepo(groupDir, 'beta');
      createAidfFolder(projectAlpha, {
        agentsContent: '# Alpha Context',
        tasks: [
          { id: '010-auth', title: 'Fix Auth', status: '🔄 In Progress', goal: 'Fix authentication' },
        ],
      });
      // beta has no AIDF

      // Setup: create config
      const configPath = join(tempDir, 'config.yml');
      writeFileSync(configPath, `
profiles:
  personal:
    name: Ruben
    email: ruben@personal.com
    platform: github
  work:
    name: Ruben Work
    email: ruben@work.com
    platform: github
    sshHost: github-work

workspaces:
  - type: single
    name: My Project
    path: ${singlePath}
    profile: personal
  - type: group
    name: Work Repos
    path: ${groupDir}
    profile: work
    autoDiscover: true

defaults:
  profile: personal
  aidf: true
`);

      // Step 1: Load config
      const config = await loadConfig({ path: configPath });
      expect(config.workspaces).toHaveLength(2);

      // Step 2: Resolve workspaces
      const manager = new WorkspaceManager(config, eventBus);
      const workspaces = manager.list();
      expect(workspaces).toHaveLength(2);

      const single = manager.get('my-project')!;
      expect(single.profile).toBe('personal');

      const group = manager.get('work-repos')!;
      expect(group.projects).toHaveLength(2);

      // Step 3: Detect AIDF for each
      const detector = new AidfDetector();
      const loader = new ContextLoader();

      // Single workspace AIDF
      expect(detector.hasAidf(single.path)).toBe(true);
      const singleContext = loader.load(single.path);
      expect(singleContext.tasks).toHaveLength(2);
      expect(singleContext.tasks.find(t => t.id === '001-setup')?.status).toBe('done');
      expect(singleContext.tasks.find(t => t.id === '002-feature')?.status).toBe('pending');

      // Group sub-projects AIDF
      const alphaProject = group.projects.find(p => p.name === 'alpha')!;
      const betaProject = group.projects.find(p => p.name === 'beta')!;

      expect(detector.hasAidf(alphaProject.path)).toBe(true);
      expect(detector.hasAidf(betaProject.path)).toBe(false);

      const alphaContext = loader.load(alphaProject.path);
      expect(alphaContext.tasks).toHaveLength(1);
      expect(alphaContext.tasks[0].status).toBe('in-progress');

      const betaContext = loader.load(betaProject.path);
      expect(betaContext.capabilities.present).toBe(false);

      // Step 4: Verify profiles are assigned
      const personalProfile = config.profiles[single.profile];
      expect(personalProfile.email).toBe('ruben@personal.com');

      const workProfile = config.profiles[group.profile];
      expect(workProfile.email).toBe('ruben@work.com');
      expect(workProfile.sshHost).toBe('github-work');

      // Step 5: Activate workspace and verify events
      const activatedHandler = vi.fn();
      eventBus.on('workspace:activated', activatedHandler);

      manager.activate('my-project');
      expect(activatedHandler).toHaveBeenCalledWith({
        id: 'my-project',
        name: 'My Project',
        path: singlePath,
      });
    });
  });
});
