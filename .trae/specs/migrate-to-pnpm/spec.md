# 将 npm 迁移到高性能 pnpm Spec

## Why
当前项目以 npm + `package-lock.json` 管理依赖，随着依赖规模增长与 Node 22/24 作为基线，安装耗时与磁盘占用成为主要工程成本。pnpm 通过内容寻址存储与链接机制显著提升安装性能与复用率，本规格用于制定并落地从 npm 到 pnpm 的迁移方案，同时保持 Node 22/24 下的构建、测试与开发体验稳定。

## What Changes
- 引入 pnpm 作为项目默认包管理器（通过 `packageManager` + Corepack 固化版本）
- 将锁文件从 `package-lock.json` 迁移到 `pnpm-lock.yaml`
- 将 CI 从 `npm ci` 迁移到 `pnpm install --frozen-lockfile`，并保持 Node 22/24 矩阵验证
- 清理/修复项目中对 npm 命令的硬编码（例如脚本内 `npm install` / `npm run`），统一为 pnpm 命令
- 更新部署/开发文档：补充 pnpm 安装与常用命令，并保留 npm 作为“兼容路径”说明（如确有需要）
- 如遇到 pnpm 的严格依赖解析或非扁平 `node_modules` 结构导致的兼容问题，制定并落地最小化的兼容策略（例如 `public-hoist-pattern`/`node-linker`/`overrides`）

## Impact
- Affected specs:
  - 依赖安装速度与可重复性（本地与 CI）
  - Node 22/24 兼容性验证流水线
  - 开发/构建脚本的包管理器调用方式
  - 文档中的安装与运行指引
- Affected code:
  - [package.json](file:///workspace/package.json)
  - [package-lock.json](file:///workspace/package-lock.json)
  - （新增）`pnpm-lock.yaml`
  - [.github/workflows/node22-24.yml](file:///workspace/.github/workflows/node22-24.yml)
  - [npm-publish.js](file:///workspace/npm-publish.js)
  - 文档：README、docs 中的安装/运行说明（按实际文件改动为准）

## Risk Register
- 中高风险：pnpm 的非扁平 `node_modules` 结构会暴露“隐式依赖/缺失 peer 依赖”问题（npm 下可能因扁平化被掩盖）
  - 处置：优先修复真实依赖关系；必要时采用最小化 hoist 策略（限制范围的 `public-hoist-pattern`）
- 中风险：CI/脚本中存在对 `npm` 的硬编码（例如 `npm-publish.js`），迁移后导致发布/构建脚本失效
  - 处置：逐个脚本梳理并替换为 `pnpm`；对确需使用 npm 的发布链路明确保留并隔离
- 中风险：Corepack 在不同环境默认启用状态不一致，导致 pnpm 版本漂移或不可用
  - 处置：CI 固定使用 `corepack enable` + `corepack prepare pnpm@... --activate`；本地文档给出同样操作
- 低中风险：pnpm 的 store 路径与权限（尤其是容器/CI）可能引发缓存不可用或磁盘占用异常
  - 处置：CI 通过 `actions/setup-node` + pnpm cache 或显式 `pnpm store path` 缓存；必要时配置 `PNPM_HOME`

## Baseline
- Node 目标：`node >= 22`（见 [package.json](file:///workspace/package.json) engines）
- 当前 CI：使用 npm 缓存与 `npm ci`（见 [node22-24.yml](file:///workspace/.github/workflows/node22-24.yml)）
- 关键命令：
  - 测试：`npm test`（ava）
  - 前端构建：`npm run build-client`（webpack）
  - 前端开发：`npm run dev-client`（webpack-dev-server）

## ADDED Requirements
### Requirement: pnpm 作为默认包管理器
系统 SHALL 在仓库层面固化 pnpm 作为默认包管理器，并提供可重复安装的锁文件。

#### Scenario: 安装可重复
- **WHEN** 开发者或 CI 在干净环境执行 `pnpm install --frozen-lockfile`
- **THEN** 安装成功且不会修改锁文件
- **AND** 生成的依赖树可稳定复现

### Requirement: Node 22/24 CI 使用 pnpm
系统 SHALL 在持续集成中对 Node 22 与 Node 24 使用 pnpm 进行安装、测试与构建验证。

#### Scenario: CI 版本矩阵
- **WHEN** CI 触发（PR 与主分支）
- **THEN** Node 22 与 Node 24 均执行 `pnpm install --frozen-lockfile`、`pnpm test`、`pnpm run build-client`
- **AND** 至少在一个 Node 版本上执行最小启动冒烟（例如 `pnpm run dev-client` + timeout）

### Requirement: 脚本与工具链去 npm 硬编码
系统 SHALL 不再在仓库脚本中强依赖 `npm` 命令（除非明确标注为“发布专用链路”且可选）。

#### Scenario: 本地开发使用 pnpm
- **WHEN** 开发者仅安装 pnpm（通过 Corepack）
- **THEN** `pnpm dev`、`pnpm test`、`pnpm run build-client` 可直接工作

## MODIFIED Requirements
### Requirement: 依赖安装策略（从 npm 锁到 pnpm 锁）
现有依赖管理流程 SHALL 从 `package-lock.json` 切换为 `pnpm-lock.yaml`，并以 `pnpm install --frozen-lockfile` 作为 CI 的默认安装策略。

## REMOVED Requirements
### Requirement: `npm ci` 作为默认 CI 安装方式
**Reason**: pnpm 迁移后锁文件与安装语义以 `pnpm-lock.yaml` 为准，`npm ci` 不再是可重复安装的主路径。
**Migration**: CI 与文档统一改为 pnpm；如需保留 npm 兼容路径，必须明确说明其“非默认/不保证与 CI 完全一致”的限制。

