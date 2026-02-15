import { Box, Text } from 'ink';
import { useTheme, Divider } from '@ditloop/ui';
import { useAppStore } from '../../state/app-store.js';

const LOGO = `
  ╔═══════════════════════╗
  ║     ◉  ditloop        ║
  ║   Developer In The    ║
  ║       Loop            ║
  ╚═══════════════════════╝
`.trim();

/**
 * Home view showing welcome screen with logo and workspace summary.
 */
export function Home() {
  const theme = useTheme();
  const workspaces = useAppStore((s) => s.workspaces);
  const profile = useAppStore((s) => s.currentProfile);

  const activeCount = workspaces.filter((w) => w.status === 'active').length;
  const totalCount = workspaces.length;

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
      <Text color={theme.accent}>{LOGO}</Text>

      <Divider width={35} />

      <Box flexDirection="column" gap={1}>
        <Text color={theme.text}>
          Workspaces: <Text bold>{totalCount}</Text>
          {activeCount > 0 && (
            <Text color={theme.active}> ({activeCount} active)</Text>
          )}
        </Text>

        {profile && (
          <Text color={theme.textDim}>
            Profile: <Text color={theme.text}>{profile}</Text>
          </Text>
        )}
      </Box>

      <Divider width={35} />

      <Box flexDirection="column">
        <Text color={theme.textDim}>Quick actions:</Text>
        <Text color={theme.accent}> [↑↓] </Text>
        <Text color={theme.textDim}>Navigate workspaces</Text>
        <Text color={theme.accent}> [→]  </Text>
        <Text color={theme.textDim}>Expand group</Text>
        <Text color={theme.accent}> [⏎]  </Text>
        <Text color={theme.textDim}>Select workspace</Text>
        <Text color={theme.accent}> [q]  </Text>
        <Text color={theme.textDim}>Quit</Text>
      </Box>
    </Box>
  );
}
