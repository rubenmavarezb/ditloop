import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { generateClaudeMd, generateAiderConf, buildContextString } from './context-builder.js';
import type { LaunchContext } from './context-builder.js';

const execFileAsync = promisify(execFileCb);

/** Supported AI CLI tool type. */
export type CliType = 'claude' | 'aider' | 'copilot' | 'generic';

/** Configuration for a supported AI CLI tool. */
export interface CliDefinition {
  id: CliType;
  name: string;
  command: string;
  args: string[];
  installUrl: string;
  contextMethod: 'claude-md' | 'aider-conf' | 'clipboard' | 'env';
}

/** Default CLI definitions for known AI tools. */
export const CLI_DEFINITIONS: CliDefinition[] = [
  { id: 'claude', name: 'Claude Code', command: 'claude', args: [], installUrl: 'https://docs.anthropic.com/en/docs/claude-code', contextMethod: 'claude-md' },
  { id: 'aider', name: 'Aider', command: 'aider', args: [], installUrl: 'https://aider.chat/docs/install.html', contextMethod: 'aider-conf' },
  { id: 'copilot', name: 'GitHub Copilot CLI', command: 'gh', args: ['copilot'], installUrl: 'https://docs.github.com/en/copilot', contextMethod: 'clipboard' },
  { id: 'generic', name: 'Generic AI CLI', command: '', args: [], installUrl: '', contextMethod: 'env' },
];

/**
 * Build the launch command for a CLI with context injection.
 *
 * @param cli - CLI definition
 * @param context - Workspace and AIDF context
 * @param tmpDir - Temporary directory for generated files
 * @returns Command, args, and env for spawning
 */
export async function buildLaunchCommand(
  cli: CliDefinition, context: LaunchContext, tmpDir: string,
): Promise<{ command: string; args: string[]; env: Record<string, string> }> {
  const args = [...cli.args];
  const env: Record<string, string> = {};
  switch (cli.contextMethod) {
    case 'claude-md': {
      await generateClaudeMd(context, join(tmpDir, 'CLAUDE.md'));
      args.push('--system-prompt', await buildContextString(context));
      break;
    }
    case 'aider-conf': {
      const confPath = join(tmpDir, '.aider.conf.yml');
      await generateAiderConf(context, confPath);
      args.push('--config', confPath);
      break;
    }
    case 'clipboard':
    case 'env': {
      const ctx = await buildContextString(context);
      env['DITLOOP_CONTEXT'] = ctx;
      env['DITLOOP_WORKSPACE'] = context.workspacePath;
      env['DITLOOP_WORKSPACE_NAME'] = context.workspaceName;
      if (context.gitIdentity) { env['DITLOOP_GIT_NAME'] = context.gitIdentity.name; env['DITLOOP_GIT_EMAIL'] = context.gitIdentity.email; }
      if (context.branch) env['DITLOOP_BRANCH'] = context.branch;
      break;
    }
  }
  return { command: cli.command, args, env };
}

/**
 * Detect which AI CLIs are available on the system.
 *
 * @returns Array of available CLI definitions
 */
export async function detectAvailableClis(): Promise<CliDefinition[]> {
  const available: CliDefinition[] = [];
  for (const cli of CLI_DEFINITIONS) {
    if (cli.id === 'generic') continue;
    try { await execFileAsync('which', [cli.command]); available.push(cli); } catch { /* not found */ }
  }
  return available;
}
