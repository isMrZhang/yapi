# Webpack5 构建改动评审与提交 Spec

## Why
当前已完成从 ykit/webpack2 迁移到 Webpack 5 的构建工具链升级，但工作区存在未提交变更与构建产物文件。需要在提交前完成系统性代码评审，并确保生成的构建产物目录被忽略不进入版本库，然后再进行规范化提交与推送。

## What Changes
- 补充 `.gitignore`：忽略 Webpack 5 生成的构建产物目录（例如 `static/prd/`）与其它构建临时产物，确保不被提交
- 对当前工作区改动进行全面代码评审（构建链路、脚本、依赖升级、后端静态资源加载、插件 module 生成、兼容性与安全）
- **BREAKING**：如评审发现阻塞项，新增修复提交（禁止 rebase/amend/force push），确保最终状态可构建可运行
- 将通过评审的改动提交到 Git，并推送到 GitHub 远端分支

## Impact
- Affected specs: 前端构建（dev/prod）、产物加载（assets.js）、插件 client 注入、后端静态资源访问、依赖安装（Node 22/24）
- Affected code:
  - [package.json](file:///workspace/package.json)
  - [build/*](file:///workspace/build)
  - [scripts/generate-plugin-module.js](file:///workspace/scripts/generate-plugin-module.js)
  - [static/index.html](file:///workspace/static/index.html)
  - [static/dev.html](file:///workspace/static/dev.html)
  - [.gitignore](file:///workspace/.gitignore)

## ADDED Requirements
### Requirement: 构建产物不入库
系统 SHALL 将 Webpack 构建输出目录加入 `.gitignore`，并确保工作区中生成的构建产物不会被纳入提交。

#### Scenario: 忽略生效
- **WHEN** 运行 `npm run build-client` 或 `npm run dev-client`
- **THEN** 生成的 `static/prd/` 及其内容不会出现在 `git status` 的 staged/unstaged 变更中

### Requirement: 评审与提交
系统 SHALL 在评审通过后完成一次或多次逻辑清晰的 Git 提交，并推送到 GitHub。

#### Scenario: 提交与推送成功
- **WHEN** 完成代码评审并执行 commit + push
- **THEN** 远端分支包含对应提交

## MODIFIED Requirements
### Requirement: 构建链路可复现
构建链路 SHALL 在 Node 22/24 下可复现：
- `npm ci --legacy-peer-deps`
- `npm run build-client`
- `npm run dev-client`（启动即可）

## REMOVED Requirements
无

