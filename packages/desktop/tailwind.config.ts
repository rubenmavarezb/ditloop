import type { Config } from 'tailwindcss';
import { ditloopPreset } from '@ditloop/web-ui';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../web-ui/src/**/*.{ts,tsx}',
  ],
  presets: [ditloopPreset as Config],
  plugins: [],
} satisfies Config;
