import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '@ditloop/ui';

/** Props for the SidebarPanel component. */
export interface SidebarPanelProps {
  /** Available width in columns. */
  width: number;
  /** Available height in rows. */
  height: number;
  /** Workspace entries to display. */
  workspaces?: Array<{
    name: string;
    branch?: string;
    email?: string;
    active?: boolean;
    /** Platform badge: "gh" (GitHub), "bb" (Bitbucket), "az" (Azure). */
    platform?: string;
  }>;
  /** Active tab selection. */
  activeTab?: 'workspaces' | 'explorer';
  /** AIDF context information. */
  aidfContext?: { role?: string; task?: string; plan?: string };
  /** Callback when a workspace is selected. */
  onWorkspaceSelect?: (name: string) => void;
}

/**
 * Build a centered section divider: ───── LABEL ────────
 */
function sectionDivider(label: string, totalWidth: number): string {
  const padded = ` ${label} `;
  const remaining = Math.max(0, totalWidth - padded.length);
  const left = Math.floor(remaining * 0.15);
  const right = remaining - left;
  return `${'─'.repeat(left)}${padded}${'─'.repeat(right)}`;
}

/**
 * Returns a branch color based on branch naming convention.
 */
function branchColor(branch: string, theme: ReturnType<typeof useTheme>): string {
  if (branch.startsWith('feat/')) return theme.warningDark;
  if (branch.startsWith('hotfix/') || branch.startsWith('fix/')) return theme.errorDark;
  return theme.textDim;
}

/**
 * Sidebar panel matching the Figma left pane design. Shows workspace list
 * with box-drawing borders, tabs, quick actions, and AIDF context.
 */
export function SidebarPanel({
  width,
  height,
  workspaces = [],
  activeTab = 'workspaces',
  aidfContext,
  onWorkspaceSelect,
}: SidebarPanelProps) {
  const theme = useTheme();
  const innerWidth = Math.max(4, width - 4);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (workspaces.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(workspaces.length - 1, prev + 1));
    } else if (key.return) {
      onWorkspaceSelect?.(workspaces[selectedIndex]?.name ?? '');
    }
  });

  const titlePad = Math.max(0, innerWidth - 10);
  const topBorder = `┌─ DITLOOP ${'─'.repeat(titlePad)}┐`;
  const bottomBorder = `└${'─'.repeat(innerWidth + 2)}┘`;

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Title border */}
      <Text color={theme.active}>{topBorder}</Text>

      {/* Tab bar */}
      <Box paddingLeft={1}>
        {activeTab === 'workspaces' ? (
          <Text backgroundColor={theme.active} color="#000000" bold> [W] WORKSPACES </Text>
        ) : (
          <Text color={theme.textDim}> [W] WORKSPACES </Text>
        )}
        <Text>  </Text>
        {activeTab === 'explorer' ? (
          <Text backgroundColor={theme.active} color="#000000" bold> [E] EXPLORER </Text>
        ) : (
          <Text color={theme.textDim}>[E] EXPLORER</Text>
        )}
      </Box>

      {/* Workspace list */}
      <Box flexDirection="column" paddingLeft={1} paddingRight={1} marginTop={1}>
        {workspaces.length === 0 && (
          <Text color={theme.textDim}>  No workspaces</Text>
        )}
        {workspaces.map((ws, i) => {
          const isSelected = i === selectedIndex;
          const nameColor = isSelected ? theme.active : theme.textDim;
          return (
            <Box key={ws.name} flexDirection="column">
              {/* Line 1: indicator + number + name ... branch [platform] */}
              <Box>
                <Text color={isSelected ? theme.active : theme.textDim}>
                  {isSelected ? '>' : ' '} </Text>
                <Text color={nameColor} bold>
                  {i + 1} {ws.name}
                </Text>
                <Box flexGrow={1} />
                {ws.branch && (
                  <Text color={branchColor(ws.branch, theme)}>{ws.branch}</Text>
                )}
                {ws.platform && (
                  <>
                    <Text> </Text>
                    <Text backgroundColor={theme.bgMuted} color={theme.textDim}> {ws.platform} </Text>
                  </>
                )}
              </Box>
              {/* Line 2: email */}
              {ws.email && (
                <Text color={theme.textDim}>    {ws.email}</Text>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quick Actions */}
      <Box flexDirection="column" paddingLeft={1} paddingRight={1} marginTop={1}>
        <Text color={theme.textDim}>{sectionDivider('QUICK ACTIONS [A]', innerWidth)}</Text>
        <Text color={theme.text}>  [n] New Project</Text>
        <Text color={theme.text}>  [c] Clone Repo</Text>
        <Text color={theme.text}>  [s] Switch Context</Text>
        <Text color={theme.text}>  [l] Launch AI CLI</Text>
      </Box>

      {/* AIDF Context */}
      <Box flexDirection="column" paddingLeft={1} paddingRight={1} marginTop={1}>
        <Text color={theme.textDim}>{sectionDivider('AIDF CONTEXT', innerWidth)}</Text>
        {aidfContext?.role && (
          <Box>
            <Text color={theme.active}> ✦ </Text>
            <Text color={theme.text}>Role: {aidfContext.role}</Text>
          </Box>
        )}
        {aidfContext?.task && (
          <Box>
            <Text color={theme.active}> ✦ </Text>
            <Text color={theme.text}>Task: {aidfContext.task}</Text>
          </Box>
        )}
        {aidfContext?.plan && (
          <Box>
            <Text color={theme.active}> ✦ </Text>
            <Text color={theme.text}>Plan: {aidfContext.plan}</Text>
          </Box>
        )}
        {!aidfContext?.role && !aidfContext?.task && !aidfContext?.plan && (
          <Text color={theme.textDim}>  No active context</Text>
        )}
        <Box marginTop={1}>
          <Text backgroundColor={theme.bgMuted} color={theme.text}> [e] Edit Context </Text>
        </Box>
      </Box>

      {/* Spacer to push footer to bottom */}
      <Box flexGrow={1} />

      {/* Footer border */}
      <Text color={theme.border}>{bottomBorder}</Text>
    </Box>
  );
}
