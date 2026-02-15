import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { AidfDetector, type AidfCapabilities } from '../detector/index.js';
import { TaskParser, type AidfTask } from './task-parser.js';
import { RoleLoader, type AidfRole } from './role-loader.js';
import { SkillLoader, type AidfSkill } from './skill-loader.js';
import { PlanParser, type AidfPlan } from './plan-parser.js';

/** Complete AIDF context loaded from a single `.ai/` directory. */
export interface AidfContext {
  /** Detection capabilities for this directory. */
  capabilities: AidfCapabilities;
  /** Content of AGENTS.md (if present). */
  agentsContent: string | undefined;
  /** Parsed tasks from `.ai/tasks/`. */
  tasks: AidfTask[];
  /** Parsed roles from `.ai/roles/`. */
  roles: AidfRole[];
  /** Parsed skills from `.ai/skills/`. */
  skills: AidfSkill[];
  /** Parsed plans from `.ai/plans/`. */
  plans: AidfPlan[];
}

/**
 * Load all AIDF context from a directory's `.ai/` folder.
 * Orchestrates the detector and individual parsers/loaders.
 */
export class ContextLoader {
  private detector: AidfDetector;
  private taskParser: TaskParser;
  private roleLoader: RoleLoader;
  private skillLoader: SkillLoader;
  private planParser: PlanParser;

  constructor() {
    this.detector = new AidfDetector();
    this.taskParser = new TaskParser();
    this.roleLoader = new RoleLoader();
    this.skillLoader = new SkillLoader();
    this.planParser = new PlanParser();
  }

  /**
   * Load the full AIDF context from a directory.
   * Returns empty collections for any features not present.
   *
   * @param dirPath - Absolute path to the directory containing `.ai/`
   * @returns Complete AIDF context for this directory
   */
  load(dirPath: string): AidfContext {
    const capabilities = this.detector.detect(dirPath);

    if (!capabilities.present) {
      return {
        capabilities,
        agentsContent: undefined,
        tasks: [],
        roles: [],
        skills: [],
        plans: [],
      };
    }

    const aidfPath = capabilities.aidfPath;

    const agentsContent = capabilities.hasAgentsFile
      ? readFileSync(join(aidfPath, 'AGENTS.md'), 'utf-8')
      : undefined;

    const tasks = capabilities.features.has('tasks')
      ? this.taskParser.parseAll(join(aidfPath, 'tasks'))
      : [];

    const roles = capabilities.features.has('roles')
      ? this.roleLoader.loadAll(join(aidfPath, 'roles'))
      : [];

    const skills = capabilities.features.has('skills')
      ? this.skillLoader.loadAll(join(aidfPath, 'skills'))
      : [];

    const plans = capabilities.features.has('plans')
      ? this.planParser.parseAll(join(aidfPath, 'plans'))
      : [];

    return {
      capabilities,
      agentsContent,
      tasks,
      roles,
      skills,
      plans,
    };
  }
}
