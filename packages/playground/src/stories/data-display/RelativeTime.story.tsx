import { Box, Text } from 'ink';
import { ThemeProvider, RelativeTime } from '@ditloop/ui';

const now = new Date();
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

export function RelativeTimeStory() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" gap={1}>
        <Box gap={2}>
          <Text>Just now:</Text>
          <RelativeTime date={now} />
        </Box>
        <Box gap={2}>
          <Text>5 min ago:</Text>
          <RelativeTime date={fiveMinAgo} />
        </Box>
        <Box gap={2}>
          <Text>1 hour ago:</Text>
          <RelativeTime date={oneHourAgo} />
        </Box>
        <Box gap={2}>
          <Text>Yesterday:</Text>
          <RelativeTime date={yesterday} />
        </Box>
        <Box gap={2}>
          <Text>3 weeks ago:</Text>
          <RelativeTime date={threeWeeksAgo} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
