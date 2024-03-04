// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').PluginModule} */
module.exports = function googleAdSensePlugin() {
  return {
    name: 'google-adsense-plugin',
    injectHtmlTags: () => ({
      headTags: [
        {
          tagName: 'script',
          attributes: {
            async: true,
            src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7076111885354414',
            crossorigin: 'anonymous',
          },
        },
      ],
    }),
  }
}
