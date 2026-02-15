import { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme, Panel, Divider } from '@ditloop/ui';
import { TemplateEngine, AidfWriter, EventBus } from '@ditloop/core';
import type { AidfType, Template } from '@ditloop/core';

type Step = 'type' | 'template' | 'variables' | 'preview' | 'confirm' | 'done';

const AIDF_TYPES: Array<{ value: AidfType; label: string }> = [
  { value: 'task', label: 'Task' },
  { value: 'role', label: 'Role' },
  { value: 'skill', label: 'Skill' },
  { value: 'plan', label: 'Plan' },
];

/** Props for the ScaffoldWizard. */
export interface ScaffoldWizardProps {
  /** Working directory (workspace path). */
  workspacePath: string;
  /** Pre-selected AIDF type (from subcommand). */
  preselectedType?: AidfType;
  /** Pre-selected template ID. */
  preselectedTemplate?: string;
  /** Pre-set variables from CLI flags. */
  presetVars?: Record<string, string>;
}

/**
 * Interactive wizard for scaffolding AIDF files from templates.
 */
export function ScaffoldWizard(props: ScaffoldWizardProps) {
  return (
    <ThemeProvider>
      <ScaffoldWizardInner {...props} />
    </ThemeProvider>
  );
}

function ScaffoldWizardInner({
  workspacePath,
  preselectedType,
  preselectedTemplate,
  presetVars,
}: ScaffoldWizardProps) {
  const theme = useTheme();
  const { exit } = useApp();

  const engine = new TemplateEngine();
  engine.loadBuiltIns();
  // Also load from workspace templates
  engine.loadFromDirectory(`${workspacePath}/.ai/templates`);

  const [step, setStep] = useState<Step>(preselectedType ? 'template' : 'type');
  const [selectedType, setSelectedType] = useState<AidfType>(preselectedType ?? 'task');
  const [typeIndex, setTypeIndex] = useState(0);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    preselectedTemplate ? engine.get(preselectedTemplate) ?? null : null,
  );
  const [variables, setVariables] = useState<Record<string, string>>(presetVars ?? {});
  const [varIndex, setVarIndex] = useState(0);
  const [editBuffer, setEditBuffer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rendered, setRendered] = useState('');
  const [resultPath, setResultPath] = useState('');
  const [error, setError] = useState('');

  const availableTemplates = engine.list().filter(t =>
    t.id === selectedType || t.id.startsWith(selectedType + '-'),
  );

  const currentVars = selectedTemplate?.variables ?? [];

  useInput((input, key) => {
    if (key.escape) {
      if (isEditing) {
        setIsEditing(false);
        setEditBuffer('');
        return;
      }
      exit();
      return;
    }

    switch (step) {
      case 'type': {
        if (key.upArrow) setTypeIndex(i => Math.max(0, i - 1));
        if (key.downArrow) setTypeIndex(i => Math.min(AIDF_TYPES.length - 1, i + 1));
        if (key.return) {
          setSelectedType(AIDF_TYPES[typeIndex].value);
          setStep('template');
        }
        break;
      }

      case 'template': {
        if (key.upArrow) setTemplateIndex(i => Math.max(0, i - 1));
        if (key.downArrow) setTemplateIndex(i => Math.min(availableTemplates.length - 1, i + 1));
        if (key.return && availableTemplates.length > 0) {
          const tpl = availableTemplates[templateIndex];
          setSelectedTemplate(tpl);
          if (tpl.variables.length > 0) {
            setStep('variables');
            setVarIndex(0);
          } else {
            const result = engine.render(tpl.id, variables);
            setRendered(result.content);
            setStep('preview');
          }
        }
        break;
      }

      case 'variables': {
        if (isEditing) {
          if (key.return) {
            const varName = currentVars[varIndex];
            setVariables(v => ({ ...v, [varName]: editBuffer }));
            setIsEditing(false);
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

        if (key.upArrow) setVarIndex(i => Math.max(0, i - 1));
        if (key.downArrow) setVarIndex(i => Math.min(currentVars.length - 1, i + 1));
        if (key.return) {
          const varName = currentVars[varIndex];
          setEditBuffer(variables[varName] ?? '');
          setIsEditing(true);
        }
        if (key.tab || (input === 'p' && key.ctrl)) {
          // Move to preview
          if (selectedTemplate) {
            const result = engine.render(selectedTemplate.id, variables);
            setRendered(result.content);
            setStep('preview');
          }
        }
        break;
      }

      case 'preview': {
        if (key.return) {
          setStep('confirm');
        }
        if (input === 'e') {
          setStep('variables');
        }
        break;
      }

      case 'confirm': {
        if (input === 'y' || key.return) {
          try {
            const eventBus = new EventBus();
            const writer = new AidfWriter('scaffold', eventBus);
            const id = variables['title']
              ? variables['title'].toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
              : selectedTemplate?.id ?? selectedType;

            const path = writer.create({
              type: selectedType,
              id,
              content: rendered,
              workspacePath,
            });

            setResultPath(path);
            setStep('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }
        if (input === 'n') {
          setStep('preview');
        }
        break;
      }

      case 'done': {
        if (key.return || key.escape) {
          exit();
        }
        break;
      }
    }
  });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} gap={1}>
      <Text bold color={theme.accent}>ditloop scaffold</Text>

      {step === 'type' && (
        <Box flexDirection="column" gap={1}>
          <Text>Select AIDF type:</Text>
          {AIDF_TYPES.map((t, i) => (
            <Text key={t.value} color={i === typeIndex ? theme.accent : theme.text}>
              {i === typeIndex ? '> ' : '  '}{t.label}
            </Text>
          ))}
        </Box>
      )}

      {step === 'template' && (
        <Box flexDirection="column" gap={1}>
          <Text>Select template for <Text bold>{selectedType}</Text>:</Text>
          {availableTemplates.length === 0 ? (
            <Text color={theme.textDim}>No templates available for this type.</Text>
          ) : (
            availableTemplates.map((t, i) => (
              <Text key={t.id} color={i === templateIndex ? theme.accent : theme.text}>
                {i === templateIndex ? '> ' : '  '}{t.name}
              </Text>
            ))
          )}
        </Box>
      )}

      {step === 'variables' && (
        <Box flexDirection="column" gap={1}>
          <Text>Fill in variables:</Text>
          {currentVars.map((v, i) => (
            <Box key={v} gap={1}>
              <Text color={i === varIndex ? theme.accent : theme.text}>
                {i === varIndex ? '>' : ' '}
              </Text>
              <Text bold>{v}:</Text>
              {isEditing && i === varIndex ? (
                <Text color={theme.accent}>{editBuffer}|</Text>
              ) : (
                <Text color={variables[v] ? theme.text : theme.textDim}>
                  {variables[v] || '(empty)'}
                </Text>
              )}
            </Box>
          ))}
          <Text color={theme.textDim}>[Tab/Ctrl+P] preview | [⏎] edit | [Esc] cancel</Text>
        </Box>
      )}

      {step === 'preview' && (
        <Box flexDirection="column" gap={1}>
          <Text bold>Preview:</Text>
          <Divider width={50} />
          <Text>{rendered}</Text>
          <Divider width={50} />
          <Text color={theme.textDim}>[⏎] confirm | [e] edit | [Esc] cancel</Text>
        </Box>
      )}

      {step === 'confirm' && (
        <Box flexDirection="column" gap={1}>
          <Text>Create this file? <Text bold color={theme.accent}>(y/n)</Text></Text>
          {error && <Text color={theme.error}>{error}</Text>}
        </Box>
      )}

      {step === 'done' && (
        <Box flexDirection="column" gap={1}>
          <Text color={theme.active}>Created: {resultPath}</Text>
          <Text color={theme.textDim}>Press Enter to exit.</Text>
        </Box>
      )}
    </Box>
  );
}
