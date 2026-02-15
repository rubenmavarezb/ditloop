import { Box, Text } from 'ink';
import { ThemeProvider, useTheme, Panel } from '@ditloop/ui';
import type { Profile } from '@ditloop/core';

/** Props for the ProfileList command. */
export interface ProfileListProps {
  /** Profile entries as [name, profile] pairs. */
  profiles: [string, Profile][];
  /** Currently active profile name. */
  currentProfile?: string;
}

/**
 * CLI command that prints a table of configured profiles.
 */
export function ProfileList({ profiles, currentProfile }: ProfileListProps) {
  return (
    <ThemeProvider>
      <ProfileListInner profiles={profiles} currentProfile={currentProfile} />
    </ThemeProvider>
  );
}

function ProfileListInner({ profiles, currentProfile }: ProfileListProps) {
  const theme = useTheme();

  if (profiles.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={theme.textDim}>No profiles configured.</Text>
        <Text color={theme.textDim}>Run `ditloop init` to get started.</Text>
      </Box>
    );
  }

  return (
    <Panel title="Profiles" badge={String(profiles.length)}>
      <Box flexDirection="column">
        {profiles.map(([name, profile]) => (
          <Box key={name} gap={2}>
            <Text color={name === currentProfile ? theme.active : theme.text}>
              {name === currentProfile ? '● ' : '  '}
              {name}
            </Text>
            <Text color={theme.textDim}>{profile.email}</Text>
            <Text color={theme.textDim}>{profile.platform}</Text>
          </Box>
        ))}
      </Box>
    </Panel>
  );
}

/** Props for the ProfileCurrent command. */
export interface ProfileCurrentProps {
  /** Name of the active profile. */
  name?: string;
  /** Email of the active profile. */
  email?: string;
}

/**
 * CLI command that shows the current git profile.
 */
export function ProfileCurrent({ name, email }: ProfileCurrentProps) {
  return (
    <ThemeProvider>
      <ProfileCurrentInner name={name} email={email} />
    </ThemeProvider>
  );
}

function ProfileCurrentInner({ name, email }: ProfileCurrentProps) {
  const theme = useTheme();

  if (!name) {
    return <Text color={theme.textDim}>No active profile</Text>;
  }

  return (
    <Box gap={2}>
      <Text color={theme.active}>●</Text>
      <Text bold color={theme.text}>{name}</Text>
      {email && <Text color={theme.textDim}>{email}</Text>}
    </Box>
  );
}
