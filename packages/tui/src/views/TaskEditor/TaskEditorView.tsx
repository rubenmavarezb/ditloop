import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme, Divider, Panel, StatusBadge } from '@ditloop/ui';
import type { Template } from '@ditloop/core';

/** Task field values for the editor. */
export interface TaskFieldValues {
  title: string;
  goal: string;
  scope: string;
  requirements: string;
  dod: string;
  status: string;
}

/** Props for the TaskEditorView component. */
export interface TaskEditorViewProps {
  /** Initial field values (for editing existing tasks). */
  initialValues?: Partial<TaskFieldValues>;
  /** Available templates for pre-filling. */
  templates: Template[];
  /** Whether we are editing an existing task (vs creating new). */
  isEditing?: boolean;
  /** Task ID when editing. */
  taskId?: string;
  /** Callback when user saves. */
  onSave: (id: string, values: TaskFieldValues) => void;
  /** Callback when user cancels. */
  onCancel: () => void;
}

type FieldName = keyof TaskFieldValues;
type EditorMode = 'form' | 'preview' | 'template';

const FIELDS: Array<{ name: FieldName; label: string }> = [
  { name: 'title', label: 'Title' },
  { name: 'goal', label: 'Goal' },
  { name: 'scope', label: 'Scope' },
  { name: 'requirements', label: 'Requirements' },
  { name: 'dod', label: 'Definition of Done' },
  { name: 'status', label: 'Status' },
];

const DEFAULT_VALUES: TaskFieldValues = {
  title: '',
  goal: '',
  scope: '',
  requirements: '',
  dod: '',
  status: 'pending',
};

/**
 * TUI form editor for creating and editing AIDF tasks.
 * Supports template pre-filling, preview mode, and keyboard navigation.
 */
