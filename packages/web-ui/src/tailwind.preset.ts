import type { Config } from 'tailwindcss';

/** Shared DitLoop Tailwind CSS preset with brand colors and utilities. */
export const ditloopPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ditloop: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
          950: '#0f172a',
        },
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        tap: '44px',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;
