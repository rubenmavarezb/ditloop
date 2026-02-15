import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Known AIDF sub-folders and files that can exist inside `.ai/`. */
const AIDF_FEATURES = ['tasks', 'roles', 'skills', 'plans', 'templates'] as const;

/** A single AIDF feature directory (e.g., tasks/, roles/). */
export type AidfFeature = (typeof AIDF_FEATURES)[number];

/** Describes what AIDF capabilities are present in a directory. */
export interface AidfCapabilities {
  /** Whether the `.ai/` folder exists at all. */
  present: boolean;
  /** Absolute path to the `.ai/` folder (even if not present). */
  aidfPath: string;
  /** Whether `AGENTS.md` exists in `.ai/`. */
  hasAgentsFile: boolean;
  /** Whether `config.yml` exists in `.ai/`. */
  hasConfig: boolean;
  /** Set of detected feature directories (tasks, roles, skills, plans, templates). */
  features: Set<AidfFeature>;
}

/**
 * Detect AIDF (`.ai/` folder) presence and capabilities in a directory.
 * Uses synchronous filesystem checks for speed — no deep scanning.
 */
export class AidfDetector {
  /**
   * Detect AIDF capabilities at the given directory path.
   *
   * @param dirPath - Absolute path to the project or group root directory
   * @returns Capabilities object describing what AIDF features are available
   */
  detect(dirPath: string): AidfCapabilities {
    const aidfPath = join(dirPath, '.ai');
    const present = existsSync(aidfPath);

    if (!present) {
      return {
        present: false,
        aidfPath,
        hasAgentsFile: false,
        hasConfig: false,
        features: new Set(),
      };
    }

    const hasAgentsFile = existsSync(join(aidfPath, 'AGENTS.md'));
    const hasConfig = existsSync(join(aidfPath, 'config.yml'));

    const features = new Set<AidfFeature>();
    for (const feature of AIDF_FEATURES) {
      if (existsSync(join(aidfPath, feature))) {
        features.add(feature);
      }
    }

    return {
      present,
      aidfPath,
      hasAgentsFile,
      hasConfig,
      features,
    };
  }

  /**
   * Check whether a directory has any AIDF setup at all.
   *
   * @param dirPath - Absolute path to the directory to check
   * @returns `true` if `.ai/` folder exists
   */
  hasAidf(dirPath: string): boolean {
    return existsSync(join(dirPath, '.ai'));
  }
}
