import { Box, Text, useApp, useInput } from 'ink';
import { useState } from 'react';
import { ThemeProvider, useTheme, Panel } from '@ditloop/ui';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { stringify as stringifyYaml } from 'yaml';

type Step = 'profile-name' | 'profile-email' | 'workspace-path' | 'confirm' | 'done';

/**
 * Interactive init wizard that creates a basic DitLoop config file.
 */
export function InitWizard() {
  return (
    <ThemeProvider>
      <InitWizardInner />
    </ThemeProvider>
  );
}

function InitWizardInner() {
  const theme = useTheme();
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('profile-name');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [workspacePath, setWorkspacePath] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useInput((ch, key) => {
    if (key.escape) {
      exit();
      return;
    }

    if (key.return) {
      handleSubmit();
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (ch && !key.ctrl && !key.meta) {
      setInput((prev) => prev + ch);
    }
  });

  const handleSubmit = async () => {
    setError('');
    const trimmed = input.trim();

    switch (step) {
      case 'profile-name':
        if (!trimmed) { setError('Profile name is required'); return; }
        setProfileName(trimmed);
        setInput('');
        setStep('profile-email');
        break;
      case 'profile-email':
        if (!trimmed || !trimmed.includes('@')) { setError('Valid email is required'); return; }
        setProfileEmail(trimmed);
        setInput('');
        setStep('workspace-path');
        break;
      case 'workspace-path':
        if (!trimmed) { setError('Workspace path is required'); return; }
        setWorkspacePath(trimmed);
        setInput('');
        setStep('confirm');
        break;
      case 'confirm':
        await writeConfig();
        setStep('done');
        setTimeout(() => exit(), 1000);
        break;
    }
  };

  const writeConfig = async () => {
    const configDir = join(homedir(), '.ditloop');
    const configPath = join(configDir, 'config.yml');

    const config = {
      profiles: {
        [profileName]: {
          name: profileName,
          email: profileEmail,
          platform: 'github',
        },
      },
      workspaces: [
        {
          name: 'My Workspace',
          type: 'single',
          path: workspacePath,
          profile: profileName,
        },
      ],
    };

    await mkdir(configDir, { recursive: true });
    await writeFile(configPath, stringifyYaml(config), 'utf-8');
  };

  const prompts: Record<Step, string> = {
    'profile-name': 'Profile name (e.g., personal, work):',
    'profile-email': 'Git email for this profile:',
    'workspace-path': 'Path to your first workspace:',
    confirm: 'Press Enter to create config, Esc to cancel',
    done: '',
  };

  return (
    <Panel title="ditloop init">
      <Box flexDirection="column" gap={1}>
        <Text color={theme.accent}>Initialize DitLoop configuration</Text>

        {step === 'done' ? (
          <Text color={theme.active}>Config created at ~/.ditloop/config.yml</Text>
        ) : (
          <>
            {profileName && <Text color={theme.textDim}>Profile: {profileName}</Text>}
            {profileEmail && <Text color={theme.textDim}>Email: {profileEmail}</Text>}
            {workspacePath && <Text color={theme.textDim}>Path: {workspacePath}</Text>}

            <Text color={theme.text}>{prompts[step]}</Text>

            {step !== 'confirm' && (
              <Text color={theme.accent}>{`> ${input}█`}</Text>
            )}

            {error && <Text color={theme.error}>{error}</Text>}
          </>
        )}
      </Box>
    </Panel>
  );
}
