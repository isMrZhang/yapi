const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackAssetsJsPlugin = require('./WebpackAssetsJsPlugin');

const rootDir = path.resolve(__dirname, '..');
const pkg = require(path.join(rootDir, 'package.json'));

let versionNotify = false;
try {
  versionNotify = require(path.join(rootDir, 'server', 'yapi.js')).WEBCONFIG.versionNotify;
} catch (e) {}

const vendors = {
  lib: [
    'react',
    'react-dom',
    'redux',
    'redux-promise',
    'react-router',
    'react-router-dom',
    'prop-types',
    'react-dnd-html5-backend',
    'react-dnd',
    'reactabular-table',
    'reactabular-dnd',
    'table-resolver'
  ],
  lib2: ['brace', 'json5', 'url', 'axios'],
  lib3: ['mockjs', 'moment', 'recharts']
};

function getPackageName(module) {
  if (!module.context) return null;
  const context = module.context;
  const match = context.match(/[\\/]node_modules[\\/](?!.*[\\/]node_modules[\\/])(@[^\\/]+[\\/][^\\/]+|[^\\/]+)/);
  if (match) return match[1];
  return null;
}

function createCacheGroup(name, packages, priority) {
  const set = new Set(packages);
  return {
    name,
    chunks: 'all',
    enforce: true,
    priority,
    test: module => {
      const packageName = getPackageName(module);
      return !!packageName && set.has(packageName);
    }
  };
}

function createBabelRule() {
  const isAllowedNodeModules = filePath =>
    /node_modules[\\/](?:_?yapi-plugin|json-schema-editor-visual)[\\/]/.test(filePath);
  return {
    test: /\.(js|jsx)$/,
    exclude: filePath => {
      if (/tui-editor/.test(filePath)) return true;
      if (!/node_modules/.test(filePath)) return false;
      return !isAllowedNodeModules(filePath);
    },
    use: {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        configFile: false,
        sourceType: 'unambiguous',
        presets: [
          ['@babel/preset-env', { modules: false, loose: true }],
          ['@babel/preset-react', { runtime: 'classic' }]
        ],
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-transform-runtime', { helpers: true, regenerator: true }],
          ['import', { libraryName: 'antd', style: true }]
        ]
      }
    }
  };
}

function createStyleRule({ test, preProcessor }) {
  const loaders = [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: { sourceMap: true, url: { filter: url => !url.startsWith('/') } }
    }
  ];
  if (preProcessor) loaders.push(preProcessor);
  return { test, use: loaders };
}

function createWebpackConfig({ mode }) {
  const isDev = mode === 'development';
  const outputDir = path.join(rootDir, 'static', 'prd');
  const filename = isDev ? '[name]@dev.js' : '[name]@[contenthash:20].js';
  const cssFilename = isDev ? '[name]@dev.css' : '[name]@[contenthash:20].css';

  const config = {
    mode,
    context: path.join(rootDir, 'client'),
    entry: {
      index: path.join(rootDir, 'client', 'index.js')
    },
    output: {
      path: outputDir,
      publicPath: '/prd/',
      filename,
      chunkFilename: filename,
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]'
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        common: path.join(rootDir, 'common'),
        client: path.join(rootDir, 'client'),
        exts: path.join(rootDir, 'exts')
      },
      fallback: {
        buffer: require.resolve('buffer/'),
        child_process: false,
        crypto: false,
        fs: false,
        https: false,
        net: false,
        path: false,
        stream: false,
        tls: false,
        vm: false
      }
    },
    module: {
      noParse: /node_modules[\\/]jsondiffpatch[\\/]public[\\/]build[\\/].*\.js/,
      rules: [
        {
          test: /json-schema-editor-visual[\\/]package[\\/]index\.js$/,
          type: 'javascript/auto'
        },
        createBabelRule(),
        createStyleRule({
          test: /\.css$/,
          preProcessor: null
        }),
        createStyleRule({
          test: /\.less$/,
          preProcessor: {
            loader: 'less-loader',
            options: { sourceMap: true, lessOptions: { javascriptEnabled: true } }
          }
        }),
        createStyleRule({
          test: /\.(sass|scss)$/,
          preProcessor: { loader: 'sass-loader', options: { sourceMap: true, api: 'modern-compiler', sassOptions: { silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'] } } }
        }),
        {
          test: /\.(gif|jpe?g|png|woff2?|eot|ttf|svg)$/,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 8192 } }
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'], process: 'process/browser' }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'dev' : 'production'),
        'process.env.version': JSON.stringify(pkg.version),
        'process.env.versionNotify': JSON.stringify(versionNotify)
      }),
      new webpack.NormalModuleReplacementPlugin(/server[\\/]+yapi$/, path.join(__dirname, 'stubs', 'server-yapi.js')),
      new MiniCssExtractPlugin({
        filename: cssFilename,
        chunkFilename: cssFilename
      }),
      new WebpackAssetsJsPlugin({
        filename: 'assets.js',
        globalVar: 'WEBPACK_ASSETS',
        nameMap: { index: 'index.js' },
        filter: name => ['index.js', 'lib', 'lib2', 'lib3', 'manifest'].includes(name)
      }),
      new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(zh-cn|en-gb)$/)
    ],
    optimization: {
      nodeEnv: false,
      runtimeChunk: { name: 'manifest' },
      splitChunks: {
        cacheGroups: {
          lib3: createCacheGroup('lib3', vendors.lib3, 30),
          lib2: createCacheGroup('lib2', vendors.lib2, 20),
          lib: createCacheGroup('lib', vendors.lib, 10),
          default: false
        }
      }
    },
    performance: { hints: false },
    stats: { errorDetails: true }
  };

  const poll = process.env.WEBPACK_WATCH_POLL || process.env.WATCHPACK_POLLING;
  if (poll) {
    config.watchOptions = {
      poll: Number(poll) || 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/
    };
  }

  return config;
}

function withProdPlugins(config) {
  config.plugins = config.plugins.concat([
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.8,
      filename: '[path][base].gz'
    })
  ]);
  return config;
}

module.exports = { createWebpackConfig, withProdPlugins };
