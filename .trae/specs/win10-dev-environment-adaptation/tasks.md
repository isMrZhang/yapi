# Tasks
- [x] 任务 1：开发环境现状盘点（Win10 视角）
  - [x] 盘点本地开发最短路径：安装依赖 → 初始化 → 启动后端 → 启动前端 → 访问页面
  - [x] 列出 Win10 常见差异点清单：shell 语义、路径/权限、长路径、文件监听、端口占用、MongoDB 可用性
  - [x] 标注本仓库已知不兼容点（至少包含 `cp -r` 与 `&` 并发）

- [x] 任务 2：跨平台化 package.json scripts（保持脚本名不变）
  - [x] 将 `dev-copy-icon` 从 `cp -r` 替换为跨平台实现（优先使用现有依赖能力）
  - [x] 将 `dev` 的并发启动从 shell 语义改为跨平台实现（不依赖 bash/CMD 的 `&` 差异）
  - [x] 为 PowerShell/CMD 兼容性补齐必要的参数传递方式（如有）

- [x] 任务 3：Win10 watcher 兼容策略落地
  - [x] 评估 nodemon 在 Win10 的监听策略：保留/调整 legacy watch 参数；必要时补充说明
  - [x] 评估 webpack-dev-server 在 Win10 的监听策略：必要时提供 polling 环境变量或配置
  - [x] 为“WSL2 + Windows 文件系统挂载”场景补充性能与 watcher 风险提示（将仓库放入 WSL2 Linux 文件系统）

- [x] 任务 4：补齐 Win10/WSL2 文档与排障清单
  - [x] README 增加 Win10 开发章节：原生方案与 WSL2 方案对比、推荐路径
  - [x] 在部署/二次开发文档（如 `docs/documents/redev.md`）中补齐 Win10 等价命令（复制、编辑、启动）
  - [x] 增加常见问题：Corepack/pnpm、长路径、权限/链接、杀毒软件锁文件、端口冲突、MongoDB（Docker/本地服务）

- [x] 任务 5：验证与回归（本地 + CI）
  - [x] 在 Win10 原生路径进行最小冒烟：`pnpm install --frozen-lockfile`、`pnpm run dev-client`、`pnpm run dev-server`、`pnpm test`
  - [x] （推荐）在 CI 增加 Windows job 的最小校验：install + test（必要时加 build-client 冒烟）

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 2
- 任务 4 可与 任务 2、任务 3 并行推进，但需以 任务 1 的盘点结果为输入
- 任务 5 依赖 任务 2、任务 3、任务 4
