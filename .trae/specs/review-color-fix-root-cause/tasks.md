# Tasks
- [x] Task 1: 历史构建链对比与 CSS 注入顺序分析
  - [x] SubTask 1.1: 对比 Webpack 4/3 与 Webpack 5 下对 `.scss` 和 `.less` 的处理规则（如 `ExtractTextPlugin` vs `MiniCssExtractPlugin` 分包导致的样式注入顺序反转）。
  - [x] SubTask 1.2: 检查 Ant Design 的基础样式（`reset.less`）与自定义全局样式（`common.scss`）及局部组件样式的加载先后顺序是否发生了颠倒。
- [x] Task 2: Sass/Less 编译器环境变迁分析
  - [x] SubTask 2.1: 调查 Node 版本升级引起的 `node-sass` 到 `sass` (Dart Sass) 的迁移，是否影响了 CSS 的嵌套编译结果或变量透明度处理。
  - [x] SubTask 2.2: 分析诸如 `$color-bg-dark` 这样的变量，为何会在新环境中影响到了原该透明的 `div`。
- [x] Task 3: 浏览器与操作系统的默认行为排查
  - [x] SubTask 3.1: 验证是否因为全局的 `body` / `html` 标签丢失了默认的 `#fff` 背景色，导致操作系统级的 Dark Mode（暗黑模式）直接渗透进了前端应用的透明层（`transparent`）。
- [x] Task 4: 编写根本原因分析报告
  - [x] SubTask 4.1: 综合上述排查结果，编写详细的技术审查与架构级溯源总结报告并交付。

# Task Dependencies
- [Task 4] depends on [Task 1], [Task 2], and [Task 3]