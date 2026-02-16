import { readdir, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';

/** A node in the file tree. */
export interface TreeNode {
  /** File or directory name. */
  name: string;
  /** Absolute path. */
  path: string;
  /** Whether this is a file or directory. */
  type: 'file' | 'dir';
  /** Child nodes (only for directories). */
  children?: TreeNode[];
}

/**
 * Build a file tree structure from a directory path.
 * Designed for scanning `.ai/` directories but works with any path.
 */
export class FileTreeBuilder {
  /**
   * Scan a directory recursively and build a tree structure.
   *
   * @param dirPath - Absolute path to the directory to scan
   * @returns Tree node representing the directory, or undefined if path doesn't exist
   */
  async build(dirPath: string): Promise<TreeNode | undefined> {
    try {
      const stats = await stat(dirPath);
      if (!stats.isDirectory()) return undefined;
      return this.scanDir(dirPath);
    } catch {
      return undefined;
    }
  }

  /**
   * Recursively scan a directory into TreeNode structure.
   *
   * @param dirPath - Directory path to scan
   * @returns TreeNode for the directory
   */
  private async scanDir(dirPath: string): Promise<TreeNode> {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const children: TreeNode[] = [];

    // Sort: directories first, then files, both alphabetically
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of sorted) {
      const entryPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subDir = await this.scanDir(entryPath);
        children.push(subDir);
      } else {
        children.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
        });
      }
    }

    return {
      name: basename(dirPath),
      path: dirPath,
      type: 'dir',
      children,
    };
  }
}
