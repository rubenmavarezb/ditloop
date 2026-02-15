import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

/** A reference to a task within a plan step. */
export interface PlanTaskRef {
  /** Task ID referenced (e.g., "007"). */
  taskId: string;
  /** Description from the plan step. */
  description: string;
}

/** A step/phase within a plan. */
export interface PlanStep {
  /** Step heading (e.g., "Step 1: AIDF Detector"). */
  title: string;
  /** Task references found in this step. */
  taskRefs: PlanTaskRef[];
  /** Raw step content. */
  content: string;
}

/** Parsed AIDF plan from a `.ai/plans/*.md` file. */
export interface AidfPlan {
  /** File name without extension (e.g., "PLAN-phase2-aidf"). */
  id: string;
  /** Plan title from frontmatter or first heading. */
  title: string;
  /** Overview section content. */
  overview: string;
  /** Parsed steps/phases. */
  steps: PlanStep[];
  /** Raw frontmatter data. */
  frontmatter: Record<string, unknown>;
  /** Absolute path to the source file. */
  filePath: string;
}

/**
 * Parse AIDF plan markdown files from a plans directory.
 */
export class PlanParser {
  /**
   * Parse all plan files from a `.ai/plans/` directory.
   *
   * @param plansDir - Absolute path to the plans directory
   * @returns Array of parsed plans
   */
  parseAll(plansDir: string): AidfPlan[] {
    const files = readdirSync(plansDir).filter(f => f.endsWith('.md'));
    return files.map(f => this.parseFile(join(plansDir, f)));
  }

  /**
   * Parse a single plan markdown file.
   *
   * @param filePath - Absolute path to the plan `.md` file
   * @returns Parsed plan object
   */
  parseFile(filePath: string): AidfPlan {
    const raw = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const id = basename(filePath, '.md');
    const title = typeof frontmatter.title === 'string'
      ? frontmatter.title
      : this.extractTitle(content) ?? id;

    return {
      id,
      title,
      overview: this.extractSection(content, 'Overview'),
      steps: this.extractSteps(content),
      frontmatter,
      filePath,
    };
  }

  private extractTitle(content: string): string | undefined {
    const match = content.match(/^#{1,2}\s+(?:PLAN:\s*)?(.+)$/m);
    return match ? match[1].trim() : undefined;
  }

  private extractSection(content: string, heading: string): string {
    const headingRegex = new RegExp(`^(#{1,6})\\s+${heading}\\b[^\\n]*$`, 'm');
    const headingMatch = content.match(headingRegex);
    if (!headingMatch) return '';

    const level = headingMatch[1].length;
    const startIdx = headingMatch.index! + headingMatch[0].length;
    const rest = content.slice(startIdx);

    const endPattern = new RegExp(`^#{1,${level}}\\s`, 'm');
    const endMatch = rest.match(endPattern);
    const sectionContent = endMatch ? rest.slice(0, endMatch.index!) : rest;

    return sectionContent.trim();
  }

  private extractSteps(content: string): PlanStep[] {
    const steps: PlanStep[] = [];
    // Find all "### Step N:" heading positions
    const headingRegex = /^###\s+Step\s+\d+[^:\n]*:?\s*(.+)$/gm;
    const headings: { title: string; endOfHeading: number }[] = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        title: match[1].trim(),
        endOfHeading: match.index + match[0].length,
      });
    }

    // Find where each section ends (next ## or ### Step heading, or end of string)
    const sectionEndRegex = /^#{2,3}\s+(?:Step\s+\d+|[A-Z])/gm;
    for (let i = 0; i < headings.length; i++) {
      const start = headings[i].endOfHeading;
      const searchFrom = start;
      let end = content.length;

      sectionEndRegex.lastIndex = searchFrom;
      let endMatch;
      while ((endMatch = sectionEndRegex.exec(content)) !== null) {
        if (endMatch.index > start) {
          end = endMatch.index;
          break;
        }
      }

      const body = content.slice(start, end).trim();
      const taskRefs = this.extractTaskRefs(body);
      steps.push({ title: headings[i].title, taskRefs, content: body });
    }

    return steps;
  }

  private extractTaskRefs(content: string): PlanTaskRef[] {
    const refs: PlanTaskRef[] = [];
    // Match patterns like "007-aidf-detector.md" or "(007)"
    const refRegex = /`(\d{3})-[^`]+\.md`\s*[—–-]\s*(.+)/g;

    let match;
    while ((match = refRegex.exec(content)) !== null) {
      refs.push({
        taskId: match[1],
        description: match[2].trim(),
      });
    }

    return refs;
  }
}
