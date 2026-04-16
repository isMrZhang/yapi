# Tasks
- [x] 任务 1：基于 HEAD 提交进行全面代码评审
  - [x] 评审依赖升级与锁文件变更的合理性（Node 22/24 兼容、安装策略、潜在破坏性）
  - [x] 评审后端运行时行为变化与兼容性修复（mongoose、koa-body、@koa/router、插件 require 路径等）
  - [x] 评审安全与维护风险（敏感信息、过期依赖、配置默认值、错误处理）
  - [x] 输出评审结论（通过/不通过）与必须修复项清单

- [x] 任务 2：评审不通过则补充修复提交（不改写历史）
  - [x] 实施最小修复并补充验证
  - [x] 新增修复 commit（禁止 rebase / amend / force push）

- [x] 任务 3：验证（安装/测试/启动）
  - [x] Node 22 下：`npm ci --legacy-peer-deps` + `npm test`
  - [x] Node 24 下：`npm ci --legacy-peer-deps` + `npm test`
  - [x] Node 22 下：最小化启动验证（`node server/app.js` 能监听端口并打印启动信息）

- [x] 任务 4：推送到 GitHub
  - [x] push 当前分支到 origin（不强推）
  - [x] 校验远端包含最新提交（通过 git log / git rev-parse 对比）

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 1（若任务 1 发现阻塞项则先完成任务 2）
- 任务 4 依赖 任务 1、任务 3（以及可能的任务 2）
