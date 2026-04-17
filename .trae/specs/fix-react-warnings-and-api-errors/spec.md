# 前端告警与接口异常修复 Spec

## Why
开发环境访问页面时出现多类控制台告警与报错：React 废弃生命周期警告、版本检查请求触发 CORS/404、以及后端返回 `this.model.update is not a function` 导致前端出现未捕获的 Promise 错误与提示条。这些问题会降低开发体验并可能引发白屏/交互中断，需要按最佳实践系统性治理。

## What Changes
- **修复 mongoose v7 兼容性**：将服务端与插件模型层中已移除的 `Model.update()` / `Model.remove()` 全量替换为 `updateOne/updateMany` 与 `deleteOne/deleteMany`，避免运行时报 `not a function`。
- **治理 React 废弃生命周期**：把项目源码中 `componentWillMount` / `componentWillReceiveProps` 等旧生命周期迁移到 `componentDidMount` / `componentDidUpdate`（必要时用 `getDerivedStateFromProps` 或移除 props→state 镜像），消除 React 16.14 DEV 警告并为 React 17+ 做准备。
- **消除 antd LocaleProvider 警告**：升级 antd 到稳定的 3.x 末期版本（不引入 antd v4 破坏性变更），并在升级后确认 `LocaleProvider` 不再使用旧生命周期导致的警告；若仍存在，调整入口的国际化包裹方式为新版 antd 的推荐写法（例如 `ConfigProvider`，以最终安装版本为准）。
- **版本通知改为同源请求，避免 CORS**：移除浏览器直连 `fastmock.site` 的硬编码请求，改为服务端代理接口（例如 `GET /api/system/version`）并通过 `config.json` 运行时开关控制是否展示版本通知。
- **前端错误处理降噪**：调整 [messageMiddleware.js](file:///workspace/client/reducer/middleware/messageMiddleware.js) 对服务端错误的处理方式，避免“显示 toast 后再 throw 导致 Uncaught (in promise)”的双重噪音；仍保留对未登录等关键错误码的跳转逻辑。

## Impact
- Affected specs: 开发环境稳定性、页面渲染与交互稳定性、升级 React/antd 的可持续性、版本通知可用性与可配置性。
- Affected code:
  - 服务端模型：`server/models/*.js` 与 `exts/*/*Model.js`
  - 前端：`client/index.js`、`client/components/**`、`client/containers/**`、`exts/**`（前端插件页）
  - 服务端路由/控制器：`server/router.js`、`server/controllers/base.js`（登录态接口扩展）及新增 `system` 控制器
  - 文档/示例配置：`docs/devops/index.md`、`config_example.json`

## ADDED Requirements
### Requirement: 版本通知同源化
系统 SHALL 通过同源接口提供版本通知数据，不允许前端在默认配置下直连外域版本源从而触发浏览器 CORS。

#### Scenario: 开启版本通知
- **WHEN** 管理员登录且 `config.json` 中显式开启版本通知
- **THEN** 前端展示版本通知并从同源接口成功获取版本信息

#### Scenario: 关闭版本通知（默认）
- **WHEN** 未开启版本通知
- **THEN** 前端不渲染通知组件、不发起版本请求

### Requirement: mongoose v7 兼容
系统 SHALL 不再调用 mongoose v7 已移除的 `Model.update()` / `Model.remove()`，并保证相关接口正常工作（不出现 `this.model.update is not a function`）。

## MODIFIED Requirements
### Requirement: React 兼容性告警治理
系统在开发模式下 SHALL 不再输出项目源码触发的 `componentWillMount/componentWillReceiveProps` 废弃生命周期警告。

## REMOVED Requirements
### Requirement: 浏览器直连 fastmock 版本源
**Reason**: 直连外域易被 CORS 拦截且 URL 不可控，失败时会污染控制台与影响体验。
**Migration**: 改为服务端代理 + 配置开关控制。
