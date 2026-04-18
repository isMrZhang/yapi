# Tasks
- [x] Task 1: 样式排查与审计
  - [x] SubTask 1.1: 扫描 `client` 目录下所有的 `.scss` 和 `.less` 文件，寻找注释掉的背景色或缺失背景色的重要容器类。
  - [x] SubTask 1.2: 检查全局布局组件（如 `BasicLayout`, `Header`, `Footer`, `Sider`）的根节点是否都有正确的背景色声明。
- [x] Task 2: 实施样式修复
  - [x] SubTask 2.1: 规范化之前修复的 `.left-menu` 背景色缺失问题，检查是否符合组件主题规范（使用 `#fff` 等变量）。
  - [x] SubTask 2.2: 修复其他发现的潜在透明背景导致变黑的区块（特别是弹出层、下拉菜单和 Tab 面板）。
- [x] Task 3: 严格的代码评审
  - [x] SubTask 3.1: 审查所有变更的 CSS/SCSS/LESS 文件，确保未引入破坏性样式。
  - [x] SubTask 3.2: 确认修复符合 Ant Design 的覆盖规范以及 YApi 的原有主题配置。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]