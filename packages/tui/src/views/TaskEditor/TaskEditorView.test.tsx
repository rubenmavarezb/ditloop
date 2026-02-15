import { describe, it, expect, vi } from 'vitest';
import { render } from 'ink-testing-library';
import { ThemeProvider } from '@ditloop/ui';
import { TaskEditorView } from './TaskEditorView.js';
import type { Template } from '@ditloop/core';

const mockTemplate: Template = {
  id: 'task',
  name: 'Task Template',
  description: 'Standard task template',
  variables: ['title', 'goal'],
  raw: '# TASK: {{title}}\n\n## Goal\n{{goal}}',
};

const defaultProps = {
  templates: [mockTemplate],
  onSave: vi.fn(),
  onCancel: vi.fn(),
};

describe('TaskEditorView', () => {
  it('renders New Task title for create mode', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('New Task');
  });

  it('renders Edit Task title for edit mode', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView {...defaultProps} isEditing taskId="001-test" />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Edit Task');
  });

  it('renders all field labels', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('Title');
    expect(lastFrame()).toContain('Goal');
    expect(lastFrame()).toContain('Scope');
    expect(lastFrame()).toContain('Requirements');
    expect(lastFrame()).toContain('Definition of Done');
    expect(lastFrame()).toContain('Status');
  });

  it('renders initial values', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView
          {...defaultProps}
          initialValues={{ title: 'My Task', goal: 'Do things' }}
        />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('My Task');
    expect(lastFrame()).toContain('Do things');
  });

  it('renders keyboard shortcuts', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView {...defaultProps} />
      </ThemeProvider>,
    );

    expect(lastFrame()).toContain('save');
    expect(lastFrame()).toContain('preview');
    expect(lastFrame()).toContain('template');
    expect(lastFrame()).toContain('cancel');
  });

  it('hides template shortcut when no templates', () => {
    const { lastFrame } = render(
      <ThemeProvider>
        <TaskEditorView {...defaultProps} templates={[]} />
      </ThemeProvider>,
    );

    expect(lastFrame()).not.toContain('template');
  });
});
