# 代码评审与推送 GitHub Spec

## Why
当前分支已包含一组较大范围的 Node 22+ 后端兼容改动，需要进行系统性代码评审与风险确认，并在评审通过后将提交推送到 GitHub 远端，形成可追溯变更。

## What Changes
- 输出一份覆盖关键风险点的代码评审结论（依赖升级、运行时行为变化、安全、可维护性）
- 校验提交中不包含敏感信息、以及安装/测试/启动的可复现性
- **BREAKING**：如评审发现阻塞问题，新增修复提交（不改写已有历史）以确保最终状态可合并/可发布
- 将当前分支推送到 GitHub 远端（不做强推）

## Impact
- Affected specs: Node 22/24 兼容、依赖安装/锁文件、服务启动、插件加载、Mongo 连接、导入 URL、测试体系
- Affected code: 以最近一次提交（HEAD）变更文件为范围（package.json、server/*、exts/*、tests、lockfile 等）

## ADDED Requirements
### Requirement: 评审输出
系统 SHALL 提供可执行的评审结论，包含：主要改动点、潜在风险、必须修复项、建议改进项、验证结论。

#### Scenario: 评审通过
- **WHEN** 对 HEAD 提交进行评审并完成验证
- **THEN** 输出“通过/不通过”结论
- **AND** 若不通过，列出阻塞项与修复提交计划

### Requirement: 推送到 GitHub
系统 SHALL 在评审通过后将当前分支推送到 `origin`，并确保远端包含对应提交。

#### Scenario: 推送成功
- **WHEN** 执行 push
- **THEN** `origin/<branch>` 指向包含 HEAD 的提交

## MODIFIED Requirements
### Requirement: 安全基线
变更 SHALL 不引入敏感信息泄露风险（例如将 token/密钥写入仓库文件），并避免在日志中输出敏感配置。

## REMOVED Requirements
无

