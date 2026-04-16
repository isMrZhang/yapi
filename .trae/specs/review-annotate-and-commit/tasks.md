# Tasks
- [x] 任务 1：收集变更范围并完成全面代码评审
  - [x] 汇总 `git status` / `git diff` / `git diff --staged`（若有）变更清单
  - [x] 评审 Node 22/24 兼容性风险（OpenSSL3、弃用 API、原生依赖、安装策略）
  - [x] 评审安全风险（token/crypto、动态执行、依赖漏洞、敏感信息）
  - [x] 评审可维护性（注释/命名/错误处理/测试覆盖）
  - [x] 输出评审结论与必须修复项（若有则进入任务 2）

- [x] 任务 2：按评审结论补充必要且准确的注释（不做无意义注释）
  - [x] token 新旧格式与兼容策略的注释（新 token 默认签发、旧 token 兼容解析、失败回退）
  - [x] 安装策略/peer 冲突处置的注释（为何移除 legacy-peer-deps、为何升级/钉版本）
  - [x] CI 矩阵策略注释（Node 22/24、编译工具链、冒烟策略）
  - [x] 其他评审中发现“非显而易见”的关键逻辑点位补注释

- [x] 任务 3：验证与回归（以 Node 22/24 为基线）
  - [x] `npm ci` 可重复通过
  - [x] `npm test` 通过
  - [x] `npm run build-client` 通过
  - [x] `npm run dev-client` 启动冒烟通过（启动即可）

- [x] 任务 4：提交与推送（遵循 Conventional Commits）
  - [x] 依据 diff 智能分组 stage（避免把临时文件/构建产物提交）
  - [x] 生成 Conventional Commits 提交信息（必要时拆分 1~N 个 commit）
  - [x] push 到 GitHub 远端分支（不强推、不改写历史）
  - [x] 校验远端包含最新提交（rev-parse / log 对比）

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 2（若任务 2 无改动亦需执行验证）
- 任务 4 依赖 任务 1、任务 3
