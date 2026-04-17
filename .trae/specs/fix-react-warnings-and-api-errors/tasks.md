# Tasks
- [x] Task 1: 修复 mongoose v7 模型层不兼容（update/remove）
  - [x] SubTask 1.1: 替换 `server/models` 中所有 `this.model.update(` 为 `updateOne/updateMany`（根据是否 `multi:true`、是否唯一条件决定）。
  - [x] SubTask 1.2: 替换 `server/models` 中所有 `this.model.remove(` / `.remove(` 为 `deleteOne/deleteMany`（根据业务语义决定）。
  - [x] SubTask 1.3: 替换 `exts` 插件模型中 `update/remove` 的同类用法（wiki、advanced-mock、swagger-auto-sync 等）。
  - [x] SubTask 1.4: 用最小回归路径验证：管理员访问 `/group/:id`、项目页与接口页不再出现 `this.model.update is not a function`。

- [x] Task 2: 治理 React 废弃生命周期（项目源码）
  - [x] SubTask 2.1: 清点所有 `componentWillMount/componentWillReceiveProps` 命中点（含 `client` 与 `exts` 前端插件页），按“高风险组件优先”改造为 `componentDidMount/componentDidUpdate`。
  - [x] SubTask 2.2: 对“仅做 props→state 镜像”的组件，改为直接使用 props 或在 `componentDidUpdate` 做受控同步，避免状态漂移。
  - [x] SubTask 2.3: 运行开发环境并确认控制台不再出现项目源码导致的生命周期警告（允许第三方依赖残留但需记录清单）。

- [x] Task 3: 处理 antd LocaleProvider 生命周期警告
  - [x] SubTask 3.1: 将 `antd@3.2.2` 升级到稳定的 3.x 末期版本（不升级到 antd v4），并回归验证 LocaleProvider 不再触发旧生命周期警告。
  - [x] SubTask 3.2: 若升级后仍有告警，改造入口国际化包裹方式为该版本 antd 的推荐实现（以实际安装版本为准），并确保无新增 UI 破坏。

- [x] Task 4: 版本通知去 CORS（同源化 + 配置开关）
  - [x] SubTask 4.1: 新增服务端同源接口（建议 `GET /api/system/version`）由服务端请求版本源 URL，增加超时与简单缓存，限制管理员可访问。
  - [x] SubTask 4.2: 扩展登录态接口返回运行时配置（建议在 [base.js:getLoginStatus](file:///workspace/server/controllers/base.js#L182-L203) 返回体增加 `versionNotify` 配置）。
  - [x] SubTask 4.3: 前端仅在 `versionNotify.enable === true` 时渲染 Notify，并将 [Notify.js](file:///workspace/client/components/Notify/Notify.js) 的请求改为同源接口；失败时静默降级不影响主界面。
  - [x] SubTask 4.4: 更新 [docs/devops/index.md](file:///workspace/docs/devops/index.md) 与 `config_example.json`，明确默认关闭、可配置版本源 URL 与管理员可见规则。

- [x] Task 5: 前端错误处理降噪（避免 Uncaught in promise）
  - [x] SubTask 5.1: 调整 [messageMiddleware.js](file:///workspace/client/reducer/middleware/messageMiddleware.js) 的异常传播策略：展示 toast 后不再无条件 throw；保留对关键错误码（如未登录）的原行为。
  - [x] SubTask 5.2: 验证：控制台不再出现 `Uncaught (in promise)`（由中间件抛出）与顶部错误提示条。

# Task Dependencies
- Task 5 依赖 Task 1/Task 4 的落地效果（否则仍会有服务端错误触发前端异常链路）。
