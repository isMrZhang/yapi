# Tasks
- [x] 任务 1：锁定 Node 22+ 目标与本地/CI 执行方式
  - [x] 梳理当前项目声明的 engines、启动命令、测试命令，并给出 Node 22/24 的推荐使用方式
  - [x] 更新 package.json 中的 engines（仅提升下限，不影响语义版本策略）

- [x] 任务 2：修复依赖安装来源与锁文件策略（避免证书过期/不可达）
  - [x] 调整 npm 配置（移除/替换过期的 registry 与 node-sass 镜像配置）
  - [x] 重新生成 lockfile（升级到现代 lockfileVersion）并确保 Node 22/24 安装一致

- [x] 任务 3：后端依赖升级（以 Node 22+ 运行与测试为标准）
  - [x] 升级 mongoose/mongodb 相关依赖并修复连接参数与行为差异
  - [x] 升级 Koa 生态关键中间件（路由、body 解析、静态资源、websocket 等）并确保接口行为不破坏
  - [x] 评估并升级存在明显 Node 22+ 断点的依赖（例如 ldapjs、vm2、jsonwebtoken 等），必要时替换为兼容实现

- [x] 任务 4：后端源码兼容性修复
  - [x] 将 `new Buffer(...)` 替换为 `Buffer.alloc/Buffer.from`
  - [x] 将 `request` 替换为 axios 或 Node fetch，并保证导入 URL 的行为一致
  - [x] 移除运行时 `NODE_PATH`/`Module._initPaths()` 注入并修复模块引用路径

- [x] 任务 5：验证与回归
  - [x] 在 Node 22 下运行 `npm test` 并修复失败用例
  - [x] 在 Node 24 下运行 `npm test` 并修复失败用例或明确限制
  - [x] 提供最小化启动验证方式（连接 Mongo 后可启动服务且无启动期报错）

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 2
- 任务 4 依赖 任务 3
- 任务 5 依赖 任务 2、任务 3、任务 4
