import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import { HitLoopConfigSchema, type HitLoopConfig } from './schema.js';

export const DEFAULT_CONFIG_DIR = join(homedir(), '.hitloop');
export const DEFAULT_CONFIG_PATH = join(DEFAULT_CONFIG_DIR, 'config.yml');

export interface LoadConfigOptions {
  path?: string;
}

export async function loadConfig(options?: LoadConfigOptions): Promise<HitLoopConfig> {
  const configPath = options?.path ?? DEFAULT_CONFIG_PATH;

  if (!existsSync(configPath)) {
    return HitLoopConfigSchema.parse({});
  }

  const raw = await readFile(configPath, 'utf-8');
  const data = parseYaml(raw);

  return HitLoopConfigSchema.parse(data);
}
