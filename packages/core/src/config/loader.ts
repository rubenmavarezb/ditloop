import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import { DitLoopConfigSchema, type DitLoopConfig } from './schema.js';

export const DEFAULT_CONFIG_DIR = join(homedir(), '.ditloop');
export const DEFAULT_CONFIG_PATH = join(DEFAULT_CONFIG_DIR, 'config.yml');

export interface LoadConfigOptions {
  path?: string;
}

export async function loadConfig(options?: LoadConfigOptions): Promise<DitLoopConfig> {
  const configPath = options?.path ?? DEFAULT_CONFIG_PATH;

  if (!existsSync(configPath)) {
    return DitLoopConfigSchema.parse({});
  }

  const raw = await readFile(configPath, 'utf-8');
  const data = parseYaml(raw);

  return DitLoopConfigSchema.parse(data);
}
