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
  console.log('⏳ [2/3] 开始生成前端插件模块 (plugin-module.js)...');
  let configPlugin = readConfigPlugins();
  let systemConfigPlugin = require(path.join(rootDir, 'common', 'config.js')).exts;

  var scripts = [];
  let userPluginCount = 0;
  let sysPluginCount = 0;

  if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
    configPlugin = commonLib.initPlugins(configPlugin, 'plugin');
    configPlugin.forEach((plugin, index) => {
      if (plugin.client && plugin.enable) {
        scripts.push(createScript(plugin, 'node_modules'));
        userPluginCount++;
        console.log(`  └─ [用户插件] 处理进度: ${index + 1}/${configPlugin.length} -> ${plugin.name}`);
      }
    });
  }

  systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, 'ext');
  systemConfigPlugin.forEach((plugin, index) => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, 'exts'));
      sysPluginCount++;
      console.log(`  └─ [系统插件] 处理进度: ${index + 1}/${systemConfigPlugin.length} -> ${plugin.name}`);
    }
  });

  scripts = 'module.exports = {' + scripts.join(',') + '}';
  fs.writeFileSync(path.join(rootDir, 'client', 'plugin-module.js'), scripts);
  console.log(`✅ 插件模块生成完毕 (系统内置: ${sysPluginCount}, 用户自定义: ${userPluginCount}).\n`);
}

initPlugins();
