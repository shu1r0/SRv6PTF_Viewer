module.exports = {
  assetsDir: 'static',
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "./src/assets/scss/prepends.scss";'
      }
    }
  }
};