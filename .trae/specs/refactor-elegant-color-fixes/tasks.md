# Tasks
- [x] Task 1: 撤销硬编码颜色，恢复主题变量
  - [x] SubTask 1.1: 将 `GroupList.scss` 中的 `.curr-group` 和 `.group-operate` 恢复为原有的深色主题变量 `$color-bg-dark`。
  - [x] SubTask 1.2: 还原相关的文字颜色变量（如将 `#333`, `#999`, `#929aac` 恢复为 `$color-white`, `$color-white-secondary` 等）。
  - [x] SubTask 1.3: 检查 `GroupList.scss` 以外近期修改过的类似硬编码色值，并用已有变量（如 `$color-text-dark`, `@component-background`）替代。
- [x] Task 2: 全局层级兜底背景色设定
  - [x] SubTask 2.1: 在 `common.scss` 中，在 `body` 或 `html` 级别添加全局白色/浅灰底色（`#fff`），以彻底切断操作系统的暗黑模式穿透到页面的透明层。
- [x] Task 3: 侧边栏布局高度修复
  - [x] SubTask 3.1: 既然左侧边栏（如 `.group-bar`）恢复了深色，需要确保该容器的高度能延伸到视口底部（如通过 `min-height: 100vh;`、`flex` 撑开或 `.m-group` 层级的高度调整），防止半截深色块悬空。
- [x] Task 4: UI 回归与评审
  - [x] SubTask 4.1: 启动应用并检查 `http://127.0.0.1:3000/group/11` 等路径，确保侧边栏视觉完美，且不存在“异常黑块”或文字不可见的问题。

# Task Dependencies
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2] and [Task 3]