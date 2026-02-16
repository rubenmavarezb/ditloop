import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { z } from 'zod';

/** Schema for a layout column. */
const LayoutColumnSchema = z.object({
  panelId: z.string(),
  widthPercent: z.number().min(5).max(95),
  rowSpan: z.number().int().min(1).optional(),
});

/** Schema for a layout row. */
const LayoutRowSchema = z.object({
  heightPercent: z.number().min(5).max(95),
  columns: z.array(LayoutColumnSchema).min(1),
});

/** Schema for the full layout config. */
const LayoutConfigSchema = z.object({
  rows: z.array(LayoutRowSchema).min(1),
  bottomBar: z
    .object({
      panelId: z.string(),
      heightPercent: z.number().min(3).max(30),
    })
    .optional(),
});

/** Inferred layout config type from schema. */
export type PersistedLayoutConfig = z.infer<typeof LayoutConfigSchema>;

/** Default config directory path. */
const DEFAULT_CONFIG_DIR = join(homedir(), '.ditloop');

/** Default layout file name. */
const LAYOUT_FILE = 'layout.json';

/**
 * Save and load panel layout configuration to disk.
 * Validates data with Zod schema to reject corrupted files.
 */
export class LayoutPersistence {
  private readonly configDir: string;

  /**
   * Create a LayoutPersistence instance.
   *
   * @param configDir - Directory to store the layout file (defaults to ~/.ditloop)
   */
  constructor(configDir?: string) {
    this.configDir = configDir ?? DEFAULT_CONFIG_DIR;
  }

  /**
   * Save a layout configuration to disk.
   *
   * @param config - The layout configuration to persist
   */
  async save(config: PersistedLayoutConfig): Promise<void> {
    const validated = LayoutConfigSchema.parse(config);
    await mkdir(this.configDir, { recursive: true });
    const filePath = join(this.configDir, LAYOUT_FILE);
    await writeFile(filePath, JSON.stringify(validated, null, 2), 'utf-8');
  }

  /**
   * Load a layout configuration from disk.
   *
   * @returns The saved layout config, or undefined if no file exists or it's invalid
   */
  async load(): Promise<PersistedLayoutConfig | undefined> {
    try {
      const filePath = join(this.configDir, LAYOUT_FILE);
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return LayoutConfigSchema.parse(data);
    } catch {
      return undefined;
    }
  }
}
