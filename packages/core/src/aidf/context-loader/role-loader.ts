import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

/** Parsed AIDF role from a `.ai/roles/*.md` file. */
export interface AidfRole {
  /** File name without extension (e.g., "architect"). */
  id: string;
  /** Role name from frontmatter or first heading. */
  name: string;
  /** Role description (body content). */
  description: string;
  /** Raw frontmatter data. */
  frontmatter: Record<string, unknown>;
  /** Absolute path to the source file. */
  filePath: string;
}

/**
 * Load AIDF role definitions from a roles directory.
 */
export class RoleLoader {
  /**
   * Load all roles from a `.ai/roles/` directory.
   *
   * @param rolesDir - Absolute path to the roles directory
   * @returns Array of parsed roles
   */
  loadAll(rolesDir: string): AidfRole[] {
    const files = readdirSync(rolesDir).filter(f => f.endsWith('.md'));
    return files.map(f => this.loadFile(join(rolesDir, f)));
  }

  /**
   * Load a single role markdown file.
   *
   * @param filePath - Absolute path to the role `.md` file
   * @returns Parsed role object
   */
  loadFile(filePath: string): AidfRole {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const id = basename(filePath, '.md');
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
