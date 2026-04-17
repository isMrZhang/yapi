# Webpack 5 Residual Issues Spec

## Why
项目升级到 Webpack 5 后，移除了自动对 Node.js 核心模块（如 `Buffer`、`process` 等）注入全局变量的功能。虽然我们在 `webpack.common.js` 中配置了 `fallback` 映射（如 `buffer: require.resolve('buffer/')`），但某些旧版或特定的第三方前端库代码可能依赖于全局环境直接存在 `Buffer` 或 `process`。如果不显式注入这些全局变量，这些代码在浏览器端执行时会抛出 `Buffer is not defined` 或 `process is not defined` 等未捕获的错误。

## What Changes
- 修改 `build/webpack.common.js` 中的 `plugins` 配置，引入 `webpack.ProvidePlugin`。
- 将 `Buffer` 指向 `['buffer', 'Buffer']`。
- 将 `process` 指向 `'process/browser'`。
- 在 `package.json` 中检查并确保安装 `process` 包作为开发依赖，以确保能够被正确解析注入。

## Impact
- Affected specs: 修复潜在的浏览器端由于缺少 Node.js 环境全局变量而导致的崩溃风险，提升构建产物的浏览器兼容性。
- Affected code:
  - `build/webpack.common.js`
  - `package.json` (如果缺少依赖)

## ADDED Requirements
### Requirement: 核心变量注入
系统在前端构建时 SHALL 通过 ProvidePlugin 自动注入 `Buffer` 和 `process` 全局对象，确保老旧第三方依赖在浏览器环境能够正常执行。