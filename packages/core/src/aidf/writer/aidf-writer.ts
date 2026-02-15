import { writeFileSync, readFileSync, existsSync, unlinkSync, renameSync, mkdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import type { EventBus } from '../../events/index.js';

/** AIDF artifact type. */
export type AidfType = 'task' | 'role' | 'skill' | 'plan';

/** Options for creating an AIDF file. */
export interface AidfCreateOptions {
  /** Artifact type. */
  type: AidfType;
  /** File ID (used as filename without extension, e.g., "029-context-builder"). */
  id: string;
  /** Frontmatter data (optional). */
  frontmatter?: Record<string, unknown>;
  /** Markdown body content. */
  content: string;
  /** Workspace path (where .ai/ lives). */
  workspacePath: string;
}

/** Options for updating an AIDF file. */
export interface AidfUpdateOptions {
  /** Artifact type. */
  type: AidfType;
  /** File ID. */
  id: string;
  /** Updated frontmatter (merged with existing). */
  frontmatter?: Record<string, unknown>;
  /** Updated markdown body content. */
  content?: string;
  /** Workspace path. */
  workspacePath: string;
}

/** Options for deleting an AIDF file. */
export interface AidfDeleteOptions {
  /** Artifact type. */
  type: AidfType;
  /** File ID. */
  id: string;
  /** Workspace path. */
  workspacePath: string;
}

/** Zod schema for task frontmatter validation. */
const TaskFrontmatterSchema = z.object({
  title: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'done', 'blocked']).optional(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
}).passthrough();

/** Zod schema for role frontmatter validation. */
const RoleFrontmatterSchema = z.object({
  name: z.string().optional(),
}).passthrough();

/** Zod schema for skill frontmatter validation. */
const SkillFrontmatterSchema = z.object({
  name: z.string().optional(),
}).passthrough();

/** Zod schema for plan frontmatter validation. */
const PlanFrontmatterSchema = z.object({
  title: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

const FRONTMATTER_SCHEMAS: Record<AidfType, z.ZodSchema> = {
  task: TaskFrontmatterSchema,
  role: RoleFrontmatterSchema,
  skill: SkillFrontmatterSchema,
  plan: PlanFrontmatterSchema,
};

/**
 * Create, update, and delete AIDF files (tasks, roles, skills, plans)
 * with validation and event emission.
 */
export class AidfWriter {
  private eventBus?: EventBus;
  private workspace: string;

  /**
   * @param workspace - Workspace name for event emission
   * @param eventBus - Optional event bus
   */
  constructor(workspace: string, eventBus?: EventBus) {
    this.workspace = workspace;
    this.eventBus = eventBus;
  }

  /**
   * Create a new AIDF file.
   *
   * @param options - Create options
   * @returns Absolute path to the created file
   * @throws Error if file already exists or validation fails
   */
  create(options: AidfCreateOptions): string {
    const filePath = this.resolveFilePath(options.type, options.id, options.workspacePath);

    if (existsSync(filePath)) {
      throw new Error(`AIDF file already exists: ${filePath}`);
    }

    // Validate frontmatter
    if (options.frontmatter) {
      this.validateFrontmatter(options.type, options.frontmatter);
    }

    // Ensure directory exists
    mkdirSync(dirname(filePath), { recursive: true });

    // Write atomically
    const fileContent = this.serializeFile(options.frontmatter, options.content);
    this.atomicWrite(filePath, fileContent);

    this.eventBus?.emit('aidf:created', {
      workspace: this.workspace,
      type: options.type,
      id: options.id,
      filePath,
    });

    return filePath;
  }

  /**
   * Update an existing AIDF file.
   *
   * @param options - Update options
   * @returns Absolute path to the updated file
   * @throws Error if file does not exist or validation fails
   */
  update(options: AidfUpdateOptions): string {
    const filePath = this.resolveFilePath(options.type, options.id, options.workspacePath);

    if (!existsSync(filePath)) {
      throw new Error(`AIDF file not found: ${filePath}`);
    }

    // Read existing
    const raw = readFileSync(filePath, 'utf-8');
    const { data: existingFm, content: existingContent } = matter(raw);

    // Merge frontmatter
    const mergedFm = options.frontmatter
      ? { ...existingFm, ...options.frontmatter }
      : existingFm;

    // Validate
    if (Object.keys(mergedFm).length > 0) {
      this.validateFrontmatter(options.type, mergedFm);
    }

    const body = options.content ?? existingContent;
    const fileContent = this.serializeFile(
      Object.keys(mergedFm).length > 0 ? mergedFm : undefined,
      body,
    );

    this.atomicWrite(filePath, fileContent);

    this.eventBus?.emit('aidf:updated', {
      workspace: this.workspace,
      type: options.type,
      id: options.id,
      filePath,
    });

    return filePath;
  }

  /**
   * Delete an AIDF file.
   *
   * @param options - Delete options
   * @throws Error if file does not exist
   */
  delete(options: AidfDeleteOptions): void {
    const filePath = this.resolveFilePath(options.type, options.id, options.workspacePath);

    if (!existsSync(filePath)) {
      throw new Error(`AIDF file not found: ${filePath}`);
    }

    unlinkSync(filePath);

    this.eventBus?.emit('aidf:deleted', {
      workspace: this.workspace,
      type: options.type,
      id: options.id,
      filePath,
    });
  }

  /**
   * Check if an AIDF file exists.
   *
   * @param type - Artifact type
   * @param id - File ID
   * @param workspacePath - Workspace path
   * @returns True if the file exists
   */
  exists(type: AidfType, id: string, workspacePath: string): boolean {
    return existsSync(this.resolveFilePath(type, id, workspacePath));
  }

  /**
   * Read an AIDF file and return parsed frontmatter + content.
   *
   * @param type - Artifact type
   * @param id - File ID
   * @param workspacePath - Workspace path
   * @returns Parsed frontmatter and content, or undefined if not found
   */
  read(type: AidfType, id: string, workspacePath: string): { frontmatter: Record<string, unknown>; content: string } | undefined {
    const filePath = this.resolveFilePath(type, id, workspacePath);
    if (!existsSync(filePath)) return undefined;

    const raw = readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return { frontmatter: data, content: content.trim() };
  }

  private resolveFilePath(type: AidfType, id: string, workspacePath: string): string {
    const dirMap: Record<AidfType, string> = {
      task: 'tasks',
      role: 'roles',
      skill: 'skills',
      plan: 'plans',
    };
    return join(workspacePath, '.ai', dirMap[type], `${id}.md`);
  }

  private validateFrontmatter(type: AidfType, frontmatter: Record<string, unknown>): void {
    const schema = FRONTMATTER_SCHEMAS[type];
    const result = schema.safeParse(frontmatter);
    if (!result.success) {
      throw new Error(`Invalid ${type} frontmatter: ${result.error.message}`);
    }
  }

  private serializeFile(frontmatter: Record<string, unknown> | undefined, content: string): string {
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      return matter.stringify(content.trim() + '\n', frontmatter);
    }
    return content.trim() + '\n';
  }

  /**
   * Write atomically: write to temp file, then rename.
   */
  private atomicWrite(filePath: string, content: string): void {
    const tmpPath = `${filePath}.tmp`;
    writeFileSync(tmpPath, content, 'utf-8');
    renameSync(tmpPath, filePath);
  }
}
