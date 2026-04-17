# Tasks
- [x] Task 1: 修复 Pnpm 目录结构下 Webpack 分包失败问题
  - [x] SubTask 1.1: 审查 `build/webpack.common.js` 的 `getPackageName` 函数，确保使用兼容 `.pnpm` 的正则表达式 `/[\\/]node_modules[\\/](?!.*[\\/]node_modules[\\/])(@[^\\/]+[\\/][^\\/]+|[^\\/]+)/`。
  
- [x] Task 2: 修复组件和公共库中的 ESM / CommonJS 混用崩溃
  - [x] SubTask 2.1: 审查并确保 `client/components/Postman/CheckCrossInstall.js` 使用 `export const` 代替 `exports.`。
  - [x] SubTask 2.2: 审查并确保 `common/postmanLib.js` 使用统一的 `module.exports = { ... }` 导出对象。
  - [x] SubTask 2.3: 审查并确保项目中那些无效的 `import` 引用（如 `setGroupList`、`changeUpdateModal` 等）已被移除。

- [x] Task 3: 配置 Babel 解析策略防劫持
  - [x] SubTask 3.1: 审查 `build/webpack.common.js` 的 `babel-loader` 配置，确保已配置 `sourceType: 'unambiguous'`，避免纯 CJS 文件被注入 ESM 的 import 语句。

# Task Dependencies
无。所有任务可独立检查或并行应用。