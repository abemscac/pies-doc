// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Pies Doc',
  tagline: 'A handbook about the fundamentals of web development.',
  url: 'https://piesdoc.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'abemscac', // Usually your GitHub org/user name.
  projectName: 'pies-doc', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hant', 'zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/abemscac/pies-doc/blob/main',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-NZV61CX8T7',
          anonymizeIP: true,
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content:
            'piesdoc, web development tutorial, vue3 tutorial, react tutorial',
        },
      ],
      navbar: {
        title: 'Pies Doc',
        logo: {
          alt: 'Pies Doc Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'introduction',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsAfter: [
              {
                to: 'https://github.com/abemscac/pies-doc/issues/26',
                label: '🌐 Help us translate!',
              },
            ],
          },
          {
            href: 'https://github.com/abemscac/pies-doc',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction',
              },
              {
                label: 'Vue 3',
                to: '/docs/category/vue3',
              },
              {
                label: 'React',
                to: '/docs/category/react',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/abemscac/pies-doc',
              },
            ],
          },
        ],
        copyright: `Copyright © 2022 Pies Doc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'RDT9BID7L2',
        apiKey: '8e6e4b2423171ecafbbe4a4d95322cdd',
        indexName: 'pies',
      },
    }),
}

module.exports = config
