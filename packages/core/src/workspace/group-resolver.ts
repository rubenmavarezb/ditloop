import { existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { GroupWorkspace } from '../config/index.js';

/** A discovered sub-project inside a group workspace directory. */
export interface SubProject {
  /** Slugified directory name */
  id: string;
  /** Directory name */
  name: string;
  /** Absolute path to the sub-project */
  path: string;
}

/**
 * Scans a group workspace directory and discovers sub-projects.
 * A sub-project is any direct child directory that contains a `.git` folder.
 * Only scans 1 level deep. Respects the `exclude` list from config.
 */
export class GroupResolver {
  /**
   * Discover sub-projects inside a group workspace path.
   * @param workspace - The group workspace configuration
   * @returns Array of discovered sub-projects
   */
  resolve(workspace: GroupWorkspace): SubProject[] {
    const { path: groupPath, exclude = [] } = workspace;

    if (!existsSync(groupPath)) {
      return [];
    }

    const excludeSet = new Set(exclude);
    const entries = readdirSync(groupPath, { withFileTypes: true });
    const projects: SubProject[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;
      if (excludeSet.has(entry.name)) continue;

      const childPath = join(groupPath, entry.name);
      const gitPath = join(childPath, '.git');

      if (existsSync(gitPath)) {
        projects.push({
          id: slugify(entry.name),
          name: entry.name,
          path: childPath,
        });
      }
    }

    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Scans a directory for child directories containing .git folders (depth 1 only).
 * Standalone utility for auto-discovery outside of workspace config context.
 */
export function autoDiscover(dirPath: string, exclude: string[] = []): SubProject[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  const excludeSet = new Set(exclude);
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const projects: SubProject[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (excludeSet.has(entry.name)) continue;

    const childPath = join(dirPath, entry.name);
    const gitPath = join(childPath, '.git');

    if (existsSync(gitPath)) {
      projects.push({
        id: slugify(entry.name),
        name: entry.name,
        path: childPath,
      });
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

/** Convert a name to a URL-safe slug. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
