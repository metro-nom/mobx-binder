module.exports = {
  siteMetadata: {
    title: "mobx-binder",
  },
  plugins: [
    'gatsby-theme-docz',
    // "gatsby-plugin-mdx",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
  ],
};
