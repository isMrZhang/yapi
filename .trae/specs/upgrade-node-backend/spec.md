# 后端 Node 版本升级（Node 22+）Spec

## Why
当前项目依赖生态定位在 Node 7/8 时代，无法在现代 Node（22/24）稳定安装与运行。升级 Node 能降低安全风险、提升可维护性，并让后端在新环境中可持续运行。

## What Changes
- 明确后端运行目标为 **Node 22+**（尽量兼容 Node 24）
- 调整依赖安装来源与锁文件策略，避免过期 registry 导致的安装失败
- 升级后端关键依赖（Mongo/Mongoose、Koa 生态、上传/解析等）以适配 Node 22+
- 修复与现代 Node 不兼容或不推荐的后端代码用法（例如 Buffer、过时 HTTP 客户端、模块解析 hack）
- **BREAKING**：后端依赖大版本升级可能改变部分运行时行为（Mongo 连接、上传解析、路由中间件顺序等），需要回归验证

## Impact
- Affected specs: 依赖安装、后端启动、数据库连接、导入/拉取外部 URL、文件上传/二进制处理、插件加载
- Affected code:
  - [package.json](file:///workspace/package.json)
  - [server/utils/db.js](file:///workspace/server/utils/db.js)
  - [server/app.js](file:///workspace/server/app.js)
  - [server/controllers/open.js](file:///workspace/server/controllers/open.js)
  - [server/controllers/test.js](file:///workspace/server/controllers/test.js)
  - [server/controllers/user.js](file:///workspace/server/controllers/user.js)

## ADDED Requirements
### Requirement: Node 22+ 兼容
系统 SHALL 在 Node 22（LTS）上完成依赖安装、通过单元测试、并可启动后端服务进程。

#### Scenario: Node 22 安装与测试
- **WHEN** 在 Node 22 环境执行依赖安装与测试命令
- **THEN** 安装过程不因 registry 证书过期/不可达而失败
- **AND** 单元测试可执行（允许新增/调整少量测试以适配）

### Requirement: Node 24 尽量兼容
系统 SHOULD 在 Node 24 环境下完成依赖安装与测试，若存在不可控的三方依赖断点，需要在文档中明确限制与替代方案。

#### Scenario: Node 24 安装与测试
- **WHEN** 在 Node 24 环境执行依赖安装与测试命令
- **THEN** 安装与测试可通过，或输出明确的降级/替代说明

## MODIFIED Requirements
### Requirement: 外部 URL 拉取实现
现有导入逻辑中通过 `request` 进行外部 URL 拉取的实现 SHALL 替换为项目已使用的现代 HTTP 客户端能力（例如 axios 或 Node 内置 fetch），并保持行为一致（超时/错误处理/返回体）。

#### Scenario: 通过 URL 导入
- **WHEN** 用户通过导入接口传入 URL（或 content 为 URL）
- **THEN** 服务端可拉取内容并解析
- **AND** 网络/解析错误返回与现有接口格式兼容

### Requirement: 二进制处理兼容
现有代码中的 `new Buffer(...)` 用法 SHALL 替换为 `Buffer.from`/`Buffer.alloc`，并保持功能一致。

## REMOVED Requirements
### Requirement: 运行时 NODE_PATH 模块解析注入
**Reason**: 运行时修改 `NODE_PATH` 和调用 `Module._initPaths()` 会引入不可预期的模块解析行为，并在现代 Node 环境下增加维护与安全风险。
**Migration**: 使用显式相对路径、或通过构建/运行参数实现可控的模块解析，不再依赖运行时注入。

