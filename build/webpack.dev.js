const { createWebpackConfig } = require('./webpack.common');

module.exports = () => {
  const config = createWebpackConfig({ mode: 'development' });
  config.devtool = 'eval-cheap-module-source-map';
  config.output.clean = false;
  config.devServer = {
    host: '127.0.0.1',
    port: 4000,
    hot: true,
    compress: false,
    allowedHosts: 'all',
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: [{ directory: require('path').join(__dirname, '..', 'static'), publicPath: '/' }],
    client: { overlay: false },
    devMiddleware: { publicPath: '/prd/' }
  };
  config.optimization.moduleIds = 'named';
  config.optimization.chunkIds = 'named';
  return config;
};
