import matter from 'gray-matter';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Parsed AIDF skill from a `.ai/skills/<name>/SKILL.md` file. */
export interface AidfSkill {
  /** Skill directory name (e.g., "code-review"). */
  id: string;
  /** Skill name from frontmatter or first heading. */
  name: string;
  /** Skill description (body content). */
  description: string;
  /** Raw frontmatter data. */
  frontmatter: Record<string, unknown>;
  /** Absolute path to the SKILL.md file. */
  filePath: string;
}

/**
 * Load AIDF skill definitions from a skills directory.
 * Each skill lives in its own sub-folder with a SKILL.md file.
 */
export class SkillLoader {
  /**
   * Load all skills from a `.ai/skills/` directory.
   *
   * @param skillsDir - Absolute path to the skills directory
   * @returns Array of parsed skills
   */
  loadAll(skillsDir: string): AidfSkill[] {
    const entries = readdirSync(skillsDir, { withFileTypes: true });
    const skills: AidfSkill[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        skills.push(this.loadFile(skillFile, entry.name));
      }
    }

    return skills;
  }

  /**
   * Load a single skill from its SKILL.md file.
   *
   * @param filePath - Absolute path to the SKILL.md file
   * @param id - Skill directory name
   * @returns Parsed skill object
   */
  loadFile(filePath: string, id: string): AidfSkill {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const name = typeof frontmatter.name === 'string'
      ? frontmatter.name
      : this.extractName(content) ?? id;

    return {
      id,
      name,
      description: content.trim(),
      frontmatter,
      filePath,
    };
  }

  private extractName(content: string): string | undefined {
    const match = content.match(/^#{1,2}\s+(.+)$/m);
    return match ? match[1].trim() : undefined;
  }
}
