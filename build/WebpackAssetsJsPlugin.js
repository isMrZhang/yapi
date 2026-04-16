const { RawSource } = require('webpack').sources;

class WebpackAssetsJsPlugin {
  constructor(options = {}) {
    this.filename = options.filename || 'assets.js';
    this.globalVar = options.globalVar || 'WEBPACK_ASSETS';
    this.nameMap = options.nameMap || {};
    this.filter = options.filter || (() => true);
  }

  apply(compiler) {
    const pluginName = 'WebpackAssetsJsPlugin';
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const { Compilation } = compiler.webpack;
      compilation.hooks.processAssets.tap(
        { name: pluginName, stage: Compilation.PROCESS_ASSETS_STAGE_REPORT },
        () => {
          const assets = {};
          for (const chunk of compilation.chunks) {
            if (!chunk.name) continue;
            const mappedName = this.nameMap[chunk.name] || chunk.name;
            if (!this.filter(mappedName, chunk.name)) continue;
            const files = Array.from(chunk.files || []);
            const js = files.find(f => f.endsWith('.js'));
            const css = files.find(f => f.endsWith('.css'));
            if (!js && !css) continue;
            const record = {};
            if (js) record.js = js;
            if (css) record.css = css;
            assets[mappedName] = record;
          }
          const content = `window.${this.globalVar} = ${JSON.stringify(assets)}`;
          compilation.emitAsset(this.filename, new RawSource(content));
        }
      );
    });
  }
}

module.exports = WebpackAssetsJsPlugin;
