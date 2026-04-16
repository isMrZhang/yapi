# Tasks
- [x] 任务 1：盘点现有构建入口与产物约定
  - [x] 明确 Webpack entry（client 入口文件、vendor 分包策略、动态 import/路由）
  - [x] 明确产物约定（static/prd 路径、assets.js 格式、gzip、moment locale 替换、publicPath）
  - [x] 明确插件 client 注入机制（client/plugin-module.js 生成时机与引用点）

- [x] 任务 2：引入 Webpack 5 构建骨架（与现有代码兼容）
  - [x] 新增 Webpack 5 配置（dev/prod 分离或单配置多模式）
  - [x] 引入并配置必要依赖：webpack、webpack-cli、webpack-dev-server、@babel/core、babel-loader、MiniCssExtractPlugin 等
  - [x] 迁移 loader/plugin：ExtractTextPlugin → MiniCssExtractPlugin；url-loader → asset modules（或兼容方案）
  - [x] 保持输出命名尽量一致：`[name]@[contenthash].js`（并在 assets.js 中映射为原先结构）
  - [x] 保持 gzip 产物生成（compression-webpack-plugin 可升级继续用）

- [x] 任务 3：迁移 npm scripts（保持命令语义）
  - [x] `build-client`：由 `ykit pack -m` 替换为 `webpack --mode production ...`
  - [x] `dev-client`：由 `ykit s -p 4000` 替换为 `webpack serve --port 4000 ...`
  - [x] 保留/替换原有插件 module 生成步骤（构建前自动生成 `client/plugin-module.js`）

- [x] 任务 4：移除或隔离旧构建依赖
  - [x] 评估并移除 ykit / happypack / extract-text-webpack-plugin 等对新链路无用的依赖
  - [x] 若短期无法移除，则将其从默认 scripts 中剥离，避免 Node 22+ 下误触发

- [x] 任务 5：验证与回归
  - [x] Node 22：`npm ci` 后执行 `npm run build-client` 成功并生成 `static/prd/assets.js`
  - [x] Node 22：`npm run dev-client` 可启动（端口 4000）
  - [x] Node 24：重复上述验证
  - [x] 确认后端在新产物下仍能通过 `server/app.js` 的静态资源逻辑访问页面

# Task Dependencies
- 任务 2 依赖 任务 1
- 任务 3 依赖 任务 2
- 任务 4 依赖 任务 3
- 任务 5 依赖 任务 2、任务 3
