# 白屏及模块化报错全面评审修复 Spec

## Why
在开发环境启动后（访问 3000 端口），出现前端白屏并伴随连续的控制台报错，主要表现为：
1. **静态资源 404**：`lib3@dev.js` 等基础包未能成功加载。
2. **TypeError 白屏崩溃**：前端 `index.html` 找不到挂载的包资源变量导致 JS 执行中断。
3. **ReferenceError: exports is not defined**：`CheckCrossInstall.js` 和 `postmanLib.js` 等在浏览器环境运行时找不到 `exports` 对象。
4. **Webpack 严格 ESM 告警/错误**：`manifest@dev.js:170 Uncaught Error: ES Modules may not assign module.exports or exports.*`，表明文件被错误地识别成了 ES Module 且使用了 CommonJS 的导出语法。

这些问题是由于将包管理器切换至 `pnpm`（目录结构变深）、升级到 Webpack 5（更严格的 ESM/CJS 混合限制）以及 Babel 默认的模块解析策略共同导致的。必须进行全面彻底的修复，才能保证应用恢复正常运行并符合最佳实践。

## What Changes
- **修复 Pnpm 路径匹配逻辑**：重写 `build/webpack.common.js` 中 `getPackageName` 的正则，兼容 `pnpm` 深层虚拟目录 (`.pnpm/...`)，使 Webpack `splitChunks` 能够正确提取 `lib`、`lib2`、`lib3`。
- **纯粹化前端组件的 ES 模块化**：将 `client/components/Postman/CheckCrossInstall.js` 中遗留的 `exports.initCrossRequest = ...` 更改为纯正的 `export const initCrossRequest`，符合 ES Module 规范，消除混合使用造成的 ReferenceError 和 Webpack Warning。
- **纯粹化 Node/Browser 共享库的 CJS 模块化**：将 `common/postmanLib.js` 结尾的松散 `exports.xxx = ...` 收敛为规范的 `module.exports = { ... }`。
- **配置 Babel 防止模块劫持**：在 `build/webpack.common.js` 的 `babel-loader` 中添加 `sourceType: 'unambiguous'`，明确指示 Babel 只有在见到 `import/export` 时才视其为 ES Module，否则当作 CommonJS。这彻底解决了 Webpack 5 拦截 `module.exports` 的问题。

## Impact
- Affected specs: 恢复前端界面的正常挂载和渲染，彻底消除白屏故障。
- Affected code:
  - `build/webpack.common.js` (分包正则 & Babel Loader)
  - `client/components/Postman/CheckCrossInstall.js` (导出语法)
  - `common/postmanLib.js` (导出语法)
  - 以及关联的未使用/失效的组件 `import` 引用 (如 `GroupList`, `ProjectList`, `InterfaceColMenu` 等)。

## ADDED Requirements
### Requirement: 严格的模块化校验
系统构建过程 SHALL 在 Webpack 5 环境下无模块导出混用 Warning（如 export 'xxx' was not found）。

## MODIFIED Requirements
### Requirement: 第三方库分包
Webpack `splitChunks` 机制 SHALL 兼容 `pnpm` `.pnpm/` 的虚拟路径结构，保证基础库（React、lodash、axios 等）能够被正确切分并输出为独立的文件。