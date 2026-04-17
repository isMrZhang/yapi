# Fix Build and Startup Warnings Spec

## Why
在运行 `pnpm run build-client` 和开发环境启动时，控制台输出了大量的警告信息（多达 73 条）。这些警告主要来自于 Dart Sass 的废弃语法（如旧版 JS API、`@import` 的废弃、以及除法 `/` 的使用）以及 Webpack 5 对 ES Module 严格模式下找不到导出模块（`export ... was not found`）的警告。逐项清理这些警告可以保持控制台整洁，提升开发体验，并避免未来依赖升级时导致构建直接崩溃。

## What Changes
- **Sass Loader 配置更新**：修改 `build/webpack.common.js` 中的 `sass-loader` 配置，启用 `modern-compiler` API，并通过 `sassOptions.silenceDeprecations` 屏蔽难以一次性全量替换的 `legacy-js-api`, `import`, `global-builtin` 废弃警告。
- **Sass 语法更新**：在 `client/components/Loading/Loading.scss` 中引入 `@use "sass:math";`，使用 `math.div` 替换废弃的 `/` 除法操作。
- **修复 Webpack 导出警告**：
  - 修正 `client/components/Postman/CheckCrossInstall.js` 中 `initCrossRequest` 的混合导出问题（将 `exports.` 改为 ES6 的 `export const`）。
  - 从 `client/containers/Group/GroupList/GroupList.js` 及其它相关组件中移除未定义且未使用的 `setGroupList` 导入。
  - 从 `client/containers/Group/ProjectList/ProjectList.js` 中移除未定义且未使用的 `changeUpdateModal` 导入。
  - 从 `client/containers/Project/Interface/InterfaceCol/InterfaceColMenu.js` 中移除未定义且未使用的 `fetchInterfaceCaseList` 导入。
  - 在 `exts/yapi-plugin-advanced-mock/client.js` 和 `exts/yapi-plugin-import-swagger/client.js` 中，将对 CommonJS 模块的 ES 导入（`import AdvMock from ...`）改为 CommonJS 导入（`const AdvMock = require(...)`），解决模块无 `default` 导出的警告。

## Impact
- Affected specs: 无功能影响，纯工程化和构建配置的优化。
- Affected code:
  - `build/webpack.common.js`
  - `client/components/Loading/Loading.scss`
  - `client/components/Postman/CheckCrossInstall.js`
  - `client/containers/Group/GroupList/GroupList.js`
  - `client/containers/Group/ProjectList/ProjectList.js`
  - `client/containers/Project/Interface/InterfaceCol/InterfaceColMenu.js`
  - `exts/yapi-plugin-advanced-mock/client.js`
  - `exts/yapi-plugin-import-swagger/client.js`

## ADDED Requirements
无新增需求。

## MODIFIED Requirements
### Requirement: 构建警告清理
系统应当在执行 `pnpm run build-client` 和 `pnpm run dev-client` 时不产生因废弃 API 或模块导出错误导致的警告，确保控制台输出清晰。
