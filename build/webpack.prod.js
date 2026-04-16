const { createWebpackConfig, withProdPlugins } = require('./webpack.common');

module.exports = () => {
  const config = createWebpackConfig({ mode: 'production' });
  config.devtool = false;
  config.output.clean = true;
  config.optimization.moduleIds = 'deterministic';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = false;
  return withProdPlugins(config);
};
