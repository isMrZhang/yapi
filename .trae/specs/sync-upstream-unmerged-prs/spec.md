# YApi 上游未合并 PR 同步评审与迁入 Spec

## Why
当前 fork 与上游（YMFE/yapi）存在 PR 积压与分叉风险，需要把上游未合并的 PR 纳入 fork 的维护闭环：逐项评审、必要修订、验证后合入 fork，以降低长期维护成本并提升前端交付质量。

## What Changes
- 拉取上游仓库（YMFE/yapi）所有未合并 PR（包含 Open PR + Closed 但未合并 PR）并建立可追踪的处理队列
- 对每个 PR 进行严谨的代码评审与业务审查（以前端为主，覆盖构建链路与 UI/交互/兼容性）
- 对通过评审的 PR：将变更迁入 fork（必要时做最小改造以适配 fork 当前状态），在 fork 内以“1 upstream PR ↔ 1 fork PR”的方式合入目标分支
- 对不通过评审或不适配的 PR：在 fork 侧保留审查结论与拒绝理由，不强行迁入
- 建立一致的验证门禁（lint / build / test / 前端冒烟）与合并策略（保持可回滚与可审计）

## Impact
- Affected specs: PR 拉取与分类、评审标准化、迁入/修订流程、验证与合并门禁
- Affected code: 取决于上游 PR 涉及范围，通常包含 `client/`、`webpack/构建配置`、`server/`（若 PR 涉及前后端耦合点）、`common/`、`config/`

## ADDED Requirements
### Requirement: 上游 PR 清单与状态机
系统 SHALL 支持从 YMFE/yapi 获取“Open PR + Closed 未合并 PR”的列表，并为每个 PR 维护可追踪的处理状态：
`待评审 → 评审中 → (迁入中 → 验证中 → 已合入) / (拒绝迁入) / (需要上游补充信息)`

#### Scenario: 拉取上游 PR 清单成功
- **WHEN** 维护者执行“同步 PR 清单”流程
- **THEN** 得到包含 PR 编号、标题、作者、状态（open/closed）、是否已合并、修改文件路径、标签、最后更新时间、是否 draft 的清单

#### Scenario: Closed 未合并 PR 的识别
- **WHEN** PR 处于 closed 状态
- **THEN** 系统通过 `merged`/`mergedAt` 等字段判定其是否未合并；若未合并则进入处理队列

### Requirement: 评审标准与结论输出
系统 SHALL 对每个上游 PR 产出可审计的评审结论（通过/不通过/需要补充信息）与理由，且覆盖以下维度：
- 前端架构与可维护性（边界、模块职责、复杂度、可读性）
- 构建与发布风险（webpack/rollup/node 版本、依赖变更、产物一致性）
- UI/交互与一致性（视觉、交互、可用性、i18n、a11y 基线）
- 兼容性（浏览器/Node、Polyfill、API 兼容）
- 安全与合规（XSS/CSRF、依赖风险、敏感信息、注入点）
- 业务审查（需求合理性、默认行为、向后兼容、升级/迁移成本）

#### Scenario: 评审通过
- **WHEN** PR 满足质量门禁且与 fork 维护目标一致
- **THEN** 在 fork 创建对应 PR 并进入“迁入中/验证中”直至合入目标分支

#### Scenario: 评审不通过
- **WHEN** PR 存在阻塞问题（安全/破坏性/不可维护/与现有架构冲突）
- **THEN** 在 fork 保留拒绝理由（含必须修复项），该 PR 标记为“拒绝迁入”

### Requirement: 迁入策略（1 upstream PR ↔ 1 fork PR）
系统 SHALL 对每个可迁入的上游 PR，在 fork 内创建独立分支与独立 PR，分支与 PR 需满足：
- 可追踪：分支/PR 标题包含 upstream PR 编号与标题摘要
- 可审计：PR 描述包含 upstream PR 链接、差异摘要、关键风险点与验证结果
- 可回滚：不把多个上游 PR 混在同一 fork PR（除非存在强耦合且在评审结论中说明）

#### Scenario: 迁入过程中存在冲突
- **WHEN** 上游 PR 与 fork 现状发生冲突
- **THEN** 采用最小改动原则解决冲突，并在 fork PR 中记录冲突来源与解决策略

#### Scenario: 上游 PR 依赖其他上游 PR
- **WHEN** 上游 PR 存在依赖关系（例如基于另一个 PR 的提交或共用改动）
- **THEN** 先迁入其依赖 PR，或在 fork 中建立基底分支并在 tasks 中显式记录依赖关系

### Requirement: 验证门禁
系统 SHALL 在合入 fork 之前对每个 fork PR 执行至少以下验证：
- 安装可重复（锁文件一致、无临时依赖注入）
- 前端构建通过（如 `build-client` 或对应构建命令）
- 单测/关键脚本通过（若仓库已有测试基线则必须通过）
- 前端冒烟（最小可启动或可访问关键页面）

#### Scenario: 验证失败
- **WHEN** 验证任一环节失败
- **THEN** 在 fork PR 内补充修复提交并重新验证；若无法在合理范围内修复则回退为“拒绝迁入/需要补充信息”

## MODIFIED Requirements
### Requirement: Fork 维护流程（新增上游 PR 迁入闭环）
fork 维护流程 SHALL 将“上游 PR 评审与迁入”纳入常规工作流，并通过 fork 内 PR 的方式完成合并，以保证审计与可追溯。

## REMOVED Requirements
无

