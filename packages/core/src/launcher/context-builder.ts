import { writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { ContextLoader, type AidfContext } from '../aidf/context-loader/index.js';
import type { AidfTask } from '../aidf/context-loader/task-parser.js';
import type { AidfRole } from '../aidf/context-loader/role-loader.js';
import type { AidfSkill } from '../aidf/context-loader/skill-loader.js';
import { GitStatusReader, type GitStatus } from '../git/git-status-reader.js';
import type { EventBus } from '../events/index.js';

/** Options for building context. */
export interface ContextBuildOptions {
  /** Absolute path to the workspace root. */
  workspacePath: string;
  /** Workspace display name. */
  workspaceName?: string;
  /** AIDF task ID to focus on. */
  taskId?: string;
  /** AIDF role ID to use. */
  roleId?: string;
  /** Maximum total context size in characters. */
  maxSize?: number;
  /** Include git status information. */
  includeGit?: boolean;
  /** Include directory structure. */
  includeStructure?: boolean;
}

/** A named section of the built context. */
interface ContextSection {
  name: string;
  priority: number;
  content: string;
}

/** Default maximum context size (8000 characters). */
const DEFAULT_MAX_SIZE = 8000;

/**
 * Assemble rich system prompts from workspace context (AIDF roles, tasks,
 * skills, git status, project structure) and output them as injectable
 * files or strings for AI CLI tools.
 */
export class ContextBuilder {
  private contextLoader: ContextLoader;
  private eventBus?: EventBus;

  /**
   * @param eventBus - Optional event bus for emitting launcher:context-built
   */
  constructor(eventBus?: EventBus) {
    this.contextLoader = new ContextLoader();
    this.eventBus = eventBus;
  }

  /**
   * Build context from workspace and AIDF data.
   *
   * @param options - Context build options
   * @returns Built context sections ready for output
   */
  async build(options: ContextBuildOptions): Promise<BuiltContext> {
    const {
      workspacePath,
      workspaceName,
      taskId,
      roleId,
      maxSize = DEFAULT_MAX_SIZE,
      includeGit = true,
      includeStructure = true,
    } = options;

    const sections: ContextSection[] = [];

    // 1. Project section (highest priority)
    sections.push({
      name: 'project',
      priority: 1,
      content: this.buildProjectSection(workspacePath, workspaceName),
    });

    // 2. Load AIDF context
    const aidfContext = this.contextLoader.load(workspacePath);

    // 3. Role section
    if (roleId && aidfContext.roles.length > 0) {
      const role = aidfContext.roles.find(r => r.id === roleId);
      if (role) {
        sections.push({
          name: 'role',
          priority: 2,
          content: this.buildRoleSection(role),
        });
      }
    }

    // 4. Task section
    if (taskId && aidfContext.tasks.length > 0) {
      const task = aidfContext.tasks.find(t => t.id === taskId);
      if (task) {
        sections.push({
          name: 'task',
          priority: 3,
          content: this.buildTaskSection(task),
        });
      }
    }

    // 5. Git section
    if (includeGit) {
      try {
        const gitReader = new GitStatusReader({
          repoPath: workspacePath,
          workspace: workspaceName ?? basename(workspacePath),
        });
        const gitStatus = await gitReader.getStatus();
        sections.push({
          name: 'git',
          priority: 4,
          content: this.buildGitSection(gitStatus),
        });
      } catch {
        // Git not available — skip section
      }
    }

    // 6. Skills section
    if (aidfContext.skills.length > 0) {
      sections.push({
        name: 'skills',
        priority: 5,
        content: this.buildSkillsSection(aidfContext.skills),
      });
    }

    // 7. Structure section (lowest priority)
    if (includeStructure) {
      sections.push({
        name: 'structure',
        priority: 6,
        content: this.buildStructureSection(workspacePath),
      });
    }

    // Apply truncation if needed
    const truncated = this.truncate(sections, maxSize);

    const result = new BuiltContext(truncated);

    if (this.eventBus) {
      this.eventBus.emit('launcher:context-built', {
        workspace: workspaceName ?? basename(workspacePath),
        sections: truncated.map(s => s.name),
        totalSize: result.size,
      });
    }

    return result;
  }

  private buildProjectSection(workspacePath: string, name?: string): string {
    const projectName = name ?? basename(workspacePath);
    return [
      '## Project',
      '',
      `- **Name**: ${projectName}`,
      `- **Path**: ${workspacePath}`,
    ].join('\n');
  }

  private buildRoleSection(role: AidfRole): string {
    return [
      '## Role',
      '',
      `**${role.name}**`,
      '',
      role.description,
    ].join('\n');
  }

  private buildTaskSection(task: AidfTask): string {
    const lines = [
      '## Current Task',
      '',
      `**${task.title}** (${task.status})`,
      '',
    ];

    if (task.goal) {
      lines.push('### Goal', '', task.goal, '');
    }
    if (task.scope) {
      lines.push('### Scope', '', task.scope, '');
    }
    if (task.requirements) {
      lines.push('### Requirements', '', task.requirements, '');
    }
    if (task.dod) {
      lines.push('### Definition of Done', '', task.dod, '');
    }

    return lines.join('\n');
  }

  private buildGitSection(status: GitStatus): string {
    const lines = [
      '## Git Status',
      '',
      `- **Branch**: ${status.currentBranch}`,
    ];

    if (status.tracking) {
      lines.push(`- **Tracking**: ${status.tracking}`);
      if (status.ahead > 0) lines.push(`- **Ahead**: ${status.ahead}`);
      if (status.behind > 0) lines.push(`- **Behind**: ${status.behind}`);
    }

    if (status.isDirty) {
      lines.push(`- **Staged**: ${status.staged.length} files`);
      lines.push(`- **Modified**: ${status.unstaged.length} files`);
      lines.push(`- **Untracked**: ${status.untracked.length} files`);
    } else {
      lines.push('- **Status**: Clean');
    }

    return lines.join('\n');
  }

  private buildSkillsSection(skills: AidfSkill[]): string {
    const lines = ['## Available Skills', ''];
    for (const skill of skills) {
      lines.push(`- **${skill.name}**: ${skill.description.slice(0, 100)}`);
    }
    return lines.join('\n');
  }

  private buildStructureSection(workspacePath: string): string {
    const lines = ['## Project Structure', '', '```'];
    try {
      const entries = readdirSync(workspacePath);
      const relevant = entries
        .filter(e => !e.startsWith('.') || e === '.ai')
        .sort()
        .slice(0, 30);
      for (const entry of relevant) {
        try {
          const stat = statSync(join(workspacePath, entry));
          lines.push(stat.isDirectory() ? `${entry}/` : entry);
        } catch {
          lines.push(entry);
        }
      }
    } catch {
      lines.push('(unable to read directory)');
    }
    lines.push('```');
    return lines.join('\n');
  }

  /**
   * Truncate sections by removing lowest-priority sections first until
   * total size is under the limit.
   */
  private truncate(sections: ContextSection[], maxSize: number): ContextSection[] {
    const totalSize = sections.reduce((sum, s) => sum + s.content.length, 0);
    if (totalSize <= maxSize) return sections;

    // Sort by priority descending (highest number = lowest priority = remove first)
    const sorted = [...sections].sort((a, b) => b.priority - a.priority);
    const result = [...sections];
    let currentSize = totalSize;

    for (const section of sorted) {
      if (currentSize <= maxSize) break;
      const idx = result.findIndex(s => s.name === section.name);
      if (idx !== -1) {
        currentSize -= result[idx].content.length;
        result.splice(idx, 1);
      }
    }

    return result;
  }
}

/**
 * Built context ready for output in multiple formats.
 */
export class BuiltContext {
  private sections: ContextSection[];

  constructor(sections: ContextSection[]) {
    this.sections = sections;
  }

  /** Total size in characters. */
  get size(): number {
    return this.sections.reduce((sum, s) => sum + s.content.length, 0);
  }

  /** Names of included sections. */
  get sectionNames(): string[] {
    return this.sections.map(s => s.name);
  }

  /**
   * Render as markdown suitable for CLAUDE.md injection.
   *
   * @returns Markdown string
   */
  toMarkdown(): string {
    const header = '# DitLoop Context\n\n> Auto-generated by DitLoop. Do not edit manually.\n';
    const body = this.sections.map(s => s.content).join('\n\n---\n\n');
    return `${header}\n${body}\n`;
  }

  /**
   * Render as a system prompt string.
   *
   * @returns Plain-text system prompt
   */
  toSystemPrompt(): string {
    return this.sections.map(s => s.content).join('\n\n');
  }

  /**
   * Write the markdown context to a file.
   *
   * @param filePath - Absolute path to write to
   */
  toFile(filePath: string): void {
    writeFileSync(filePath, this.toMarkdown(), 'utf-8');
  }
}
