# Tasks
- [x] Task 1: 修复外层和主容器背景色
  - [x] SubTask 1.1: 移除 `Group.scss` 中对 `.m-sider` 的 `$color-bg-dark !important;` 强制背景覆盖。
  - [x] SubTask 1.2: 将 `GroupList.scss` 中 `.group-bar` 的背景色修改回 `#fff`。
  - [x] SubTask 1.3: 将 `GroupList.scss` 中 `.group-operate` 的 `background-color` 和 `ant-input` 的颜色重新修改为适配浅色底色的组合。
- [x] Task 2: 修复文本和图标颜色
  - [x] SubTask 2.1: 移除 `GroupList.scss` 中 `.curr-group`、`.curr-group-name` 和 `.group-operate` 的 `$color-white` 和 `$color-white-secondary` 字体颜色定义，替换为 `$color-text-dark` 或是普通的深灰（如 `#333`, `#999`），确保在白色背景上可读。
- [x] Task 3: 移除破坏性的 Hover 和选中样式
  - [x] SubTask 3.1: 从 `.group-list` 下删除 `.group-item:hover` 和 `.group-item.selected` 强制写的 `$color-blue-deeper` 蓝色背景和白色文字，以让 Ant Design 默认的 Light 主题菜单效果正常渲染。
- [x] Task 4: UI 回归验证
  - [x] SubTask 4.1: 打开 `http://127.0.0.1:3000/group/11`，截屏验证左侧侧边栏是否完全恢复了明亮清爽的白底深字 UI，且鼠标悬停和选中效果正常。

# Task Dependencies
- [Task 4] depends on [Task 1], [Task 2], and [Task 3]