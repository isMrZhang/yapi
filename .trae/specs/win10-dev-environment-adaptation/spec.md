# Win10 开发环境优雅适配 Spec

## Why
当前项目的开发链路在类 Unix 环境下更顺畅（如 `cp -r`、后台并行执行 `&`），在 Win10（PowerShell / CMD）上会出现命令不兼容、文件监听不稳定、路径/权限差异导致的安装与启动失败。此规格旨在制定一套可落地的改造与指引，使 Win10 上能够以最少心智负担稳定完成安装、启动、调试与测试。

## What Changes
- 统一并明确 Win10 支持策略：原生 Windows（推荐 PowerShell 7+）与 WSL2（推荐）两条路径
- 盘点并消除开发脚本中的类 Unix 假设点（如 `cp -r`、`&` 并发、路径分隔符、可执行文件扩展名）
- 为前端/后端开发启动提供跨平台实现（保持 `pnpm run dev`、`pnpm run dev-client`、`pnpm run dev-server` 语义不变）
- 为 Win10 文件监听与热更新提供稳定策略（必要时启用 polling / 调整 watcher 参数）
- 补充 Win10 开发依赖与系统设置指引（Node 22+、pnpm/Corepack、Git、MongoDB、长路径、权限/链接）
- 在 CI 增加（或验证）Windows 环境的最小冒烟，避免回归（可选但推荐）

## Impact
- Affected specs:
  - 本地开发与调试体验（前端 webpack-dev-server、后端 nodemon）
  - 依赖安装与可重复性（pnpm / Corepack / Windows 权限与链接）
  - 文档与新成员上手路径（Win10/WSL2）
  - CI 冒烟（Windows 验证）
- Affected code:
  - [package.json](file:///workspace/package.json)（scripts：`dev`/`dev-copy-icon` 等跨平台化）
  - [nodemon.json](file:///workspace/nodemon.json)（watch 策略的 Win10 兼容校验）
  - [build/webpack.dev.js](file:///workspace/build/webpack.dev.js)（devServer 与 watcher 兼容策略评估）
  - 文档：README、[docs/documents/redev.md](file:///workspace/docs/documents/redev.md) 等（Win10/WSL2 指引补齐）

## ADDED Requirements
### Requirement: Win10 开发基线可运行
系统 SHALL 支持在 Win10 上完成依赖安装、后端启动、前端启动与基本页面访问的闭环，且不要求用户必须安装类 Unix shell。

#### Scenario: Win10 原生安装与启动成功
- **WHEN** 开发者在 Win10（PowerShell）中完成 Node.js 22+ 与 Corepack/pnpm 的安装启用，并执行 `pnpm install --frozen-lockfile`
- **THEN** 依赖安装成功，且不会修改锁文件
- **AND** 执行 `pnpm run dev-server` 后端可正常启动并可访问配置端口
- **AND** 执行 `pnpm run dev-client` 前端 dev server 可正常启动并输出可访问地址

### Requirement: scripts 跨平台且语义不变
系统 SHALL 保持现有脚本名称与语义（尤其是 `dev`/`dev-server`/`dev-client`），并在 Win10 上以跨平台方式实现同等行为。

#### Scenario: 并发启动行为一致
- **WHEN** 开发者执行 `pnpm run dev`
- **THEN** 后端与前端以并行方式启动
- **AND** 任一进程退出时能够以可预期方式结束/提示（以项目既定策略为准）

### Requirement: 资源复制与生成步骤跨平台
系统 SHALL 将开发链路中依赖 `cp -r` 等命令的步骤替换为跨平台实现，且在 Win10 上无需额外依赖 GNU 工具链。

#### Scenario: iconfont 资源复制成功
- **WHEN** 开发者执行 `pnpm run dev-copy-icon`
- **THEN** `static/iconfont` 能被复制到目标目录并可用于前端构建

### Requirement: Win10 watcher 稳定策略
系统 SHALL 在 Win10 环境中提供稳定的文件监听与热更新策略，避免因 watcher 不可靠导致频繁丢失更新。

#### Scenario: 修改源码触发重载
- **WHEN** 开发者在 Win10 修改 `client/` 或 `server/` 下的源码文件
- **THEN** 前端能够触发增量编译/刷新（或按既有策略重载）
- **AND** 后端能够触发重启（nodemon 生效）

### Requirement: 文档提供 Win10 与 WSL2 双路径指引
系统 SHALL 在仓库文档中提供 Win10 原生与 WSL2 的安装、依赖、MongoDB、常见问题与排障清单。

#### Scenario: 新成员可按文档完成上手
- **WHEN** 新成员仅阅读仓库文档并按步骤操作
- **THEN** 能完成 Win10 或 WSL2 任一方案的开发环境搭建与启动闭环

## MODIFIED Requirements
### Requirement: 开发脚本对 shell 的隐式依赖
现有开发脚本 SHALL 不再依赖特定 shell 的行为差异（如 `bash` 的 `&` 后台并发、`cp` 命令），并在 Win10 PowerShell 与类 Unix 环境下表现一致。

## REMOVED Requirements
### Requirement: 依赖类 Unix 命令作为默认开发前提
**Reason**: Win10 原生环境中默认不提供 `cp` 等命令，且 CMD/PowerShell 的语义与 bash 不一致，导致上手门槛与不稳定性上升。
**Migration**: 将相关步骤改为 Node 脚本或跨平台依赖；文档中将“Git Bash/WSL2 作为可选增强”而非硬要求。

