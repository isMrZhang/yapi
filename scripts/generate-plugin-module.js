const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const commonLib = require(path.join(rootDir, 'common', 'plugin.js'));

function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === 'node_modules') {
    return `"${plugin.name}" : {module: require('yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
  }
  return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
}

function readConfigPlugins() {
  const configPath = path.join(rootDir, 'config.json');
  if (!fs.existsSync(configPath)) return [];
  let content;
  try {
    content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    return [];
  }
  if (!content || typeof content !== 'object') return [];
  return content.plugins;
}

function initPlugins() {
  let configPlugin = readConfigPlugins();
  let systemConfigPlugin = require(path.join(rootDir, 'common', 'config.js')).exts;

  var scripts = [];
  if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
    configPlugin = commonLib.initPlugins(configPlugin, 'plugin');
    configPlugin.forEach(plugin => {
      if (plugin.client && plugin.enable) {
        scripts.push(createScript(plugin, 'node_modules'));
      }
    });
  }

  systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, 'ext');
  systemConfigPlugin.forEach(plugin => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, 'exts'));
    }
  });

  scripts = 'module.exports = {' + scripts.join(',') + '}';
  fs.writeFileSync(path.join(rootDir, 'client', 'plugin-module.js'), scripts);
}

initPlugins();
