# Tasks
- [x] Task 1: 补充注入 Node.js 核心全局变量
  - [x] SubTask 1.1: 检查 `package.json`，如果缺失 `process` 依赖包，则使用 `pnpm add process -D` 进行安装。
  - [x] SubTask 1.2: 修改 `build/webpack.common.js` 的 `plugins` 数组，加入 `new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'], process: 'process/browser' })`。

# Task Dependencies
无。所有任务可独立顺序执行。