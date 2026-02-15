import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

/** Parsed AIDF task status. */
export type AidfTaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked' | 'unknown';

/** Parsed representation of an AIDF task markdown file. */
export interface AidfTask {
  /** File name without extension (e.g., "007-aidf-detector"). */
  id: string;
  /** Task title from the first heading or frontmatter. */
  title: string;
  /** Task status parsed from the Status line. */
  status: AidfTaskStatus;
  /** Goal section content. */
  goal: string;
  /** Scope section content. */
  scope: string;
  /** Requirements section content. */
  requirements: string;
  /** Definition of Done section content. */
  dod: string;
  /** Raw frontmatter data (if any). */
  frontmatter: Record<string, unknown>;
  /** Absolute path to the source file. */
  filePath: string;
}

const STATUS_MAP: Record<string, AidfTaskStatus> = {
  '⬜': 'pending',
  'pending': 'pending',
  '🔄': 'in-progress',
  'in-progress': 'in-progress',
  'in progress': 'in-progress',
  '✅': 'done',
  'done': 'done',
  'completed': 'done',
  '🚫': 'blocked',
  'blocked': 'blocked',
};

/**
 * Parse AIDF task markdown files from a tasks directory.
 */
export class TaskParser {
  /**
   * Parse all task files from a `.ai/tasks/` directory.
   *
   * @param tasksDir - Absolute path to the tasks directory
   * @returns Array of parsed tasks
   */
  parseAll(tasksDir: string): AidfTask[] {
    const files = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    return files.map(f => this.parseFile(join(tasksDir, f)));
  }

  /**
   * Parse a single task markdown file.
   *
   * @param filePath - Absolute path to the task `.md` file
   * @returns Parsed task object
   */
  parseFile(filePath: string): AidfTask {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const id = basename(filePath, '.md');
    const title = this.extractTitle(content, frontmatter);
    const status = this.extractStatus(content, frontmatter);

    return {
      id,
      title,
      status,
      goal: this.extractSection(content, 'Goal'),
      scope: this.extractSection(content, 'Scope'),
      requirements: this.extractSection(content, 'Requirements'),
      dod: this.extractSection(content, 'Definition of Done'),
      frontmatter,
      filePath,
    };
  }

  private extractTitle(content: string, frontmatter: Record<string, unknown>): string {
    if (typeof frontmatter.title === 'string') return frontmatter.title;

    // First H1 or H2 heading — strip "TASK:" prefix if present
    const match = content.match(/^#{1,2}\s+(?:TASK:\s*)?(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  private extractStatus(content: string, frontmatter: Record<string, unknown>): AidfTaskStatus {
    if (typeof frontmatter.status === 'string') {
      return STATUS_MAP[frontmatter.status.toLowerCase()] ?? 'unknown';
    }

    // Look for "## Status: <emoji|text>" pattern
    const match = content.match(/^#+\s*Status:\s*(.+)$/m);
    if (match) {
      const raw = match[1].trim().toLowerCase();
      for (const [key, value] of Object.entries(STATUS_MAP)) {
        if (raw.includes(key)) return value;
      }
    }

    return 'unknown';
  }

  private extractSection(content: string, heading: string): string {
    // Find the heading and its level, capture until next heading of same or higher level
    const headingRegex = new RegExp(`^(#{1,6})\\s+${heading}\\b[^\\n]*$`, 'm');
    const headingMatch = content.match(headingRegex);
    if (!headingMatch) return '';

    const level = headingMatch[1].length;
    const startIdx = headingMatch.index! + headingMatch[0].length;
    const rest = content.slice(startIdx);

    // Match until next heading of same or higher level (fewer or equal #'s)
    const endPattern = new RegExp(`^#{1,${level}}\\s`, 'm');
    const endMatch = rest.match(endPattern);
    const sectionContent = endMatch ? rest.slice(0, endMatch.index!) : rest;

    return sectionContent.trim();
  }
}
