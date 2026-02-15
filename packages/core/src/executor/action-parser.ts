import { z } from 'zod';
import type { ToolUseRequest } from '../provider/index.js';

/** Action to create a new file. */
export const FileCreateActionSchema = z.object({
  type: z.literal('file_create'),
  path: z.string().min(1),
  content: z.string(),
});

export type FileCreateAction = z.infer<typeof FileCreateActionSchema>;

/** Action to edit an existing file. */
export const FileEditActionSchema = z.object({
  type: z.literal('file_edit'),
  path: z.string().min(1),
  oldContent: z.string(),
  newContent: z.string(),
  diff: z.string().optional(),
});

export type FileEditAction = z.infer<typeof FileEditActionSchema>;

/** Action to run a shell command. */
export const ShellCommandActionSchema = z.object({
  type: z.literal('shell_command'),
  command: z.string().min(1),
  cwd: z.string().optional(),
});

export type ShellCommandAction = z.infer<typeof ShellCommandActionSchema>;

/** Action to perform a git operation. */
export const GitOperationActionSchema = z.object({
  type: z.literal('git_operation'),
  operation: z.enum(['commit', 'branch', 'push', 'pull', 'stage', 'checkout']),
  args: z.record(z.string(), z.unknown()).default({}),
});

export type GitOperationAction = z.infer<typeof GitOperationActionSchema>;

/** Union of all action types. */
export const ActionSchema = z.discriminatedUnion('type', [
  FileCreateActionSchema,
  FileEditActionSchema,
  ShellCommandActionSchema,
  GitOperationActionSchema,
]);

export type Action = z.infer<typeof ActionSchema>;

/**
 * Extracts structured actions from AI tool use requests and text responses.
 */
export class ActionParser {
  /**
   * Parse a tool use request into an Action.
   *
   * @param toolUse - The tool use request from the provider
   * @returns Parsed action, or undefined if the tool use doesn't map to a known action
   */
  parseToolUse(toolUse: ToolUseRequest): Action | undefined {
    const args = toolUse.arguments;

    switch (toolUse.name) {
      case 'create_file':
      case 'write_file':
        return this.validate(FileCreateActionSchema, {
          type: 'file_create',
          path: args.path as string,
          content: args.content as string,
        });

      case 'edit_file':
      case 'replace_in_file':
        return this.validate(FileEditActionSchema, {
          type: 'file_edit',
          path: args.path as string,
          oldContent: (args.old_content ?? args.oldContent ?? '') as string,
          newContent: (args.new_content ?? args.newContent ?? '') as string,
        });

      case 'run_command':
      case 'execute_command':
      case 'shell':
        return this.validate(ShellCommandActionSchema, {
          type: 'shell_command',
          command: (args.command ?? args.cmd) as string,
          cwd: args.cwd as string | undefined,
        });

      case 'git':
      case 'git_operation':
        return this.validate(GitOperationActionSchema, {
          type: 'git_operation',
          operation: args.operation as string,
          args: (args.args ?? {}) as Record<string, unknown>,
        });

      default:
        return undefined;
    }
  }

  /**
   * Parse markdown code blocks from text into actions.
   * Looks for fenced code blocks with file paths or shell directives.
   *
   * @param text - Text content that may contain markdown code blocks
   * @returns Array of parsed actions
   */
  parseMarkdown(text: string): Action[] {
    const actions: Action[] = [];
    const codeBlockRegex = /```(\w+)?\s*\n(?:\/\/\s*file:\s*(.+?)\n)?([\s\S]*?)```/g;

    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [, lang, filePath, content] = match;

      if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
        const trimmed = content.trim();
        if (trimmed) {
          actions.push({
            type: 'shell_command',
            command: trimmed,
          });
        }
      } else if (filePath) {
        actions.push({
          type: 'file_create',
          path: filePath.trim(),
          content: content.trimEnd(),
        });
      }
    }

    return actions;
  }

  /**
   * Generate a simple unified diff between old and new content.
   *
   * @param oldContent - Original file content
   * @param newContent - Modified file content
   * @param filePath - File path for the diff header
   * @returns Unified diff string
   */
  generateDiff(oldContent: string, newContent: string, filePath: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const lines: string[] = [
      `--- a/${filePath}`,
      `+++ b/${filePath}`,
    ];

    // Simple line-by-line diff
    const maxLen = Math.max(oldLines.length, newLines.length);
    let hunkStart = -1;
    let hunkLines: string[] = [];

    for (let i = 0; i < maxLen; i++) {
      const oldLine = i < oldLines.length ? oldLines[i] : undefined;
      const newLine = i < newLines.length ? newLines[i] : undefined;

      if (oldLine !== newLine) {
        if (hunkStart === -1) hunkStart = i;
        if (oldLine !== undefined) hunkLines.push(`-${oldLine}`);
        if (newLine !== undefined) hunkLines.push(`+${newLine}`);
      } else {
        if (hunkLines.length > 0) {
          lines.push(`@@ -${hunkStart + 1} +${hunkStart + 1} @@`);
          lines.push(...hunkLines);
          if (oldLine !== undefined) lines.push(` ${oldLine}`);
          hunkLines = [];
          hunkStart = -1;
        }
      }
    }

    if (hunkLines.length > 0) {
      lines.push(`@@ -${hunkStart + 1} +${hunkStart + 1} @@`);
      lines.push(...hunkLines);
    }

    return lines.join('\n');
  }

  private validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> | undefined {
    const result = schema.safeParse(data);
    return result.success ? result.data : undefined;
  }
}
