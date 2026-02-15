import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme, Divider, StatusBadge, Panel } from '@ditloop/ui';
import type { DetectedCli } from '@ditloop/core';
import type { AidfTask } from '@ditloop/core';

/** Props for the LauncherView component. */
export interface LauncherViewProps {
  /** Detected AI CLIs available on the system. */
  detectedClis: DetectedCli[];
  /** All registered CLI definitions (including unavailable). */
  allCliIds: string[];
  /** Installed CLI map: id → definition info. */
  cliDefinitions: Map<string, { name: string; installUrl: string }>;
  /** AIDF tasks from the active workspace. */
  tasks: AidfTask[];
  /** Active workspace name. */
  workspaceName: string;
  /** Current git branch. */
  currentBranch?: string;
  /** Callback when user selects a CLI + task to launch. */
  onLaunch: (cliId: string, taskId?: string) => void;
  /** Callback when user presses Escape. */
  onBack: () => void;
}

type Section = 'cli' | 'task';

/**
 * TUI view for selecting an AI CLI tool and AIDF task before launching.
 * Shows available CLIs, optional task selection, and context preview.
 */
export function LauncherView({
  detectedClis,
  allCliIds,
  cliDefinitions,
  tasks,
  workspaceName,
  currentBranch,
  onLaunch,
  onBack,
}: LauncherViewProps) {
  const theme = useTheme();
  const [section, setSection] = useState<Section>('cli');
  const [cliIndex, setCliIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedCliId, setSelectedCliId] = useState<string | null>(null);

  // Build the list of CLIs to show (detected ones first, then unavailable)
  const cliItems = buildCliItems(detectedClis, allCliIds, cliDefinitions);

  // Task items: "No task" + actual tasks
  const taskItems: Array<{ id: string | null; title: string; status?: string }> = [
    { id: null, title: 'No task (general chat)' },
    ...tasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
  ];

  useInput((input, key) => {
    if (key.escape) {
      if (section === 'task') {
        setSection('cli');
        setSelectedCliId(null);
      } else {
        onBack();
      }
      return;
    }

    if (key.upArrow) {
      if (section === 'cli') {
        setCliIndex(i => Math.max(0, i - 1));
      } else {
        setTaskIndex(i => Math.max(0, i - 1));
      }
      return;
    }

    if (key.downArrow) {
      if (section === 'cli') {
        setCliIndex(i => Math.min(cliItems.length - 1, i + 1));
      } else {
        setTaskIndex(i => Math.min(taskItems.length - 1, i + 1));
      }
      return;
    }

    if (key.return) {
      if (section === 'cli') {
        const selected = cliItems[cliIndex];
        if (!selected?.available) return;
        setSelectedCliId(selected.id);

        if (tasks.length > 0) {
          setSection('task');
        } else {
          onLaunch(selected.id, undefined);
        }
      } else {
        const selectedTask = taskItems[taskIndex];
        if (selectedCliId) {
          onLaunch(selectedCliId, selectedTask.id ?? undefined);
        }
      }
      return;
    }

    // Tab switches between sections when task selection is visible
    if (key.tab && selectedCliId && tasks.length > 0) {
      setSection(s => s === 'cli' ? 'task' : 'cli');
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      <Text bold color={theme.accent}>AI Launcher</Text>
      <Text color={theme.textDim}>
        Select an AI tool to launch with workspace context
      </Text>

      <Divider width={50} />

      {/* CLI Selection */}
      <Panel title="AI Tools" width={50}>
        <Box flexDirection="column">
          {cliItems.map((item, i) => (
            <Box key={item.id} gap={1}>
              <Text color={section === 'cli' && i === cliIndex ? theme.accent : theme.text}>
                {section === 'cli' && i === cliIndex ? '>' : ' '}
              </Text>
              <StatusBadge
                label={item.name}
                variant={item.available ? 'active' : 'idle'}
              />
              {item.available && (
                <Text color={theme.textDim}>v{item.version}</Text>
              )}
              {!item.available && (
                <Text color={theme.textDim}>(not installed)</Text>
              )}
            </Box>
          ))}
        </Box>
      </Panel>

      {/* Task Selection (shown after CLI is picked, or when tasks exist) */}
      {selectedCliId && tasks.length > 0 && (
        <Panel title="AIDF Task" width={50}>
          <Box flexDirection="column">
            {taskItems.map((item, i) => (
              <Box key={item.id ?? 'none'} gap={1}>
                <Text color={section === 'task' && i === taskIndex ? theme.accent : theme.text}>
                  {section === 'task' && i === taskIndex ? '>' : ' '}
                </Text>
                <Text>{item.title}</Text>
                {item.status && (
                  <Text color={theme.textDim}>({item.status})</Text>
                )}
              </Box>
            ))}
          </Box>
        </Panel>
      )}

      {/* Context Preview */}
      <Panel title="Context Preview" width={50}>
        <Box flexDirection="column">
          <Text color={theme.textDim}>
            Workspace: <Text color={theme.text}>{workspaceName}</Text>
          </Text>
          {currentBranch && (
            <Text color={theme.textDim}>
              Branch: <Text color={theme.text}>{currentBranch}</Text>
            </Text>
          )}
          {selectedCliId && (
            <Text color={theme.textDim}>
              Tool: <Text color={theme.text}>
                {cliItems.find(c => c.id === selectedCliId)?.name}
              </Text>
            </Text>
          )}
          {section === 'task' && taskItems[taskIndex]?.id && (
            <Text color={theme.textDim}>
              Task: <Text color={theme.text}>{taskItems[taskIndex].title}</Text>
            </Text>
          )}
        </Box>
      </Panel>

      <Divider width={50} />

      <Box gap={2}>
        <Text color={theme.accent}>[↑↓]</Text>
        <Text color={theme.textDim}>navigate</Text>
        <Text color={theme.accent}>[⏎]</Text>
        <Text color={theme.textDim}>select/launch</Text>
        <Text color={theme.accent}>[Esc]</Text>
        <Text color={theme.textDim}>back</Text>
      </Box>
    </Box>
  );
}

interface CliItem {
  id: string;
  name: string;
  available: boolean;
  version?: string;
  installUrl: string;
}

function buildCliItems(
  detected: DetectedCli[],
  allIds: string[],
  definitions: Map<string, { name: string; installUrl: string }>,
): CliItem[] {
  const items: CliItem[] = [];
  const detectedIds = new Set(detected.map(d => {
    // Find the id by matching the definition
    for (const [id, def] of definitions) {
      if (def.name === d.definition.name) return id;
    }
    return '';
  }));

  // Add detected CLIs first
  for (const d of detected) {
    let cliId = '';
    for (const [id, def] of definitions) {
      if (def.name === d.definition.name) {
        cliId = id;
        break;
      }
    }
    items.push({
      id: cliId,
      name: d.definition.name,
      available: true,
      version: d.version,
      installUrl: d.definition.installUrl,
    });
  }

  // Add unavailable CLIs
  for (const id of allIds) {
    if (!items.find(i => i.id === id)) {
      const def = definitions.get(id);
      if (def) {
        items.push({
          id,
          name: def.name,
          available: false,
          installUrl: def.installUrl,
        });
      }
    }
  }

  return items;
}
