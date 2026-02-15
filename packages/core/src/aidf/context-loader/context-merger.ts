import type { AidfContext } from './context-loader.js';
import type { AidfTask } from './task-parser.js';
import type { AidfRole } from './role-loader.js';
import type { AidfSkill } from './skill-loader.js';
import type { AidfPlan } from './plan-parser.js';

/** Merged AIDF context from group + project layers. */
export interface MergedAidfContext {
  /** Merged AGENTS.md content (project appended to group). */
  agentsContent: string | undefined;
  /** Merged tasks (project overrides group on same ID). */
  tasks: AidfTask[];
  /** Merged roles (project overrides group on same ID). */
  roles: AidfRole[];
  /** Merged skills (project overrides group on same ID). */
  skills: AidfSkill[];
  /** Merged plans (project overrides group on same ID). */
  plans: AidfPlan[];
  /** Whether group-level context was available. */
  hasGroupContext: boolean;
  /** Whether project-level context was available. */
  hasProjectContext: boolean;
}

/**
 * Merge group-level and project-level AIDF contexts.
 * Project context always wins on ID conflicts.
 */
export class ContextMerger {
  /**
   * Merge group and project AIDF contexts into a single resolved context.
   * Project-level entries override group-level entries with the same ID.
   *
   * @param groupContext - AIDF context from the group/parent directory (or `undefined`)
   * @param projectContext - AIDF context from the project directory (or `undefined`)
   * @returns Merged context with project taking precedence
   */
  merge(
    groupContext: AidfContext | undefined,
    projectContext: AidfContext | undefined,
  ): MergedAidfContext {
    if (!groupContext && !projectContext) {
      return {
        agentsContent: undefined,
        tasks: [],
        roles: [],
        skills: [],
        plans: [],
        hasGroupContext: false,
        hasProjectContext: false,
      };
    }

    if (!groupContext) {
      return {
        agentsContent: projectContext!.agentsContent,
        tasks: projectContext!.tasks,
        roles: projectContext!.roles,
        skills: projectContext!.skills,
        plans: projectContext!.plans,
        hasGroupContext: false,
        hasProjectContext: true,
      };
    }

    if (!projectContext) {
      return {
        agentsContent: groupContext.agentsContent,
        tasks: groupContext.tasks,
        roles: groupContext.roles,
        skills: groupContext.skills,
        plans: groupContext.plans,
        hasGroupContext: true,
        hasProjectContext: false,
      };
    }

    // Both exist — merge with project winning
    const agentsContent = this.mergeAgents(
      groupContext.agentsContent,
      projectContext.agentsContent,
    );

    return {
      agentsContent,
      tasks: this.mergeById(groupContext.tasks, projectContext.tasks),
      roles: this.mergeById(groupContext.roles, projectContext.roles),
      skills: this.mergeById(groupContext.skills, projectContext.skills),
      plans: this.mergeById(groupContext.plans, projectContext.plans),
      hasGroupContext: true,
      hasProjectContext: true,
    };
  }

  private mergeAgents(
    group: string | undefined,
    project: string | undefined,
  ): string | undefined {
    if (!group && !project) return undefined;
    if (!group) return project;
    if (!project) return group;
    return `${group}\n\n---\n\n${project}`;
  }

  private mergeById<T extends { id: string }>(group: T[], project: T[]): T[] {
    const map = new Map<string, T>();

    for (const item of group) {
      map.set(item.id, item);
    }
    // Project wins on conflict
    for (const item of project) {
      map.set(item.id, item);
    }

    return Array.from(map.values());
  }
}
