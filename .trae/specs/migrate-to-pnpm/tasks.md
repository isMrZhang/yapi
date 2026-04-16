# Tasks
- [x] 任务 1：现状评估与迁移策略选型
  - [x] 盘点依赖安装入口：本地开发、CI、发布脚本（例如 `npm-publish.js`）、文档指引
  - [x] 识别对 npm/扁平 node_modules 的隐式假设点，并形成“风险点清单 + 验证方式”
  - [x] 确定 pnpm 基线版本与启用方式（Corepack + `packageManager`）

- [x] 任务 2：引入 pnpm 与锁文件迁移
  - [x] 在 `package.json` 中固化 `packageManager`（pnpm 版本）
  - [x] 生成 `pnpm-lock.yaml` 并纳入版本库
  - [x] 移除 `package-lock.json`（避免双锁文件导致解析漂移）

- [x] 任务 3：脚本与工具链改造（去 npm 硬编码）
  - [x] 将 `package.json` scripts 中的 `npm run ...` 调整为 `pnpm run ...`（保持 script 名称不变）
  - [x] 评估并改造 `npm-publish.js`：安装/构建链路切换到 pnpm；对发布动作选择 `pnpm publish` 或保留 `npm publish` 但隔离说明

- [x] 任务 4：CI 迁移到 pnpm（Node 22/24）
  - [x] CI 安装 pnpm（Corepack）并启用缓存策略
  - [x] 将 `npm ci/test/build` 替换为 `pnpm install --frozen-lockfile` + `pnpm test` + `pnpm run build-client`
  - [x] 更新 dev-client 冒烟为 pnpm 版本

- [x] 任务 5：文档迁移与使用指引
  - [x] 更新 README / docs 中的安装与运行命令为 pnpm（必要时保留 npm 兼容写法）
  - [x] 增加“pnpm 常见问题”小节：Corepack、Windows/容器权限、hoist 策略等

- [x] 任务 6：回归验证与兼容性收敛
  - [x] 在干净环境验证 `pnpm install --frozen-lockfile`
  - [x] 验证 `pnpm test`、`pnpm run build-client`
  - [x] 验证 `pnpm run dev-client` 最小启动冒烟（timeout）
  - [x] 如出现依赖解析/运行时缺包问题：通过补齐依赖声明或最小化 hoist 配置收敛，并补充回归用例/说明

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 2
- 任务 4 依赖 任务 2
- 任务 5 依赖 任务 2
- 任务 6 依赖 任务 3、任务 4、任务 5
