import { describe, it, expect } from 'vitest';
import { ActionParser } from './action-parser.js';

describe('ActionParser', () => {
  const parser = new ActionParser();

  describe('parseToolUse', () => {
    it('parses create_file tool use', () => {
      const action = parser.parseToolUse({
        id: 'call_1',
        name: 'create_file',
        arguments: { path: 'src/new.ts', content: 'export const x = 1;' },
      });

      expect(action).toEqual({
        type: 'file_create',
        path: 'src/new.ts',
        content: 'export const x = 1;',
      });
    });

    it('parses edit_file tool use', () => {
      const action = parser.parseToolUse({
        id: 'call_2',
        name: 'edit_file',
        arguments: {
          path: 'src/index.ts',
          old_content: 'const a = 1;',
          new_content: 'const a = 2;',
        },
      });

      expect(action).toEqual({
        type: 'file_edit',
        path: 'src/index.ts',
        oldContent: 'const a = 1;',
        newContent: 'const a = 2;',
      });
    });

    it('parses run_command tool use', () => {
      const action = parser.parseToolUse({
        id: 'call_3',
        name: 'run_command',
        arguments: { command: 'npm test', cwd: '/project' },
      });

      expect(action).toEqual({
        type: 'shell_command',
        command: 'npm test',
        cwd: '/project',
      });
    });

    it('parses git_operation tool use', () => {
      const action = parser.parseToolUse({
        id: 'call_4',
        name: 'git_operation',
        arguments: {
          operation: 'commit',
          args: { message: 'feat: add feature' },
        },
      });

      expect(action).toEqual({
        type: 'git_operation',
        operation: 'commit',
        args: { message: 'feat: add feature' },
      });
    });

    it('returns undefined for unknown tool', () => {
      const action = parser.parseToolUse({
        id: 'call_5',
        name: 'unknown_tool',
        arguments: {},
      });

      expect(action).toBeUndefined();
    });

    it('returns undefined for invalid arguments', () => {
      const action = parser.parseToolUse({
        id: 'call_6',
        name: 'create_file',
        arguments: { invalid: true },
      });

      expect(action).toBeUndefined();
    });
  });

  describe('parseMarkdown', () => {
    it('extracts shell commands from bash code blocks', () => {
      const text = 'Run this:\n```bash\nnpm install\n```';
      const actions = parser.parseMarkdown(text);

      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'shell_command',
        command: 'npm install',
      });
    });

    it('extracts file creates from code blocks with file paths', () => {
      const text = '```typescript\n// file: src/new.ts\nexport const x = 1;\n```';
      const actions = parser.parseMarkdown(text);

      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'file_create',
        path: 'src/new.ts',
        content: 'export const x = 1;',
      });
    });

    it('handles multiple code blocks', () => {
      const text = [
        '```bash\nnpm install\n```',
        'Then:',
        '```sh\nnpm test\n```',
      ].join('\n');

      const actions = parser.parseMarkdown(text);
      expect(actions).toHaveLength(2);
    });

    it('returns empty array for text without code blocks', () => {
      const actions = parser.parseMarkdown('Just some plain text');
      expect(actions).toHaveLength(0);
    });
  });

  describe('generateDiff', () => {
    it('generates diff for modified content', () => {
      const diff = parser.generateDiff(
        'line1\nline2\nline3',
        'line1\nmodified\nline3',
        'test.ts',
      );

      expect(diff).toContain('--- a/test.ts');
      expect(diff).toContain('+++ b/test.ts');
      expect(diff).toContain('-line2');
      expect(diff).toContain('+modified');
    });

    it('generates diff for added lines', () => {
      const diff = parser.generateDiff(
        'line1',
        'line1\nline2',
        'test.ts',
      );

      expect(diff).toContain('+line2');
    });

    it('generates diff for removed lines', () => {
      const diff = parser.generateDiff(
        'line1\nline2',
        'line1',
        'test.ts',
      );

      expect(diff).toContain('-line2');
    });
  });
});
