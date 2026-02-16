import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'DitLoop',
  description: 'Terminal IDE — Developer In The Loop',
  base: '/ditloop/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ditloop/favicon.svg' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'CLI Reference', link: '/guide/cli-reference' },
      { text: 'AIDF', link: '/aidf/overview' },
      {
        text: 'GitHub',
        link: 'https://github.com/rubenmavarezb/ditloop',
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Architecture', link: '/guide/architecture' },
          { text: 'CLI Reference', link: '/guide/cli-reference' },
        ],
      },
      {
        text: 'AIDF',
        items: [
          { text: 'Overview', link: '/aidf/overview' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rubenmavarezb/ditloop' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025 Ruben Mavarez',
    },
  },
});
