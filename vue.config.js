const path = require('path')
module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    devtool: 'source-map'
  },
  pwa: {
    name: "acqua",
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: path.resolve(__dirname, 'src/service-worker.js')
    }
  }
};
