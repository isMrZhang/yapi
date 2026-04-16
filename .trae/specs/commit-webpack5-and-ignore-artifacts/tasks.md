# Tasks
- [x] 任务 1：确认并整理待提交变更范围
  - [x] 识别“源代码/配置”与“构建产物”两类变更，确保构建产物不进入 commit
  - [x] 若仓库内历史上需要提交 `static/prd/`，则明确新的发布策略（本次以“不提交产物”为准）

- [x] 任务 2：更新 `.gitignore` 忽略构建产物
  - [x] 添加 `static/prd/`（以及必要的附属目录）到 `.gitignore`
  - [x] 清理当前工作区中已生成但不应提交的产物文件（保持工作区最终为“仅剩源代码/配置变更”）

- [x] 任务 3：全面代码评审
  - [x] 评审 Webpack 5 配置与分包策略是否满足 `static/index.html` 的 assets.js 加载约定
  - [x] 评审 scripts（generate-plugin-module、build-client、dev-client）是否可复现且无副作用
  - [x] 评审依赖升级的必要性与风险（Node 22/24）
  - [x] 评审安全风险（避免提交敏感信息、避免把 token/密钥写入仓库）
  - [x] 形成“通过/不通过”结论与必须修复项清单

- [x] 任务 4：验证（Node 22/24）
  - [x] Node 22：`npm ci --legacy-peer-deps` + `npm run build-client` + `npm run dev-client`（启动即可）
  - [x] Node 24：同上

- [x] 任务 5：提交与推送
  - [x] 按逻辑拆分提交（推荐：1 个 build/toolchain 提交；1 个 docs/spec 更新提交）
  - [x] push 到 GitHub 远端分支（不强推）

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 1、任务 2
- 任务 4 依赖 任务 2、任务 3
- 任务 5 依赖 任务 3、任务 4
