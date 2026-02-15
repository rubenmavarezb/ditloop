import { describe, it, expect } from 'vitest';
import { ContextMerger, type MergedAidfContext } from './context-merger.js';
import type { AidfContext } from './context-loader.js';
import type { AidfCapabilities } from '../detector/index.js';

describe('ContextMerger', () => {
  const merger = new ContextMerger();

  function makeCapabilities(present: boolean): AidfCapabilities {
    return {
      present,
      aidfPath: '/fake/.ai',
      hasAgentsFile: present,
      hasConfig: false,
      features: new Set(),
    };
  }

  function makeContext(overrides: Partial<AidfContext> = {}): AidfContext {
    return {
      capabilities: makeCapabilities(true),
      agentsContent: undefined,
      tasks: [],
      roles: [],
      skills: [],
      plans: [],
      ...overrides,
    };
  }

  it('returns empty context when both are undefined', () => {
    const result = merger.merge(undefined, undefined);

    expect(result.hasGroupContext).toBe(false);
    expect(result.hasProjectContext).toBe(false);
    expect(result.tasks).toEqual([]);
    expect(result.roles).toEqual([]);
  });

  it('returns project context when group is undefined', () => {
    const project = makeContext({
      agentsContent: 'Project agents',
      tasks: [{ id: '001', title: 'Task 1', status: 'pending', goal: '', scope: '', requirements: '', dod: '', frontmatter: {}, filePath: '/p/001.md' }],
    });

    const result = merger.merge(undefined, project);

    expect(result.hasGroupContext).toBe(false);
    expect(result.hasProjectContext).toBe(true);
    expect(result.agentsContent).toBe('Project agents');
    expect(result.tasks).toHaveLength(1);
  });

  it('returns group context when project is undefined', () => {
    const group = makeContext({
      agentsContent: 'Group agents',
      roles: [{ id: 'dev', name: 'Developer', description: 'Writes code', frontmatter: {}, filePath: '/g/dev.md' }],
    });

    const result = merger.merge(group, undefined);

    expect(result.hasGroupContext).toBe(true);
    expect(result.hasProjectContext).toBe(false);
    expect(result.agentsContent).toBe('Group agents');
    expect(result.roles).toHaveLength(1);
  });

  it('merges agents content with separator', () => {
    const group = makeContext({ agentsContent: 'Group context' });
    const project = makeContext({ agentsContent: 'Project context' });

    const result = merger.merge(group, project);

    expect(result.agentsContent).toBe('Group context\n\n---\n\nProject context');
  });

  it('project tasks override group tasks with same ID', () => {
    const group = makeContext({
      tasks: [
        { id: '001', title: 'Group Task', status: 'pending', goal: 'G', scope: '', requirements: '', dod: '', frontmatter: {}, filePath: '/g/001.md' },
        { id: '002', title: 'Group Only', status: 'done', goal: '', scope: '', requirements: '', dod: '', frontmatter: {}, filePath: '/g/002.md' },
      ],
    });
    const project = makeContext({
      tasks: [
        { id: '001', title: 'Project Task', status: 'in-progress', goal: 'P', scope: '', requirements: '', dod: '', frontmatter: {}, filePath: '/p/001.md' },
        { id: '003', title: 'Project Only', status: 'pending', goal: '', scope: '', requirements: '', dod: '', frontmatter: {}, filePath: '/p/003.md' },
      ],
    });

    const result = merger.merge(group, project);

    expect(result.tasks).toHaveLength(3);
    const task001 = result.tasks.find(t => t.id === '001');
    expect(task001?.title).toBe('Project Task');
    expect(task001?.status).toBe('in-progress');
    expect(result.tasks.find(t => t.id === '002')?.title).toBe('Group Only');
    expect(result.tasks.find(t => t.id === '003')?.title).toBe('Project Only');
  });

  it('project roles override group roles with same ID', () => {
    const group = makeContext({
      roles: [{ id: 'dev', name: 'Group Dev', description: 'Group', frontmatter: {}, filePath: '/g/dev.md' }],
    });
    const project = makeContext({
      roles: [{ id: 'dev', name: 'Project Dev', description: 'Project', frontmatter: {}, filePath: '/p/dev.md' }],
    });

    const result = merger.merge(group, project);

    expect(result.roles).toHaveLength(1);
    expect(result.roles[0].name).toBe('Project Dev');
  });

  it('handles agents where only one side has content', () => {
    const group = makeContext({ agentsContent: 'Group only' });
    const project = makeContext({ agentsContent: undefined });

    const result = merger.merge(group, project);

    expect(result.agentsContent).toBe('Group only');
  });
});
