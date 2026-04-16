# Node 22/24 全面兼容性收尾与风险整改 Spec

## Why
当前仓库已完成后端与前端构建链对 Node 22/24 的主要迁移，但仍存在若干“高风险/隐性风险”（crypto 旧 API、可选原生依赖、过旧运行时依赖、安装策略掩盖问题、缺少 Node 22/24 持续验证）。本规格旨在系统性收敛剩余风险，使项目全面符合最新 Node 22/24 的运行与工程化要求。

## What Changes
- 增加 Node 22/24 兼容性“风险清单”与对应的整改策略（依赖、代码、CI、安装策略）
- 修复或替换在 Node 22/24 + OpenSSL 3 环境下存在兼容/安全风险的 crypto 旧用法（token 加解密）
- 为可能触发编译的可选原生依赖制定策略（保证安装稳定性：工具链/omit optional/锁定版本）
- 清理或升级过旧且维护风险高的运行时依赖（request、nodemailer、node-schedule、vm2 等）
- 逐步移除会掩盖问题的安装策略（例如 legacy-peer-deps），用可控方式解决真实 peer 冲突
- 建立 Node 22/24 的持续验证（CI 版本矩阵：安装、测试、构建、关键启动冒烟）

## Impact
- Affected specs:
  - 依赖安装稳定性与可重复性
  - 后端鉴权/令牌（token）加解密
  - 生产/CI 构建与单测回归
  - 安全与依赖维护策略
- Affected code:
  - [server/utils/token.js](file:///workspace/server/utils/token.js)
  - [package.json](file:///workspace/package.json)
  - [package-lock.json](file:///workspace/package-lock.json)
  - [.npmrc](file:///workspace/.npmrc)
  - （新增）CI workflows（例如 `.github/workflows/node.yml`，或与你们当前 CI 平台对应的配置）

## Risk Register
- 高风险：token 加解密使用历史 crypto API（`createCipher/createDecipher`），存在 Node 22/24 + OpenSSL 3 兼容与安全风险
  - 位置：[token.js](file:///workspace/server/utils/token.js)
- 高风险：存在会触发 install script/编译的可选依赖（不同镜像/CI 条件下可能导致 `npm ci` 失败或耗时剧增）
  - 证据：[package-lock.json](file:///workspace/package-lock.json)
- 中高风险：运行时依赖过旧且维护不足（request/nodemailer/node-schedule/vm2），在 Node 24 上的 TLS/事件循环/安全公告方面风险累积
  - 位置：[package.json](file:///workspace/package.json)
- 中风险：`.npmrc` 通过 `legacy-peer-deps` 掩盖 peer 冲突，导致不同 npm/Node 组合下依赖解析不一致
  - 位置：[.npmrc](file:///workspace/.npmrc)
- 中风险：缺少 Node 22/24 持续集成版本矩阵，迁移风险无法持续收敛

## Baseline
- Node/NPM 目标：`node >= 22`、`npm >= 10`（见 [package.json](file:///workspace/package.json) engines）
- 关键命令：`npm test`（ava）、`npm run build-client`（webpack prod）、`npm run dev-client`（webpack serve）

## vm2 处置方案
- 当前用途：服务端沙箱执行通过 [sandbox.js](file:///workspace/server/utils/sandbox.js) 使用 safeify（间接依赖 vm2）
- 阶段 1（本次整改范围）：保持 safeify/vm2 依赖链可在 Node 22/24 安装与单测通过；将风险纳入依赖升级与 CI 矩阵监控
- 阶段 2（后续里程碑）：将“执行不可信脚本”的能力迁移到更强隔离方案（进程级隔离或 `isolated-vm`），并为高风险输入添加白名单/资源配额策略

## 交付说明
- 验证范围：`npm ci`、`npm test`、`npm run build-client`、`npm run dev-client` 启动冒烟
- Node 22/24：通过 GitHub Actions 版本矩阵固化验证（见 `.github/workflows/node22-24.yml`）
- 已知告警：
  - AVA 测试中来自 ajv@5 的 `url.parse` 弃用告警（第三方依赖内部调用）
  - 前端构建中 sass-loader/Dart Sass 的 legacy API 与 `@import` 弃用告警（不影响构建产出）

## ADDED Requirements
### Requirement: Node 22/24 持续验证
系统 SHALL 在持续集成中对 Node 22 与 Node 24 执行一致的关键流水线步骤，并在失败时阻断合并。

#### Scenario: CI 版本矩阵
- **WHEN** CI 触发（PR 与主分支）
- **THEN** Node 22 与 Node 24 均执行 `npm ci`、`npm test`、`npm run build-client`
- **AND** 关键启动冒烟（后端启动与前端 dev server 启动）至少覆盖一种环境

### Requirement: 安装稳定性（含可选原生依赖）
系统 SHALL 在 Node 22/24 下保持依赖安装稳定；对于可选原生依赖，必须明确采用“可编译”或“可省略”的策略，并在 CI 中验证。

#### Scenario: 安装策略明确且可验证
- **WHEN** 在无预装编译工具链的环境执行安装
- **THEN** 要么安装依然可通过（例如 omit optional），要么 CI/镜像明确安装编译工具链并通过验证

### Requirement: Token 加解密符合现代 Node/OpenSSL 3
系统 SHALL 使用现代、明确参数的加密 API（例如 `createCipheriv/createDecipheriv` + 随机 IV），并提供兼容迁移策略以避免线上用户 token 大面积失效。

#### Scenario: 新 token 生成与验证
- **WHEN** 服务端签发新 token
- **THEN** token 采用新格式生成，并可被校验与解密

#### Scenario: 旧 token 兼容期
- **WHEN** 用户携带旧格式 token 请求
- **THEN** 服务端仍可在兼容期内识别并验证旧 token
- **AND** 在响应中以策略引导换发新 token（按现有业务流程实现）

## MODIFIED Requirements
### Requirement: 依赖治理与安全维护
现有依赖管理流程 SHALL 具备最小可维护性：对已停止维护或存在高风险公告的依赖，必须提供“升级/替换/隔离”的明确方案，并在 Node 22/24 环境回归验证关键路径。

## REMOVED Requirements
### Requirement: 通过 legacy-peer-deps 规避依赖冲突
**Reason**: `legacy-peer-deps` 会掩盖真实 peer 依赖冲突，导致不同 npm/Node 组合下表现不一致，并使 Node 24 的依赖升级风险不可控。
**Migration**: 使用明确的依赖升级、版本钉定（overrides）或替换方案解决 peer 冲突；安装策略回归默认严格模式，并用 CI 固化。 
