const webpack = require('webpack');
const config = require('./build/webpack.prod.js');
webpack(config, (err, stats) => {
  if (err) { console.error(err.stack || err); return; }
  const info = stats.toJson();
  if (stats.hasErrors()) { console.error(info.errors); }
  if (stats.hasWarnings()) { console.warn(info.warnings); }
});