export function TaskEditorView({
  initialValues,
  templates,
  isEditing = false,
  taskId,
  onSave,
  onCancel,
}: TaskEditorViewProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<EditorMode>('form');
  const [fieldIndex, setFieldIndex] = useState(0);
  const [values, setValues] = useState<TaskFieldValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [editingField, setEditingField] = useState<FieldName | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [templateIndex, setTemplateIndex] = useState(0);

  useInput((input, key) => {
    // Template selection mode
    if (mode === 'template') {
      if (key.escape) {
        setMode('form');
        return;
      }
      if (key.upArrow) {
        setTemplateIndex(i => Math.max(0, i - 1));
        return;
      }
      if (key.downArrow) {
        setTemplateIndex(i => Math.min(templates.length - 1, i + 1));
        return;
      }
      if (key.return && templates.length > 0) {
        // Apply template (use template name as title if empty)
        const tpl = templates[templateIndex];
        if (tpl) {
          setValues(v => ({
            ...v,
            title: v.title || tpl.name,
          }));
        }
        setMode('form');
        return;
      }
      return;
    }

    // Preview mode
    if (mode === 'preview') {
      if (key.escape || (input === 'p' && key.ctrl)) {
        setMode('form');
      }
      return;
    }

    // Form mode — editing a field
    if (editingField) {
      if (key.escape) {
        setEditingField(null);
        setEditBuffer('');
        return;
      }
      if (key.return) {
        setValues(v => ({ ...v, [editingField]: editBuffer }));
        setEditingField(null);
        setEditBuffer('');
        return;
      }
      if (key.backspace || key.delete) {
        setEditBuffer(b => b.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setEditBuffer(b => b + input);
        return;
      }
      return;
    }

    // Form mode — navigation
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setFieldIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setFieldIndex(i => Math.min(FIELDS.length - 1, i + 1));
      return;
    }

    if (key.return) {
      const field = FIELDS[fieldIndex];
      setEditingField(field.name);
      setEditBuffer(values[field.name]);
      return;
    }

    // Ctrl+S to save
    if (input === 's' && key.ctrl) {
      const id = taskId ?? generateTaskId(values.title);
      onSave(id, values);
      return;
    }

    // Ctrl+P to toggle preview
    if (input === 'p' && key.ctrl) {
      setMode('preview');
      return;
    }

    // Ctrl+T to select template
    if (input === 't' && key.ctrl) {
      if (templates.length > 0) {
        setMode('template');
        setTemplateIndex(0);
      }
      return;
    }
  });

  if (mode === 'template') {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
        <Text bold color={theme.accent}>Select Template</Text>
        <Divider width={50} />
        <Box flexDirection="column">
          {templates.map((tpl, i) => (
            <Box key={tpl.id} gap={1}>
              <Text color={i === templateIndex ? theme.accent : theme.text}>
                {i === templateIndex ? '>' : ' '} {tpl.name}
              </Text>
              <Text color={theme.textDim}>{tpl.description.slice(0, 40)}</Text>
            </Box>
          ))}
        </Box>
        <Box gap={2}>
          <Text color={theme.accent}>[⏎]</Text>
          <Text color={theme.textDim}>apply</Text>
          <Text color={theme.accent}>[Esc]</Text>
          <Text color={theme.textDim}>cancel</Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'preview') {
    return (
      <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
        <Text bold color={theme.accent}>Preview</Text>
        <Divider width={50} />
        <Text>{renderPreview(values)}</Text>
        <Box gap={2}>
          <Text color={theme.accent}>[Ctrl+P]</Text>
          <Text color={theme.textDim}>back to form</Text>
          <Text color={theme.accent}>[Esc]</Text>
          <Text color={theme.textDim}>back to form</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      <Text bold color={theme.accent}>
        {isEditing ? 'Edit Task' : 'New Task'}
      </Text>
      <Divider width={50} />

      <Panel title="Fields" width={50}>
        <Box flexDirection="column">
          {FIELDS.map((field, i) => (
            <Box key={field.name} gap={1}>
              <Text color={i === fieldIndex ? theme.accent : theme.text}>
                {i === fieldIndex ? '>' : ' '}
              </Text>
              <Text bold color={theme.text}>{field.label}:</Text>
              {editingField === field.name ? (
                <Text color={theme.accent}>{editBuffer}|</Text>
              ) : (
                <Text color={values[field.name] ? theme.text : theme.textDim}>
                  {values[field.name] || '(empty)'}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      </Panel>

      <Divider width={50} />

      <Box gap={2} flexWrap="wrap">
        <Text color={theme.accent}>[↑↓]</Text>
        <Text color={theme.textDim}>navigate</Text>
        <Text color={theme.accent}>[⏎]</Text>
        <Text color={theme.textDim}>edit field</Text>
        <Text color={theme.accent}>[Ctrl+S]</Text>
        <Text color={theme.textDim}>save</Text>
        <Text color={theme.accent}>[Ctrl+P]</Text>
        <Text color={theme.textDim}>preview</Text>
        {templates.length > 0 && (
          <>
            <Text color={theme.accent}>[Ctrl+T]</Text>
            <Text color={theme.textDim}>template</Text>
          </>
        )}
        <Text color={theme.accent}>[Esc]</Text>
        <Text color={theme.textDim}>cancel</Text>
      </Box>
    </Box>
  );
}

function generateTaskId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return slug || 'new-task';
}

function renderPreview(values: TaskFieldValues): string {
  const lines: string[] = [];
  lines.push(`# TASK: ${values.title || 'Untitled'}`);
  lines.push('');
  if (values.goal) {
    lines.push('## Goal');
    lines.push(values.goal);
    lines.push('');
  }
  if (values.scope) {
    lines.push('## Scope');
    lines.push(values.scope);
    lines.push('');
  }
  if (values.requirements) {
    lines.push('## Requirements');
    lines.push(values.requirements);
    lines.push('');
  }
  if (values.dod) {
    lines.push('## Definition of Done');
    lines.push(values.dod);
    lines.push('');
  }
  lines.push(`## Status: ${values.status}`);
  return lines.join('\n');
}
