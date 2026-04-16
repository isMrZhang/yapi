# 升级前端构建工具链到 Webpack 5（Node 22+）Spec

## Why
当前前端构建链路依赖 `ykit@0.6.2 + webpack@2 + happypack + extract-text-webpack-plugin` 等早期生态，无法在 Node 22+ 下稳定运行，导致仓库在提升 Node 版本后无法完成前端构建与产物发布。

## What Changes
- 引入 Webpack 5 构建链路（webpack/webpack-cli/webpack-dev-server + 现代 loader/plugin）
- 将 `npm run build-client` 从 `ykit pack -m` 迁移到 Webpack 5 构建命令
- 将 `npm run dev-client` 从 `ykit s` 迁移到 Webpack Dev Server
- 保持产物结构尽量一致：
  - 输出目录仍为 `static/prd/`
  - 文件名规则尽量保持为 `[name]@[chunkhash].js|css`
  - 继续生成 `static/prd/assets.js` 并挂载 `window.WEBPACK_ASSETS`
- **BREAKING**：构建工具链升级将导致产物 hash 值变化、打包细节变化；若有依赖旧 build 行为的插件/脚本需要同步调整

## Impact
- Affected specs: 前端开发服务器、生产构建、静态资源引用、插件 client 端加载、压缩与 gzip 产物、发布流程
- Affected code:
  - [package.json](file:///workspace/package.json)
  - [ykit.config.js](file:///workspace/ykit.config.js)
  - 新增 Webpack 5 配置文件（例如 `build/webpack.*.js` 或仓库根 `webpack.config.js`）
  - `client/` 入口与路由（用于确认 entrypoints）
  - `static/prd/` 产物生成逻辑（assets.js、gzip）

## ADDED Requirements
### Requirement: Node 22+ 可构建
系统 SHALL 在 Node 22+ 环境下成功执行前端生产构建命令并生成 `static/prd` 产物。

#### Scenario: 生产构建成功
- **WHEN** 在 Node 22+ 运行 `npm run build-client`
- **THEN** `static/prd/` 目录生成 js/css 产物
- **AND** `static/prd/assets.js` 生成且包含 `window.WEBPACK_ASSETS = {...}` 结构

### Requirement: Node 22+ 可开发
系统 SHALL 在 Node 22+ 环境下启动前端开发服务器，并可通过浏览器访问。

#### Scenario: 开发服务器启动成功
- **WHEN** 在 Node 22+ 运行 `npm run dev-client`
- **THEN** 控制台输出可访问的本地地址与端口
- **AND** 页面可加载基础资源（不要求在本阶段修复全部运行时业务 bug）

## MODIFIED Requirements
### Requirement: 插件 client 端注入
现有 “根据插件配置生成 `client/plugin-module.js`” 的能力 SHALL 保持可用，并在新构建链路下仍可被打包引用。

#### Scenario: 插件 module 生成与打包
- **WHEN** 构建前执行插件 module 生成逻辑
- **THEN** `client/plugin-module.js` 正确生成
- **AND** 构建产物可正确引用插件 client 代码

### Requirement: gzip 产物
现有对 `prd` 产物的 gzip 生成能力 SHOULD 保持（可通过 Webpack 5 插件实现）。

## REMOVED Requirements
### Requirement: ykit 作为主构建入口
**Reason**: ykit 绑定早期 webpack/babel 生态，无法满足 Node 22+ 兼容与长期维护。
**Migration**: 以 Webpack 5 CLI/DevServer 替换 `ykit pack/s`，并在脚本层保持命令语义一致（build-client/dev-client）。

