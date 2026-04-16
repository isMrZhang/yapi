# Node 22/24 迁移收尾代码评审与注释补全 Spec

## Why
当前分支包含面向 Node 22/24 的一批收尾整改（token crypto 迁移、依赖与安装策略调整、CI 矩阵等）。需要对改动做一次完整评审、补充必要且准确的注释，随后以规范的提交信息提交并推送到 GitHub，确保变更可审计、可维护、可回滚。

## What Changes
- 全面评审当前工作区/分支的变更（功能正确性、兼容性、安全性、工程化一致性）
- 在“关键且非显而易见”的实现处补充必要注释（避免泛滥注释）
  - token 新旧格式与兼容策略
  - 安装策略/peer 依赖冲突的处置原因
  - CI 矩阵与原生编译工具链策略
- 补齐与注释相关的最小回归验证（单测/构建/启动冒烟）
- 通过后执行 git commit（Conventional Commits）并 push 至 GitHub（不强推、不改写历史）

## Impact
- Affected specs: Node 22/24 兼容性、鉴权 token、依赖治理、CI 验证、前端构建与后端启动冒烟
- Affected code:
  - [server/utils/token.js](file:///workspace/server/utils/token.js)
  - [server/controllers/interface.js](file:///workspace/server/controllers/interface.js)
  - [server/utils/mongoose-auto-increment.js](file:///workspace/server/utils/mongoose-auto-increment.js)
  - [package.json](file:///workspace/package.json)
  - [.npmrc](file:///workspace/.npmrc)
  - [.github/workflows/node22-24.yml](file:///workspace/.github/workflows/node22-24.yml)
  - [test/server/token.test.js](file:///workspace/test/server/token.test.js)
  - [test/server/nodemailer.test.js](file:///workspace/test/server/nodemailer.test.js)
  - [test/server/node-schedule.test.js](file:///workspace/test/server/node-schedule.test.js)

## ADDED Requirements
### Requirement: 代码评审结论
系统 SHALL 输出对当前变更的评审结论（通过/不通过）以及必须修复项列表（若有）。

#### Scenario: 评审通过
- **WHEN** 审查变更范围与风险项
- **THEN** 不存在阻断合并/发布的功能或安全问题
- **AND** 已给出必要注释与验证结果

### Requirement: 注释补全（最小且准确）
系统 SHALL 仅在关键逻辑处补充注释，且注释必须准确描述“为什么这样做/兼容策略/安全约束”，避免重复代码字面含义。

#### Scenario: Token 兼容注释
- **WHEN** 阅读 token 加解密实现
- **THEN** 能清晰理解新 token 格式、旧 token 兼容期行为与边界条件

### Requirement: 规范提交与推送
系统 SHALL 使用 Conventional Commits 生成提交信息、合理分组 stage/commit，并推送至 GitHub 远端分支。

#### Scenario: 提交与推送
- **WHEN** 评审通过且验证通过
- **THEN** 产生 1~N 个逻辑清晰的提交
- **AND** push 到远端且远端包含提交

## MODIFIED Requirements
### Requirement: 变更不得引入敏感信息
本次提交 SHALL 不包含任何密钥、token、账号口令、私有证书或内部 URL 凭据等敏感信息。

